# strapi-plugin-deskcrew

![Strapi entries become DeskCrew tickets: install, configure, every new form entry lands in your inbox](https://deskcrew.io/packages/deskcrew-strapi.gif)

Turn entries in your Strapi project into [DeskCrew](https://deskcrew.io) support tickets. Point the plugin at the content types your forms write to (a contact form, a feedback type, a support request) and every new entry lands in your DeskCrew inbox with the sender's name, email and message. Works with Strapi 4 and 5.

DeskCrew is an AI-powered helpdesk: a support widget for your site, AI answers grounded in your knowledge base, a human approval step before anything sends, and every conversation as a ticket. You need a free DeskCrew account: https://deskcrew.io/signup

## Install

```
npm install strapi-plugin-deskcrew
```

`config/plugins.js` (or `.ts`):

```js
module.exports = ({ env }) => ({
  deskcrew: {
    enabled: true,
    config: {
      widgetKey: env('DESKCREW_WIDGET_KEY'), // pub_... from Dashboard → Install
      siteUrl: 'https://www.example.com', // the site your widget runs on
      ticketSources: [
        {
          uid: 'api::contact.contact',
          fields: { name: 'name', email: 'email', message: 'message' },
        },
      ],
    },
  },
})
```

Restart Strapi. Each new entry in a listed content type becomes a ticket. Entries without an email or a message are skipped, and sending never blocks the create.

## From your own code

```js
await strapi
  .plugin('deskcrew')
  .service('ticket')
  .create({ name: 'Ada', email: 'ada@example.com', message: 'Help' })
```

Returns `true` when DeskCrew accepted the ticket.

## The widget on your frontend

The widget itself lives in the site that renders your content, not in Strapi. Add one script tag there, or use the package for your frontend framework: https://deskcrew.io/integrations

## What the plugin sends

Only the mapped name, email and message, with your public widget key, to `https://deskcrew.io/api/widget/submit`, using `siteUrl` as the request origin. Nothing else leaves your project. Terms: https://deskcrew.io/terms. Privacy: https://deskcrew.io/privacy.

## License

MIT
