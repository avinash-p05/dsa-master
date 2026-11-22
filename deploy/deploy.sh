#!/bin/sh
# Deploy the latest DSA Master image on the server. Lives in ~/dsa-master next to compose.yaml and .env.
# The image is built by GitHub Actions; the server never builds or needs the source code.
#   ./deploy.sh                      # pull and restart (IMAGE_TAG in .env, default latest)
set -eu
cd "$(dirname "$0")"

# Refresh compose.yaml, the edge site file and this script from main, so the server never drifts.
raw=https://raw.githubusercontent.com/avinash-p05/dsa-master/main
curl -fsSL "$raw/compose.yaml" -o compose.yaml.new && mv compose.yaml.new compose.yaml
curl -fsSL "$raw/deploy/edge/dsa-master.caddy" -o dsa-master.caddy.new && mv dsa-master.caddy.new dsa-master.caddy
# Takes effect next run (mv swaps the file; this run keeps reading the old one).
curl -fsSL "$raw/deploy/deploy.sh" -o deploy.sh.new && chmod +x deploy.sh.new && mv deploy.sh.new deploy.sh

docker compose pull app
docker compose up -d --no-build --remove-orphans app
docker image prune -f > /dev/null

echo "Waiting for DSA Master to report healthy..."
for _ in $(seq 1 60); do
  id=$(docker compose ps -q app)
  if [ "$(docker inspect "$id" --format '{{.State.Health.Status}}')" = healthy ]; then
    echo "DSA Master is up: $(docker inspect "$id" --format '{{.Config.Image}} (commit {{index .Config.Labels "org.opencontainers.image.revision"}})')"
    exit 0
  fi
  sleep 3
done
echo "DSA Master did not become healthy in 3 minutes; check: docker compose logs --tail=100 app" >&2
exit 1
