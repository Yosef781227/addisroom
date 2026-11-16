# AddisRoom

Rental search for Addis Ababa and nearby towns, with cascading location filters,
map search, identity review, multilingual UI and managed advertisement carousels.

## Start a populated local copy

Install Node.js 22 or newer and Git, then run:

```sh
git clone --branch mvp-auth-admin-search https://github.com/Yosef781227/addisroom.git
cd addisroom
npm run setup
npm run dev
```

Open http://localhost:3000. `npm run setup` installs locked dependencies, creates
private `.env.local` settings on a fresh checkout, generates the database client,
applies migrations, and adds six demo rental homes plus three sample promotions.
The homes include photos, prices, amenities and map coordinates for testing the
filters. Your logo, local fonts, icons, styles and location catalogue are already
included in the repository. Sample property photos, the logo and bundled fonts are stored in `public/`
and served locally. Internet access is needed to install dependencies, not to load
these images. Photo sources are listed in `public/images/demo/SOURCES.md`.

You can run setup again: sample records use stable IDs, existing records are kept,
and existing environment files and encryption keys are never overwritten.
Dependency installation replaces `node_modules`; stop your local dev server first.
The command only targets a SQLite database inside this checkout with a localhost
app URL. It does not connect to the VPS or copy its database.

Fresh local settings use **local test verification codes**, displayed in the
registration flow; they do not send emails or SMS. Google login and real email/SMS
require your own provider credentials. No shared passwords or admin sessions are
seeded. To review the admin panel, register locally, verify your address and set a
password, then grant access to your own local account:

```sh
node --env-file=.env.local scripts/grant-admin.mjs your-email@example.com
```

Sign in again and open http://localhost:3000/admin. Manage advertisements under
`/admin/sponsorships`. See [authentication and identity verification](docs/auth-verification.md)
for provider configuration and private ID uploads.

## What is shared

GitHub contains code, design assets, migrations and synthetic seed data. Each
developer gets a separate local database. Real users, listings added through the
app, uploaded identity documents, sessions and credentials are not included.
Do not commit environment files or database files. Keep the generated encryption
key stable if you want to keep reading your local identity uploads.

The legacy `scripts/seed-samples.mjs` command now uses the current rental-only
catalogue and preserves existing records. Sample advertisements can also be added
with `node --env-file=.env.local scripts/seed-promotion.mjs` after migrations.

## Checks

```sh
node scripts/test-auth.mjs
node scripts/test-i18n-ads.mjs
npm run build
```

These regression scripts create their own test databases. A build requires local
environment settings. VPS deployment is separate; see
[test deployment](docs/test-deployment.md). Running local setup does not deploy.
