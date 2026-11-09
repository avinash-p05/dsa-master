# Deploying DSA Master

> **Release 1.0.1 (`release/1.0.1-github-login`)** ships with **GitHub sign-in only**.
> Google and email/password are built in, and stay off until their credentials are added.

## How the server is organised

One server, many apps, no shared config files between apps:

```
Internet :80/:443
    │
    ▼
~/edge   (edge-caddy)            ← the ONLY thing bound to 80/443; automatic HTTPS
  Caddyfile:  import sites/*.caddy
  sites/
    fincore.caddy      → reverse_proxy fincore-frontend:80
    dsa-master.caddy   → reverse_proxy dsa-master:8080
    <next-app>.caddy   → …
    │   (shared Docker network "edge")
    ▼
~/fin-core     its own compose project, own DB, joins "edge" as fincore-frontend
~/dsa-master   its own compose project, own DB, joins "edge" as dsa-master
```

- Apps **publish no host ports**, so they never clash. The edge proxy reaches each one by its alias on the `edge` network.
- Adding or updating one app never restarts another. A new site goes live with a **graceful reload** of the proxy, with no downtime for existing sites.

## First deploy of DSA Master

Prerequisites: the edge proxy is running (see "Edge proxy" below), and `dsamaster.duckdns.org` points at the server.

**1. Create the GitHub OAuth app** at <https://github.com/settings/developers> → *New OAuth App*
- Homepage URL: `https://dsamaster.duckdns.org`
- Authorization callback URL: `https://dsamaster.duckdns.org/login/oauth2/code/github`

**2. Clone and configure**

```bash
git clone -b release/1.0.1-github-login https://github.com/avinash-p05/dsa-master.git ~/dsa-master
cd ~/dsa-master
cp .env.example .env && chmod 600 .env
nano .env        # DOMAIN, DB_PASSWORD (openssl rand -base64 32), GITHUB_CLIENT_ID/SECRET
```

**3. Start the app**

```bash
docker compose up -d --build
docker compose ps                     # app should become "healthy"
```

**4. Register the site with the edge proxy** (first time only)

```bash
cp deploy/edge/dsa-master.caddy ~/edge/sites/
~/edge/reload.sh
```

Caddy fetches the HTTPS certificate on the first request to `https://dsamaster.duckdns.org`.

## Updating

```bash
cd ~/dsa-master && git pull && docker compose up -d --build
```

Only this app's container is recreated. Flyway applies any new database migrations at startup.

## Turning on more sign-in methods later

Set these in `.env`, then run `docker compose up -d`:
- **Google:** `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (redirect URI `https://<DOMAIN>/login/oauth2/code/google`).
- **Email/password:** `PASSWORD_LOGIN_ENABLED=true` plus SMTP. For Gmail: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, your Gmail address as `SMTP_USERNAME`, a 16-character **App Password** as `SMTP_PASSWORD`, and `MAIL_FROM` set to the same address.

## Operations

| Task | Command |
| --- | --- |
| Status | `docker compose ps` |
| Logs | `docker compose logs -f app` |
| Health | `docker compose exec app wget -qO- localhost:8080/actuator/health` |
| Restart | `docker compose restart app` |
| DB shell | `docker compose exec db psql -U dsamaster dsamaster` |
| Backup DB | `docker compose exec -T db pg_dump -U dsamaster dsamaster \| gzip > ~/backups/dsa-master-$(date +%F).sql.gz` |
| Restore DB | `gunzip -c backup.sql.gz \| docker compose exec -T db psql -U dsamaster dsamaster` |

---

## Edge proxy (server-level, set up once)

It lives in `~/edge` on the server, separate from every app:

```
~/edge/
  compose.yaml       # Caddy on 80/443, joins the "edge" network
  Caddyfile          # global options + "import sites/*.caddy"
  sites/             # one file per app/domain
  reload.sh          # validate config, then reload gracefully
```

**compose.yaml**

```yaml
services:
  caddy:
    image: caddy:2-alpine
    container_name: edge-caddy
    restart: unless-stopped
    ports: ["80:80", "443:443", "443:443/udp"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./sites:/etc/caddy/sites:ro
      - caddy-data:/data
      - caddy-config:/config
    networks: [edge]
networks:
  edge: { external: true }
volumes:
  caddy-data:
  caddy-config:
```

**Caddyfile**

```
import sites/*.caddy
```

**reload.sh**

```bash
#!/bin/sh
set -e
docker exec edge-caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker exec edge-caddy caddy reload   --config /etc/caddy/Caddyfile --adapter caddyfile
echo "edge proxy reloaded"
```

Bootstrap:

```bash
docker network create edge
cd ~/edge && docker compose up -d
```

## Adding another app to the server

1. Give the app its own compose project with **no `ports:`**, and put its web-facing service on the external `edge` network with a unique alias:
   ```yaml
   services:
     web:
       networks:
         default: {}
         edge: { aliases: [my-app] }
   networks:
     edge: { external: true }
   ```
2. Point the domain's DNS at the server.
3. Add `~/edge/sites/my-app.caddy`:
   ```
   my-app.example.com {
       reverse_proxy my-app:3000
   }
   ```
4. Run `docker compose up -d` in the app folder, then `~/edge/reload.sh`.

Nothing else on the server is touched.
