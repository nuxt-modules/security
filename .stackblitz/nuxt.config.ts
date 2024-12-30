// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxtjs/security'],
  // Following configuration is only necessary to make Stackblitz work correctly.
  // For local projects, you do not need any configuration to try it out.
  security: {
    headers: {
      crossOriginResourcePolicy: 'cross-origin',
      contentSecurityPolicy: false,
      xFrameOptions: false,
    },
  },
});
