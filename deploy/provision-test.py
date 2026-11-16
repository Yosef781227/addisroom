"""Run on the approved VPS once. Never imports local credentials or user data."""
import os
import secrets
from pathlib import Path
root = Path('/opt/addisroom-test')
env = root / 'runtime.env'
if not env.exists():
    values = {
        'DATABASE_URL': 'file:/data/addisroom.db',
        'NEXT_PUBLIC_APP_URL': 'https://addisroom.31.97.125.217.sslip.io',
        'AUTH_DELIVERY_MODE': 'provider',
        'AUTH_EMAIL_FROM': '',
        'RESEND_API_KEY': '',
        'GOOGLE_CLIENT_ID': '',
        'GOOGLE_CLIENT_SECRET': '',
        'IDENTITY_ENCRYPTION_KEY': secrets.token_hex(32),
        'TRUST_PROXY': 'false',
        'TEST_DEPLOYMENT': 'true',
    }
    fd = os.open(env, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as f:
        f.write(''.join(f'{k}={v}\n' for k, v in values.items()))
script = root / 'deploy-test.sh'
script.chmod(0o700)
public_key = (root / 'github-deploy.pub').read_text().strip()
authorized = Path('/root/.ssh/authorized_keys')
entry = f'restrict,command="/opt/addisroom-test/deploy-test.sh" {public_key}'
existing = authorized.read_text() if authorized.exists() else ''
if public_key not in existing:
    with authorized.open('a') as f:
        f.write('\n' + entry + '\n')
    authorized.chmod(0o600)
print('Fresh test environment and restricted deployment key configured.')
