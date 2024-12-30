export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  security: {
    rateLimiter: {
      tokensPerInterval: 3,
      interval: 300000
    }
  },
  routeRules: {
    '/test': {
      security: {
        rateLimiter: {
          tokensPerInterval: 10,
        }
      }
    },
    '/whitelistBase': {
      security: {
        rateLimiter: {
          tokensPerInterval: 1,
          interval: 300000,
          whiteList: [
            '127.0.0.1',
            '192.168.0.1',
            '172.16.0.1',
            '10.0.0.1',
          ],
        }
      }
    },
    '/whitelistEmpty': {
      security: {
        rateLimiter: {
          tokensPerInterval: 1,
          interval: 300000,
          whiteList: [],
        }
      }
    },
    '/whitelistNotListed': {
      security: {
        rateLimiter: {
          tokensPerInterval: 1,
          interval: 300000,
          whiteList: [
            '10.0.0.1',
            '10.0.1.1',
            '10.0.2.1',
            '10.0.3.1',
            '10.0.4.1',
            '10.0.5.1',
            '10.0.6.1',
            '10.0.7.1',
            '10.0.8.1',
            '10.0.9.1',
            '10.1.0.1',
            '10.2.0.1',
            '10.3.0.1',
            '10.4.0.1',
            '10.5.0.1',
            '10.6.0.1',
            '10.7.0.1',
            '10.8.0.1',
            '10.9.0.1',
            '192.168.0.1',
            '192.168.1.1',
            '192.168.2.1',
            '192.168.3.1',
            '192.168.4.1',
            '192.168.5.1',
            '192.168.6.1',
            '192.168.7.1',
            '192.168.8.1',
            '192.168.9.1',
          ],
        }
      }
    },
  }
})
