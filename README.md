[![nuxt-security](https://security.nuxtjs.org/preview.png)](https://security.nuxtjs.org)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

# Nuxt Security

Automatically configure your app to follow OWASP security patterns and principles by using HTTP Headers and Middleware.

> This module works with Nuxt 3 only

- [📖 &nbsp;Read the documentation](https://security.nuxtjs.org)
- [👾 &nbsp;Playground](https://security.nuxtjs.org/playground)

## Features

- Security response headers (including CSP for SSG apps)
- Request Size & Rate Limiters
- Cross Site Scripting (XSS) Validation
- Cross-Origin Resource Sharing (CORS) support
- Hide `X-Powered-By` header and remove console loggers utils
- `[Optional]` Allowed HTTP Methods, Basic Auth, CSRF

## Usage

Install the module:

```sh
npx nuxi@latest module add security
```

And that's it! The module will now register route rules and server middlewares globally so that your application will be more secured.

## Configuration

You can pass configuration to the module in the `nuxt.config.ts` like following:

```ts
export default defineNuxtConfig({
  modules: ["@nuxtjs/security"],
  security: {
    // options
  }
})
```

For all available configuration options check out the [docs](https://security.nuxtjs.org).

## Development

- Run `yarn dev:prepare` to generate type stubs.
- Use `yarn dev` to start playground in development mode.

## License

[MIT License](./LICENSE.md)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/security/latest.svg
[npm-version-href]: https://npmjs.com/package/@nuxtjs/security
[npm-downloads-src]: https://img.shields.io/npm/dt/@nuxtjs/security.svg
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/security
[github-actions-ci-src]: https://github.com/nuxt-modules/security/actions/workflows/ci.yml/badge.svg
[github-actions-ci-href]: https://github.com/nuxt-modules/security/actions?query=workflow%3Aci
[license-src]: https://img.shields.io/npm/l/@nuxtjs/security.svg
[license-href]: https://npmjs.com/package/@nuxtjs/security
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
