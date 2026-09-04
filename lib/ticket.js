'use strict'

// Pure: turn a saved entry into the DeskCrew ticket payload, or null when the entry
// does not carry an email and a message. No I/O, unit-tested on its own.

const KEY_RE = /^pub_[A-Za-z0-9]{8,64}$/

function pick(entry, path) {
  if (!path) return ''
  return String(path)
    .split('.')
    .reduce((v, k) => (v && v[k] !== undefined ? v[k] : undefined), entry)
}

/**
 * @param {Record<string, unknown>} entry   the created record
 * @param {{ name?: string, email: string, message: string }} fields  field names (dot paths allowed)
 * @returns {{ name: string, email: string, message: string } | null}
 */
function mapEntryToTicket(entry, fields) {
  if (!entry || !fields) return null
  const email = String(pick(entry, fields.email) ?? '').trim()
  const message = String(pick(entry, fields.message) ?? '').trim()
  if (!email.includes('@') || !message) return null
  const name = String(pick(entry, fields.name) ?? '').trim()
  return { name, email, message: message.slice(0, 20000) }
}

/** @param {string} key */
function validKey(key) {
  return KEY_RE.test(String(key || '').trim())
}

/**
 * POST the ticket to DeskCrew. Best-effort: resolves false on any failure, never throws.
 * @param {{ widgetKey: string, siteUrl: string, appUrl?: string }} config
 * @param {{ name: string, email: string, message: string }} ticket
 * @param {(url: string, init: object) => Promise<{ ok: boolean }>} [fetchImpl]
 */
async function submitTicket(config, ticket, fetchImpl) {
  const f = fetchImpl || globalThis.fetch
  if (!f || !validKey(config.widgetKey) || !ticket) return false
  const base = String(config.appUrl || 'https://deskcrew.io').replace(/\/+$/, '')
  try {
    const res = await f(`${base}/api/widget/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: String(config.siteUrl || '') },
      body: JSON.stringify({ key: config.widgetKey.trim(), ...ticket }),
    })
    return Boolean(res && res.ok)
  } catch {
    return false
  }
}

module.exports = { mapEntryToTicket, submitTicket, validKey, KEY_RE }
