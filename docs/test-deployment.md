# Isolated VPS test deployment

- URL: https://addisroom.31.97.125.217.sslip.io
- VPS: 31.97.125.217 (srv1786145.hstgr.cloud)
- Container / Compose project: addisroom-test
- Memory limit: 512 MB; CPU limit: 1 core
- Database: addisroom-test-data volume, /data/addisroom.db
- Checkout: /opt/addisroom-test/repo
- Private settings: /opt/addisroom-test/runtime.env (0600, outside Git)

One Next.js container shares the existing bingo-edge proxy network. It does not
publish a host port or start a second proxy or database server. Caddy receives one
additional hostname route and is validated before reloading. The host file is
passed through stdin to `caddy validate` and `caddy reload`; the current single-file
bind mount points at an older inode, so reloading its in-container path would
otherwise omit the new route. No proxy restart is required.

The server starts with a fresh SQLite database and clearly labeled synthetic
listings. No local accounts, sessions, identity documents or provider credentials
are copied. Email/SMS delivery and Google login require separately configured
server settings. Google must allow the callback URL:
https://addisroom.31.97.125.217.sslip.io/api/auth/google/callback

## GitHub deployment

Pushes to Yosef781227/addisroom, branch mvp-auth-admin-search, trigger
.github/workflows/deploy-test.yml. CI uses a dedicated SSH key restricted to
running /opt/addisroom-test/deploy-test.sh; it cannot open a shell or forward ports.
The script fetches that branch, builds only this app and waits for its health check.

Server commands:

```sh
cd /opt/addisroom-test/repo
docker compose ps
docker compose logs --tail=80
docker stats --no-stream addisroom-test
```

The persistent volume survives app updates. Never run `docker compose down -v`
unless intentionally deleting the test database. Keep IDENTITY_ENCRYPTION_KEY
stable and back it up with the database if real identity documents are later used.
The startup seed is idempotent and runs only with TEST_DEPLOYMENT=true.

## Verification

The first GitHub Actions deployment completed successfully. Public HTTPS health,
homepage, cascading neighborhood search, map tiles, theme switching, mobile layout
and anonymous admin redirects were checked in the browser. The container was
healthy with zero restarts and used approximately 166 MB after browsing, under
its 512 MB cap. Existing Bingo and Content Machine responses were checked after
the proxy change.
