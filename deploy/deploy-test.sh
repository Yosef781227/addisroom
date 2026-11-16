#!/bin/bash
set -euo pipefail
# This is also the forced command for the GitHub-only SSH deployment key.
if [[ -n "${SSH_ORIGINAL_COMMAND:-}" && "${SSH_ORIGINAL_COMMAND}" != deploy ]]; then
  echo 'This key can only deploy AddisRoom.' >&2
  exit 1
fi
exec 9>/opt/addisroom-test/deploy.lock
flock -w 600 9
cd /opt/addisroom-test/repo
git fetch --depth=1 origin mvp-auth-admin-search
git checkout --detach FETCH_HEAD
docker compose build
docker compose up -d --no-deps --wait --wait-timeout 120
printf 'AddisRoom deployed from commit %s\n' "$(git rev-parse --short HEAD)"
