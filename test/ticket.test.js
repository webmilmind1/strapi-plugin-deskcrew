const test = require('node:test')
const assert = require('node:assert/strict')
const { mapEntryToTicket, submitTicket, validKey } = require('../lib/ticket.js')

test('maps name, email and message from the configured fields', () => {
  const t = mapEntryToTicket(
    { fullName: 'Ada', contact: { email: 'ada@example.com' }, body: 'Help me' },
    { name: 'fullName', email: 'contact.email', message: 'body' },
  )
  assert.deepEqual(t, { name: 'Ada', email: 'ada@example.com', message: 'Help me' })
})

test('returns null without an email or a message', () => {
  assert.equal(
    mapEntryToTicket({ email: 'nope', message: 'x' }, { email: 'email', message: 'message' }),
    null,
  )
  assert.equal(
    mapEntryToTicket({ email: 'a@b.c', message: '  ' }, { email: 'email', message: 'message' }),
    null,
  )
})

test('validKey accepts pub_ keys only', () => {
  assert.equal(validKey('pub_abc12345'), true)
  assert.equal(validKey('sk_live_no'), false)
})

test('submitTicket posts the payload with the site origin and reports ok', async () => {
  const calls = []
  const ok = await submitTicket(
    { widgetKey: 'pub_abc12345', siteUrl: 'https://www.example.com' },
    { name: 'Ada', email: 'a@b.c', message: 'hi' },
    async (url, init) => {
      calls.push({ url, init })
      return { ok: true }
    },
  )
  assert.equal(ok, true)
  assert.equal(calls[0].url, 'https://deskcrew.io/api/widget/submit')
  assert.equal(calls[0].init.headers.origin, 'https://www.example.com')
  assert.equal(JSON.parse(calls[0].init.body).key, 'pub_abc12345')
})

test('submitTicket never throws and refuses a bad key', async () => {
  assert.equal(
    await submitTicket(
      { widgetKey: 'bad', siteUrl: 'https://x.y' },
      { email: 'a@b.c', message: 'hi' },
      async () => {
        throw new Error('down')
      },
    ),
    false,
  )
  assert.equal(
    await submitTicket(
      { widgetKey: 'pub_abc12345', siteUrl: 'https://x.y' },
      { email: 'a@b.c', message: 'hi' },
      async () => {
        throw new Error('down')
      },
    ),
    false,
  )
})
