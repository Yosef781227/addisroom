"""Add only AddisRoom's hostname to the existing Caddy configuration."""
from pathlib import Path
import subprocess
config = Path('/opt/bingo/deploy/Caddyfile')
backup = Path('/opt/addisroom-test/caddy-before-addisroom.bak')
host = 'addisroom.31.97.125.217.sslip.io'
original = config.read_text()
already_configured = f'{host} {{' in original
if not backup.exists():
    backup.write_text(original)
    backup.chmod(0o600)
route = f'''
# Isolated AddisRoom test container
{host} {{
    encode zstd gzip
    header X-Content-Type-Options nosniff
    reverse_proxy addisroom-test:3000
}}
'''
# Write in place: this single file is bind-mounted into the running proxy.
try:
    updated = original if already_configured else original + route
    config.write_text(updated)
    subprocess.run(['docker', 'exec', '-i', 'bingo-caddy-1', 'caddy', 'validate', '--config', '-', '--adapter', 'caddyfile'], input=updated, text=True, check=True)
    subprocess.run(['docker', 'exec', '-i', 'bingo-caddy-1', 'caddy', 'reload', '--config', '-', '--adapter', 'caddyfile'], input=updated, text=True, check=True)
except Exception:
    config.write_text(original)
    raise
print('AddisRoom hostname added; existing routes retained.')
