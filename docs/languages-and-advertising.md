# Languages and homepage advertising

The language selector supports English (`en`), Amharic (`am`), Afaan Oromoo (`om`),
Arabic (`ar`), French (`fr`) and Tigrinya (`ti`). Arabic, French and Tigrinya each
cover the shared message catalogue in `src/lib/locales/`. Property descriptions,
sponsor copy and the location catalogue retain the publisher's original wording.

Language changes retain URL filters. They use a full page navigation so server
layouts and the document's `lang` and `dir` attributes change together. Middleware
sets the validated request locale; Arabic uses RTL. Arabic and Ethiopic fonts are
bundled in `public/fonts/noto` and hosted by the app. Poppins and Geist Mono are also bundled locally in
`public/fonts/interface`, avoiding font-network requests during Docker builds. Existing Amharic/Oromo missing keys retain English or their
existing equivalent message as fallback.

The homepage has a reserved advertisement panel following the search area. It
shows a translated placeholder when there is no active sponsorship. Administrators
can publish a real banner at `/admin/sponsorships`: headline, body, optional image
and optional destination link. The existing single-active-sponsorship rule applies.
Other banner placements remain hidden when no sponsor is active.

Validation:

```sh
node scripts/test-i18n-ads.mjs
node scripts/test-auth.mjs
```

The first suite checks new-locale coverage, interpolation tokens, direction and
both advertisement states. Desktop/mobile browser checks also cover language
switching while retaining search filters, translated login and RTL layout.
