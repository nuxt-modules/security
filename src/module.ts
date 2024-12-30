import { defineNuxtModule, addServerHandler, installModule, addVitePlugin, addServerPlugin, createResolver, addImportsDir, useNitro, addServerImports } from '@nuxt/kit'
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { join, isAbsolute } from 'pathe'
import { defu } from 'defu'
import viteRemove from 'unplugin-remove/vite'
import { getHeadersApplicableToAllResources } from './utils/headers'
import { generateHash } from './utils/crypto'
import { defuReplaceArray } from './utils/merge'
import { defaultSecurityConfig } from './defaultConfig'
import type { Nuxt } from '@nuxt/schema'
import type { Nitro } from 'nitropack'
import type { ModuleOptions } from './types/module'

export * from './types/module'
export * from './types/headers'
export * from './types/middlewares'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjs/security',
    configKey: 'security'
  },
  async setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)
    
    nuxt.options.build.transpile.push(resolver.resolve('./runtime'))

    // First merge module options with default options
    const strict = options.strict || nuxt.options.security?.strict || nuxt.options.runtimeConfig.security?.strict || false
    nuxt.options.security = defuReplaceArray(
      { ...options, ...nuxt.options.security },
      {
        ...defaultSecurityConfig(nuxt.options.devServer.url, strict)
      }
    )

    // Then transfer basicAuth to private runtimeConfig
    nuxt.options.runtimeConfig.private = defu(
      nuxt.options.runtimeConfig.private,
      {
        basicAuth: nuxt.options.security.basicAuth
      }
    )
    delete (nuxt.options.security as any).basicAuth

    // Lastly, merge runtimeConfig with module options
    nuxt.options.runtimeConfig.security = defu(
      nuxt.options.runtimeConfig.security,
      {
        ...nuxt.options.security
      }
    )

    // At this point we have all security options merged into runtimeConfig
    const securityOptions = nuxt.options.runtimeConfig.security

    // Disable module when `enabled` is set to `false`
    if (!securityOptions.enabled) { return }

    // Register transform plugin to remove loggers
    if (securityOptions.removeLoggers) {
      if (securityOptions.removeLoggers !== true) {
        // Uses the legacy unplugin-remove plugin method
        // This method is deprecated and will be removed in the future
        addVitePlugin(viteRemove(securityOptions.removeLoggers))

      } else if (!nuxt.options.dev) {
        // Uses the native method by Vite, except in dev mode
        // Vite can use either esbuild or terser
        if (nuxt.options.vite.build?.minify === 'terser') {
          // In case of terser, set the drop_console and drop_debugger options
          nuxt.options.vite.build = defu(
            {
              terserOptions: { compress: { drop_console: true, drop_debugger: true } }
            },
            nuxt.options.vite.build
          )
        } else {
          // In case of esbuild, set the drop option
          nuxt.options.vite.esbuild = defu(
            { 
              drop: ['console', 'debugger'] as ('console' | 'debugger')[],
            },
            nuxt.options.vite.esbuild
          )
        }
      }
    }

    // Copy security headers that apply to all resources into standard route rules
    // First insert global security config
    if (securityOptions.headers) {
      const globalSecurityHeaders = getHeadersApplicableToAllResources(securityOptions.headers)
      nuxt.options.nitro.routeRules = defuReplaceArray(
        { '/**' : { headers: globalSecurityHeaders } },
        nuxt.options.nitro.routeRules
      )
    }
    // Then insert route specific security headers
    for (const route in nuxt.options.nitro.routeRules) {
      const rule = nuxt.options.nitro.routeRules[route]
      if (rule.security && rule.security.headers) {
        const { security : { headers } } = rule
        const routeSecurityHeaders = getHeadersApplicableToAllResources(headers)
        nuxt.options.nitro.routeRules[route] = defuReplaceArray(
          { headers: routeSecurityHeaders },
          rule
        )
      }
    }
    
    // Register nitro plugin to manage security rules at the level of each route
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/00-routeRules'))

    // Register nitro plugin to enable Subresource Integrity
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/20-subresourceIntegrity'))

    // Register nitro plugin to enable CSP Hashes for SSG
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/30-cspSsgHashes'))

    // Nitro plugin to enable CSP Nonce for SSR
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/40-cspSsrNonce'))

    // Register nitro plugin to update CSP with actual nonce or hashes
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/50-updateCsp'))

    // Recombine HTML from DOM tree
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/60-recombineHtml'))

    // Register nitro plugin to insert Security Headers in response
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/70-securityHeaders'))

    // Register nitro plugin to hide X-Powered-By header
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/80-hidePoweredBy'))

    // Register nitro plugin to save and retrieve prerendered headers in SSG mode
    addServerPlugin(resolver.resolve('./runtime/nitro/plugins/90-prerenderedHeaders'))

    // Register hook that will reorder nitro plugins to be applied last
    reorderNitroPlugins(nuxt)

    // Register request size limiter middleware
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/requestSizeLimiter')
    })

    // Register CORS middleware
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/corsHandler')
    })

    // Register allowed methods restricter middleware
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/allowedMethodsRestricter')
    })

    // Register rate limiter middleware
    registerRateLimiterStorage(nuxt, securityOptions)
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/rateLimiter')
    })
    
    // Register XSS validator middleware
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/xssValidator')
    })
    
    // Register basicAuth middleware that is disabled by default
    const basicAuthConfig = nuxt.options.runtimeConfig.private.basicAuth
    if (basicAuthConfig && (basicAuthConfig.enabled || (basicAuthConfig as any)?.value?.enabled)) {
      addServerHandler({
        route: (basicAuthConfig as any).route || '',
        handler: resolver.resolve('./runtime/server/middleware/basicAuth')
      })
    }

    // Import CSURF module
    if (securityOptions.csrf) {
      if (Object.keys(securityOptions.csrf).length) {
        await installModule('nuxt-csurf', securityOptions.csrf)
      } else {
        await installModule('nuxt-csurf')
      }
    }

    // Import composables
    addImportsDir(resolver.resolve('./runtime/composables'))
    addServerImports([{ name: 'defuReplaceArray', from: resolver.resolve('./utils/merge')}])

    // Record SRI Hashes in the Virtual File System at build time
    let sriHashes: Record<string, string> = {}
    nuxt.options.nitro.virtual = defu(
      { '#sri-hashes': () => `export default ${JSON.stringify(sriHashes)}` },
      nuxt.options.nitro.virtual
    )
    nuxt.hook('nitro:build:before', async(nitro) => {
      sriHashes = await hashBundledAssets(nitro)
    })

    // Register init hook to add pre-rendered headers to responses
    nuxt.hook('nitro:init', nitro => {  
      nitro.hooks.hook('prerender:done', async() => {
        // Add the prenredered headers to the Nitro server assets
        nitro.options.serverAssets.push({ 
          baseName: 'nuxt-security', 
          dir: createResolver(nuxt.options.buildDir).resolve('./nuxt-security') 
        })

        // In some Nitro presets (e.g. Vercel), the header rules are generated for the static server
        // By default we update the nitro headers route rules with their calculated value to support this possibility
        const prerenderedHeaders = await nitro.storage.getItem<Record<string, Record<string, string>>>('build:nuxt-security:headers.json') || {}

        if (securityOptions.ssg && securityOptions.ssg.exportToPresets) {
          const prerenderedHeadersRouteRules = Object.fromEntries(Object.entries(prerenderedHeaders).map(([route, headers]) => [route, { headers }]))
          const n = useNitro()
          n.options.routeRules = defuReplaceArray(
            prerenderedHeadersRouteRules,
            n.options.routeRules
          )
        }

        // Call the nuxt hook to allow user access to the prerendered headers
        nuxt.hooks.callHook('nuxt-security:prerenderedHeaders', prerenderedHeaders)
      })
    })
  }
})

/**
 * 
 * Register storage driver for the rate limiter
 */
function registerRateLimiterStorage(nuxt: Nuxt, securityOptions: ModuleOptions) {
  nuxt.hook('nitro:config', (config) => {
    const driver = defu(
      securityOptions.rateLimiter ? securityOptions.rateLimiter.driver : undefined,
      { name: 'lruCache' }
    )
    const { name, options = {} } = driver
    config.storage = defu(
      {
        '#rate-limiter-storage': {
          driver: name,
          ...options
        }
      },
      config.storage
    )
  })
}

/**
 * Make sure our nitro plugins will be applied last,
 * After all other third-party modules that might have loaded their own nitro plugins
 */
function reorderNitroPlugins(nuxt: Nuxt) {  
  nuxt.hook('nitro:init', nitro => {    
    const resolver = createResolver(import.meta.url)
    const securityPluginsPrefix = resolver.resolve('./runtime/nitro/plugins')

    // SSR: Reorder plugins in Nitro options
    nitro.options.plugins.sort((a, b) => {
      if (a.startsWith(securityPluginsPrefix)) {
        if (b.startsWith(securityPluginsPrefix)) {
          return 0
        } else {
          return 1
        }
      } else {
        if (b.startsWith(securityPluginsPrefix)) {
          return -1
        } else {
          return 0
        }
      }
    })
    // SSG: Reorder plugins in Nitro hook
    nitro.hooks.hook('prerender:config', config => {
      config.plugins?.sort((a, b) => {
        if (a?.startsWith(securityPluginsPrefix)) {
          if (b?.startsWith(securityPluginsPrefix)) {
            return 0
          } else {
            return 1
          }
        } else {
          if (b?.startsWith(securityPluginsPrefix)) {
            return -1
          } else {
            return 0
          }
        }
      })
    })
  })
}


async function hashBundledAssets(nitro: Nitro) {
  const hashAlgorithm = 'SHA-384'
  const sriHashes: Record<string, string> = {}

  // Will be later necessary to construct url
  const { cdnURL: appCdnUrl = '', baseURL: appBaseUrl } = nitro.options.runtimeConfig.app

  // Go through all public assets folder by folder
  const publicAssets = nitro.options.publicAssets
  for (const publicAsset of publicAssets) {
    const { dir, baseURL = '' } = publicAsset

    if (existsSync(dir)) {
      // Node 16 compatibility maintained
      // Node 18.17+ supports recursive option on readdir
      // const entries = await readdir(dir, { withFileTypes: true, recursive: true })
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile()) {

          // Node 16 compatibility maintained
          // Node 18.17+ supports entry.path on DirEnt
          // const fullPath = join(entry.path, entry.name)
          const path = join(dir, entry.name)
          const content = await readFile(path)
          const hash = await generateHash(content, hashAlgorithm)
          // construct the url as it will appear in the head template
          const fullPath = join(baseURL, entry.name)
          let url: string
          if (appCdnUrl) {
            // If the cdnURL option was set, the url will be in the form https://...
            const relativePath = isAbsolute(fullPath) ? fullPath.slice(1) : fullPath
            const abdsoluteCdnUrl = appCdnUrl.endsWith('/') ? appCdnUrl : appCdnUrl + '/'
            url = new URL(relativePath, abdsoluteCdnUrl).href
          } else {
            // If not, the url will be in a relative form: /_nuxt/...
            url = join('/', appBaseUrl, fullPath)
          }
          sriHashes[url] = hash
        }
      }
    }
  }


  return sriHashes
}
