const test = require('node:test')
const assert = require('node:assert/strict')
const plugin = require('../server')

test('validator rejects a malformed key and a bad source', () => {
  assert.throws(() => plugin.config.validator({ widgetKey: 'nope', ticketSources: [] }), /pub_/)
  assert.throws(
    () => plugin.config.validator({ widgetKey: 'pub_abc12345', ticketSources: [{ uid: 'x' }] }),
    /ticketSource/,
  )
  assert.doesNotThrow(() =>
    plugin.config.validator({
      widgetKey: 'pub_abc12345',
      ticketSources: [
        { uid: 'api::contact.contact', fields: { email: 'email', message: 'message' } },
      ],
    }),
  )
})

test('bootstrap subscribes to the configured models and stays idle without config', () => {
  const subs = []
  const logs = []
  const strapi = {
    config: {
      get: () => ({
        widgetKey: 'pub_abc12345',
        siteUrl: 'https://x.y',
        ticketSources: [
          { uid: 'api::contact.contact', fields: { email: 'email', message: 'message' } },
        ],
      }),
    },
    db: { lifecycles: { subscribe: (s) => subs.push(s) } },
    log: { info: (m) => logs.push(m), warn: (m) => logs.push(m) },
  }
  plugin.bootstrap({ strapi })
  assert.equal(subs.length, 1)
  assert.deepEqual(subs[0].models, ['api::contact.contact'])

  const idle = {
    ...strapi,
    config: { get: () => ({}) },
    db: { lifecycles: { subscribe: () => assert.fail('should not subscribe') } },
  }
  plugin.bootstrap({ strapi: idle })
})
