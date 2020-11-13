'use strict'

import { test } from 'tap'
import { app } from '../../dist/app'
import { PDFOptionsPreset } from '../../dist/pdf-options'
import {
  PDF_OPTION_PRESET_FILE_PATH,
  TEST_TARGET_URL,
  TEST_POST_HTML,
} from '../../dist/config'

async function build(t) {
  const myApp = await app()
  t.tearDown(myApp.close.bind(myApp))
  t.tearDown(async () => await myApp.destoroyHcPages())
  return myApp
}

async function getFirstPresetName() {
  const pdfOptionsPreset = new PDFOptionsPreset({
    filePath: PDF_OPTION_PRESET_FILE_PATH,
  })
  await pdfOptionsPreset.init()
  return Object.keys(pdfOptionsPreset.preset)[0]
}

test('request test', async (t) => {
  t.test('/pdfoptions response is match', async (t) => {
    const app = await build(t)
    const pdfOptionsPreset = new PDFOptionsPreset({
      filePath: PDF_OPTION_PRESET_FILE_PATH,
    })
    await pdfOptionsPreset.init()
    const preset = pdfOptionsPreset.preset
    const res = await app.inject({
      method: 'GET',
      url: '/pdfoptions',
    })
    t.equal(res.payload, JSON.stringify(preset))
    t.end()
  })

  t.test('GET / without url', async (t) => {
    const app = await build(t)
    const pdfOptionName = await getFirstPresetName()
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        pdfoption: pdfOptionName,
        url: '',
      },
    })
    t.equal(res.statusCode, 400)
    t.end()
  })

  t.test('GET / without preset name', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        url: TEST_TARGET_URL,
      },
    })
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })

  t.test('GET / with first preset name', async (t) => {
    const app = await build(t)
    const pdfOptionName = await getFirstPresetName()
    const res = await app.inject({
      method: 'GET',
      url: '/',
      query: {
        pdfoption: pdfOptionName,
        url: TEST_TARGET_URL,
      },
    })
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })

  t.test('POST / without body', async (t) => {
    const app = await build(t)
    const res = await app.inject({
      method: 'POST',
      url: '/',
    })
    t.equal(res.statusCode, 400)
    t.end()
  })

  t.test('POST / with first preset name', async (t) => {
    const app = await build(t)
    const pdfOptionName = await getFirstPresetName()
    const res = await app.inject({
      method: 'POST',
      url: '/',
      body: {
        pdfoption: pdfOptionName,
        html: TEST_POST_HTML,
      },
    })
    t.equal(res.statusCode, 200)
    t.equal(res.headers['content-type'], 'application/pdf')
    t.end()
  })
})
