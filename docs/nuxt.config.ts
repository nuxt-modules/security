export default defineNuxtConfig({
  extends: '@nuxt/ui-pro',

  experimental: {
    // Need this otherwise vue-server-renderer not found
    externalVue: false
  },

  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxtjs/security',
    '@vueuse/nuxt'
  ],

  colorMode: {
    preference: 'dark',
  },

  ui: {
    icons: ['heroicons', 'simple-icons', 'ph'],
  },

  uiPro: {
    license: 'oss'
  },

  security: {
    strict: true,
    rateLimiter: false,
    headers: {
      contentSecurityPolicy: {
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", "data:", 'https:'], // Allow https: external images
        'connect-src': process.env.NODE_ENV === 'development' ? ["'self'", 'https:', 'ws:'] : ["'self'", 'https:'], // Allow websocket in dev mode
        'frame-src': ['https://www.youtube-nocookie.com', 'https://stackblitz.com'], // Allow youtube and stackblitz iframes
      },
      permissionsPolicy: {
        "picture-in-picture": ['self', '"https://www.youtube-nocookie.com"'], // Allow picture-in-picture for youtube
        "fullscreen": ['self', '"https://www.youtube-nocookie.com"'], // Allow fullscreen for youtube
      },
      crossOriginEmbedderPolicy: 'unsafe-none', // Allow youtube and stackblitz iframes
    },
    ssg: {
      hashStyles: false
    }
  },

  nitro: {
    prerender: {
      routes: ['/api/search.json'],
    },
  },

  hooks: {
    // Related to https://github.com/nuxt/nuxt/pull/22558
    // Adding all global components to the main entry
    // To avoid lagging during page navigation on client-side
    'components:extend': function (components) {
      for (const comp of components) {
        if (comp.global)
          comp.global = 'sync'
      }
    },
  },
})
