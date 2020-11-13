'use strict'

import { test } from 'tap'
import { app } from '../../dist/app'
import { TEST_TARGET_URL } from '../../dist/config'

const BEARER_KEY = 'test-super-secret-key'

async function build(t) {
  const myApp = await app({
    bearerAuthSecretKey: BEARER_KEY,
  })
  t.tearDown(myApp.close.bind(myApp))
  t.tearDown(async () => await myApp.destoroyHcPages())
  return myApp
}

test('bearer test', async (t) => {
  t.test('GET / without authorization header', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
    })
    t.equal(res.statusCode, 401)
    t.end()
  })

  t.test('GET / with wrong key', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
      headers: {
        Authorization: 'Bearer Super-Wrong-key',
      },
    })
    t.equal(res.statusCode, 401)
    t.end()
  })

  t.test('GET / with correct key', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
      headers: {
        Authorization: `Bearer ${BEARER_KEY}`,
      },
    })
    t.equal(res.statusCode, 200)
    t.end()
  })
})
