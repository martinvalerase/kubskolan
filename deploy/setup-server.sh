#!/usr/bin/env bash
# Engångsinstallation av VPS:en för Kubskolan (Ubuntu/Debian). Kör som root, går att köra om.
#   curl -fsSL https://raw.githubusercontent.com/martinvalerase/kubskolan/main/deploy/setup-server.sh | bash -s -- "ssh-ed25519 AAAA... kubskolan-deploy"
set -euo pipefail

DOMAIN="kubskolan.se"
SITE_DIR="/var/www/kubskolan"
DEPLOY_USER="deploy"
PUBKEY="${1:-}"

[ "$(id -u)" -eq 0 ] || { echo "Kör som root (eller med sudo)." >&2; exit 1; }
[ -n "$PUBKEY" ] || { echo "Ange deploy-nyckelns publika del som argument." >&2; exit 1; }
. /etc/os-release
case "${ID:-}${ID_LIKE:-}" in
  *debian*|*ubuntu*) ;;
  *) echo "Stöds bara på Ubuntu/Debian (hittade: ${PRETTY_NAME:-okänt})." >&2; exit 1 ;;
esac

echo "==> Paket"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q debian-keyring debian-archive-keyring apt-transport-https curl gnupg rsync ufw
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q
  apt-get install -y -q caddy
fi

echo "==> Deploy-användare"
id "$DEPLOY_USER" >/dev/null 2>&1 || useradd -m -s /bin/bash "$DEPLOY_USER"
passwd -l "$DEPLOY_USER" >/dev/null
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
AUTH="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "$AUTH"
grep -qxF "$PUBKEY" "$AUTH" || echo "$PUBKEY" >> "$AUTH"
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH"
chmod 600 "$AUTH"

echo "==> Webbkatalog"
install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$SITE_DIR"
if [ -z "$(ls -A "$SITE_DIR")" ]; then
  echo '<!doctype html><meta charset="utf-8"><title>Kubskolan</title><p>Kubskolan kommer snart.</p>' > "$SITE_DIR/index.html"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$SITE_DIR/index.html"
fi

echo "==> Caddy"
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
	root * $SITE_DIR
	encode gzip
	file_server
	header /sw.js Cache-Control "no-cache"
}

www.$DOMAIN {
	redir https://$DOMAIN{uri} permanent
}
EOF
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl enable --now caddy
systemctl reload caddy

echo "==> Brandvägg"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "Klart! https://$DOMAIN serveras från $SITE_DIR (certifikat hämtas automatiskt när DNS pekar hit)."
