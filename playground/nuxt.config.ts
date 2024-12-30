import { defineNuxtConfig } from 'nuxt/config'
import { writeFile } from 'node:fs/promises'

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },

  // Per route configuration
  routeRules: {
    '/secret': {
      security: {
        rateLimiter: {
          tokensPerInterval:1000,
          interval: 1000,
        },
        headers: {
          strictTransportSecurity: {
            preload: true
          }
        }
      },
      headers: {
        'X-XSS-Protection': '1',
        'Foo': 'Bar'
      }
    },
    '/about': {
      prerender: true
    },
    '/swr': {
      swr: 60
    },
    '/api/**': {
      security: {
        rateLimiter: false
      }
    },
    '/preserve': {
      security: {
        headers: {
          contentSecurityPolicy: false,
          referrerPolicy: false
        }
      }
    },
    '/rateLimit': {
      security: {
        rateLimiter: {
          tokensPerInterval:1,
          interval: 1000,
          whiteList: ['127.0.0.1'],
        },
      },
    },
  },

  // Global configuration
  security: {
    headers: {
      xXSSProtection: '0'
    },
    rateLimiter: {
      tokensPerInterval: 3,
      interval: 30000,
      headers: true
    },
  },

  hooks: {
    'nuxt-security:prerenderedHeaders': async(prerenderedHeaders) => {
      // Don't take this snippet for granted, this is just provided as a simplified example
      let nginxText = ''
      for (const path in prerenderedHeaders) {
        nginxText += 'location ' + path + ' {\n'
        const headersForPath = prerenderedHeaders[path]
        for (const headerName in headersForPath) {
          const headerValue = headersForPath[headerName]
          nginxText += `  add_header ${headerName} "${headerValue}";\n`
        }
        nginxText += '}\n\n'
      }
      await writeFile('./.nuxt/server.headers', nginxText)
    }
  }
})
