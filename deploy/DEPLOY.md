# Deploying DSA Master

> **Release 1.0.1 (`release/1.0.1-github-login`)** ships with **GitHub sign-in only**.
> Google and email/password are built in, and stay off until their credentials are added.

## How the server is organised

One server, many apps. Shared infrastructure lives in its own folders, and every app is a self-contained module:

```
Internet :80/:443
    │
    ▼
~/edge       edge-caddy          the ONLY thing on 80/443: HTTPS + API gateway
             edge-crowdsec       reads the access log, bans abusive IPs
               sites/fincore.caddy     → fincore-app:8080
               sites/dsa-master.caddy  → dsa-master:8080
               sites/<next>.caddy      → …
    │   Docker network "edge"
    ▼
~/fin-core   FinCore (one container)
~/dsa-master DSA Master (one container)
~/<next>     …
    │   Docker network "platform"
    ▼
~/platform   platform-postgres, platform-redis, platform-kafka (shared; one DB + role per app)
```

Every site imports the edge's `protect` snippet, which applies CrowdSec bans, blocks scanner probes (`/.env`, `/wp-admin`, `*.php`), limits each IP (30/min on sign-in paths, 600/min overall) and caps request bodies at 10 MB. Details are in the `server-edge` repo README.

- Apps **publish no host ports**, so they never clash. The proxy and the database are reached by name over private Docker networks.
- Each app has its **own database and login role**. `PUBLIC` connect rights are revoked, so an app can't open another app's database.
- Deploying or updating one app never restarts another. A new site goes live with a **graceful proxy reload**, with no downtime for the other sites.

## First deploy of DSA Master

Prerequisites: `~/edge` and `~/platform` are running (see "Server infrastructure" below), and `dsamaster.duckdns.org` points at the server.

**1. Create the GitHub OAuth app** at <https://github.com/settings/developers> → *New OAuth App*
- Homepage URL: `https://dsamaster.duckdns.org`
- Authorization callback URL: `https://dsamaster.duckdns.org/login/oauth2/code/github`

**2. Clone and configure**

```bash
git clone -b release/1.0.1-github-login https://github.com/avinash-p05/dsa-master.git ~/dsa-master
cd ~/dsa-master
cp .env.example .env && chmod 600 .env
nano .env        # DOMAIN, DB_PASSWORD (openssl rand -hex 24), GITHUB_CLIENT_ID/SECRET
```

**3. Create its database on the shared Postgres**

```bash
set -a; . ./.env; set +a
APP_DB_PASSWORD="$DB_PASSWORD" ~/platform/create-app-db.sh dsamaster
```

**4. Start the app**

```bash
docker compose up -d --build
docker compose ps                     # app should become "healthy"
```

**5. Register the site with the edge proxy** (first time only)

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

| Task | Command (in `~/dsa-master`) |
| --- | --- |
| Status | `docker compose ps` |
| Logs | `docker compose logs -f app` |
| Health | `docker compose exec app wget -qO- localhost:8080/actuator/health` |
| Restart | `docker compose restart app` |
| DB shell | `docker exec -it platform-postgres psql -U dsamaster dsamaster` |
| Backup (all DBs) | `~/platform/backup.sh` (runs nightly at 03:30; encrypted copy to Backblaze B2) |

---

## Server infrastructure (set up once)

### Networks

```bash
docker network create edge
docker network create platform
```

### `~/edge`: shared reverse proxy and API gateway (repo `server-edge`)

```
~/edge/
  compose.yaml   Caddy on 80/443 (edge-caddy, custom build with rate_limit + CrowdSec plugins) and edge-crowdsec
  Caddyfile      global gateway settings, the access_log and protect snippets, import sites/*.caddy
  sites/         one file per app/domain
  .env           CROWDSEC_BOUNCER_KEY (chmod 600)
  reload.sh      validate, then reload gracefully
```

`cd ~/edge && docker compose up -d --build`

### `~/platform`: shared Postgres, Redis, Kafka (repo `server-platform`)

```
~/platform/
  compose.yaml        platform-postgres, platform-redis, platform-kafka; join "platform", no host ports
  .env                POSTGRES_PASSWORD (superuser; chmod 600)
  create-app-db.sh    APP_DB_PASSWORD=… ./create-app-db.sh <app>   (idempotent: role + database)
  backup.sh           pg_dumpall → ~/platform/backups (14 days), then offsite.sh
  offsite.sh          restic → Backblaze B2, encrypted; settings in .backup.env (chmod 600)
```

`cd ~/platform && docker compose up -d`

## Adding another app to the server

1. Give the app its own compose project with **no `ports:`**. Put its web service on the external `edge` network with a unique alias, and anything that needs the database on `platform`:
   ```yaml
   services:
     web:
       networks:
         edge: { aliases: [my-app] }
         platform: {}
   networks:
     edge: { external: true }
     platform: { external: true }
   ```
   Its database URL is `postgres://my_app:<password>@platform-postgres:5432/my_app`.
2. Create its database: `APP_DB_PASSWORD=… ~/platform/create-app-db.sh my_app`.
3. Point the domain's DNS at the server, then add `~/edge/sites/my-app.caddy`:
   ```
   my-app.example.com {
       import access_log
       import protect myapp      # unique name per site
       reverse_proxy my-app:3000
   }
   ```
4. Run `docker compose up -d` in the app folder, then `~/edge/reload.sh`.

Nothing else on the server is touched.
