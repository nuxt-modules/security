import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Rate Limiter', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/rateLimiter', import.meta.url)),
  })

  it ('should return 200 OK when not reaching the limit', async () => {
    const res1 = await fetch('/')
    const res2 = await fetch('/')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res2.status).toBe(200)
    expect(res2.statusText).toBe('OK')
  })

  it ('should return 429 Too Many Responses after limit reached', async () => {
    const res1 = await fetch('/')
    await fetch('/')
    await fetch('/')
    await fetch('/')
    const res5 = await fetch('/')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res5.status).toBe(429)
    expect(res5.statusText).toBe('Too Many Requests')
  })

  it ('should return 200 OK after multiple requests for a route with a higher limit', async () => {
    const res1 = await fetch('/test')
    await fetch('/test')
    await fetch('/test')
    await fetch('/test')
    await fetch('/test')
    await fetch('/test')
    const res5 = await fetch('/test')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res5.status).toBe(200)
    expect(res5.statusText).toBe('OK')
  })

  it ('should return 429 when limit reached for a route, but 200 for another route with a higher limit', async () => {
    const res1 = await fetch('/')
    await fetch('/')
    await fetch('/')
    await fetch('/')
    const res5 = await fetch('/')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res5.status).toBe(429)
    expect(res5.statusText).toBe('Too Many Requests')

    const res6 = await fetch('/test')
    expect(res6).toBeDefined()
    expect(res6).toBeTruthy()
    expect(res6.status).toBe(200)
    expect(res6.statusText).toBe('OK')
  })

  it ('should return 200 OK after multiple requests for a route with localhost ip whitelisted', async () => {
    const res1 = await fetch('/whitelistBase')
    await fetch('/whitelistBase')
    await fetch('/whitelistBase')
    await fetch('/whitelistBase')
    const res5 = await fetch('/whitelistBase')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res5.status).toBe(200)
    expect(res5.statusText).toBe('OK')
  })

  it ('should return 429 when limit reached with an empty whitelist array', async () => {
    const res1 = await fetch('/whitelistEmpty')
    await fetch('/whitelistEmpty')
    await fetch('/whitelistEmpty')
    await fetch('/whitelistEmpty')
    const res5 = await fetch('/whitelistEmpty')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res5.status).toBe(429)
    expect(res5.statusText).toBe('Too Many Requests')
  })

  it ('should return 429 when limit reached as localhost ip is not whitelisted', async () => {
    const res1 = await fetch('/whitelistNotListed')
    await fetch('/whitelistNotListed')
    await fetch('/whitelistNotListed')
    await fetch('/whitelistNotListed')
    const res5 = await fetch('/whitelistNotListed')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res5.status).toBe(429)
    expect(res5.statusText).toBe('Too Many Requests')
  })
})
