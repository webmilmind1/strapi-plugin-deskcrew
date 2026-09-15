<!-- deskcrew-header:start -->
<p align="center">
  <a href="https://deskcrew.io"><img src="https://deskcrew.io/logo.png" alt="DeskCrew" width="96" height="96"></a>
</p>

<h1 align="center">strapi-plugin-deskcrew</h1>

<p align="center"><b>Strapi plugin (v4 and v5) that turns new entries in chosen content types, such as contact forms and feedback, into DeskCrew support tickets.</b></p>

<p align="center">
  <a href="https://deskcrew.io"><b>Website</b></a> •
  <a href="https://deskcrew.io/integrations"><b>Integrations</b></a> •
  <a href="https://deskcrew.io/agents"><b>For agents</b></a> •
  <a href="https://deskcrew.io/signup"><b>Sign up</b></a>
</p>

<p align="center">
  <a href="https://github.com/webmilmind1/strapi-plugin-deskcrew/stargazers"><img src="https://img.shields.io/github/stars/webmilmind1/strapi-plugin-deskcrew?style=flat&logo=github&label=Stars&color=ffd33d" alt="GitHub stars"></a>
  <a href="https://github.com/webmilmind1/strapi-plugin-deskcrew"><img src="https://img.shields.io/github/license/webmilmind1/strapi-plugin-deskcrew?style=flat&label=License&color=e3a82b" alt="License"></a>
</p>

<p align="center">
  <a href="https://deskcrew.io"><img src="https://img.shields.io/badge/Visit_our_website-6366F1?style=for-the-badge&logoColor=white" alt="Visit our website"></a>
  <a href="https://discord.gg/hdWZgrYDqB"><img src="https://img.shields.io/badge/Join_our_Discord-5865F2?style=for-the-badge&logoColor=white&logo=discord" alt="Join our Discord"></a>
  <a href="https://x.com/getdeskcrew"><img src="https://img.shields.io/badge/Follow_%40getdeskcrew-000000?style=for-the-badge&logoColor=white&logo=x" alt="Follow @getdeskcrew"></a>
  <a href="https://www.instagram.com/getdeskcrew"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logoColor=white&logo=instagram" alt="Instagram"></a>
  <a href="https://mastodon.social/@deskcrew"><img src="https://img.shields.io/badge/Mastodon-6364FF?style=for-the-badge&logoColor=white&logo=mastodon" alt="Mastodon"></a>
  <a href="https://www.youtube.com/channel/UCW7g7TLiUbnK8zWF513ckFA"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logoColor=white&logo=youtube" alt="YouTube"></a>
  <a href="https://www.tiktok.com/@deskcrewhq"><img src="https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logoColor=white&logo=tiktok" alt="TikTok"></a>
</p>

<p align="center"><i>⭐ Help more people find DeskCrew. Star this repo!</i></p>
<!-- deskcrew-header:end -->

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
