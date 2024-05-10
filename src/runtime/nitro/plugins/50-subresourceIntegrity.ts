import { defineNitroPlugin } from '#imports'
import { resolveSecurityRules } from '../utils'
//@ts-expect-error : we are importing from the virtual file system
import sriHashes from '#sri-hashes'

const SCRIPT_RE = /<script((?=[^>]+\bsrc="([^"]+)")(?![^>]+\bintegrity="[^"]+")[^>]+)(?:\/>|><\/script>)/g
const LINK_RE = /<link((?=[^>]+\brel="(?:stylesheet|preload|modulepreload)")(?=[^>]+\bhref="([^"]+)")(?![^>]+\bintegrity="[\w\-+/=]+")[^>]+)>/g

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit if SRI not enabled for this route
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || !rules.sri) {
      return
    }

    // Scan all relevant sections of the NuxtRenderHtmlContext
    // Note: integrity can only be set on scripts and on links with rel preload, modulepreload and stylesheet
    // However the SRI standard provides that other elements may be added to that list in the future
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = event.context.security.cheerios!
    for (const section of sections) {
      cheerios[section]=cheerios[section].map($=>{
        $ = $.replace(SCRIPT_RE,(match, rest, src)=>{
          const hash = sriHashes[src]
          if (hash) {
            const integrityScript = `<script integrity="${hash}"${rest}></script>`
            event.context.cache.scripts.set(src, hash)
            return integrityScript
          }
          return match
        })
        $ = $.replace(LINK_RE,(match, rest, href)=>{
          const hash = sriHashes[href]
          if (hash) {
            const integrityLink = `<link integrity="${hash}"${rest}>`
            event.context.cache.links.set(href, hash)
            return integrityLink
          }
          return match
        })
        return $
      })
    }
  })
})