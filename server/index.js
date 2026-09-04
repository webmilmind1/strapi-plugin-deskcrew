'use strict'

const { mapEntryToTicket, submitTicket, validKey } = require('../lib/ticket.js')

/**
 * config/plugins.js:
 *
 *   module.exports = {
 *     deskcrew: {
 *       enabled: true,
 *       config: {
 *         widgetKey: env('DESKCREW_WIDGET_KEY'),     // pub_... from your DeskCrew dashboard
 *         siteUrl: 'https://www.example.com',        // the site the widget runs on
 *         ticketSources: [
 *           { uid: 'api::contact.contact', fields: { name: 'name', email: 'email', message: 'message' } },
 *         ],
 *       },
 *     },
 *   }
 *
 * Every entry created in a listed content type becomes a DeskCrew ticket with the
 * mapped fields. Entries without an email or a message are skipped. Sending is
 * best-effort and never blocks the create.
 */
module.exports = {
  config: {
    default: { widgetKey: '', siteUrl: '', appUrl: 'https://deskcrew.io', ticketSources: [] },
    validator(config) {
      if (config.widgetKey && !validKey(config.widgetKey)) {
        throw new Error(
          'deskcrew: widgetKey must look like pub_... (from your DeskCrew dashboard, Install page)',
        )
      }
      if (!Array.isArray(config.ticketSources))
        throw new Error('deskcrew: ticketSources must be an array')
      for (const s of config.ticketSources) {
        if (!s || typeof s.uid !== 'string' || !s.fields || !s.fields.email || !s.fields.message) {
          throw new Error(
            'deskcrew: each ticketSource needs { uid, fields: { email, message, name? } }',
          )
        }
      }
    },
  },

  register() {},

  bootstrap({ strapi }) {
    const config =
      strapi.config.get('plugin::deskcrew') || strapi.config.get('plugin.deskcrew') || {}
    const sources = Array.isArray(config.ticketSources) ? config.ticketSources : []
    if (!validKey(config.widgetKey) || sources.length === 0) {
      strapi.log.info('deskcrew: no widgetKey or ticketSources configured; the plugin is idle')
      return
    }
    const byUid = new Map(sources.map((s) => [s.uid, s.fields]))
    strapi.db.lifecycles.subscribe({
      models: [...byUid.keys()],
      async afterCreate(event) {
        const fields = byUid.get(event.model.uid)
        const ticket = mapEntryToTicket(event.result, fields)
        if (!ticket) return
        const ok = await submitTicket(config, ticket)
        if (!ok)
          strapi.log.warn(
            `deskcrew: ticket for ${event.model.uid} #${event.result.id} was not accepted`,
          )
      },
    })
    strapi.log.info(
      `deskcrew: forwarding new entries from ${[...byUid.keys()].join(', ')} as support tickets`,
    )
  },

  services: {
    ticket: ({ strapi }) => ({
      /** Create a ticket from your own code: strapi.plugin('deskcrew').service('ticket').create({ name, email, message }) */
      create(ticket) {
        const config =
          strapi.config.get('plugin::deskcrew') || strapi.config.get('plugin.deskcrew') || {}
        return submitTicket(config, ticket)
      },
    }),
  },
}
