import { test } from 'tap'
import { InjectOptions } from 'light-my-request'
import { app } from '../../src/app'
import {
  TEST_POST_HTML,
  DEFAULT_PRESET_PDF_OPTIONS_NAME,
} from '../../src/config'

async function build(t) {
  const myApp = await app({ pagesNum: 2 })
  t.tearDown(myApp.close.bind(myApp))
  return myApp
}

test('POST request test', async (t) => {
  t.test('POST / without body', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'POST',
      url: '/',
    } as InjectOptions)
    t.equal(res.statusCode, 400)
    t.end()
  })

  t.test('POST / with empty html', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'POST',
      url: '/',
      body: '',
    } as InjectOptions)
    t.equal(res.statusCode, 400)
    t.end()
  })

  t.test('POST / with default preset name', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'POST',
      url: `/?pdf_option=${DEFAULT_PRESET_PDF_OPTIONS_NAME}`,
      body: TEST_POST_HTML,
      headers: { 'content-type': 'text/plain' },
    } as InjectOptions)
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })
})
