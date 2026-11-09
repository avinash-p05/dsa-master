# Deploying to a VPS (Contabo)

The stack runs on one server with Docker Compose:

```
Internet ──► Caddy :443 (HTTPS, auto certificates)
               └──► app :8080  (Spring Boot: SPA at "/", API at "/api")
                       └──► db :5432 (PostgreSQL 17, private)
```

## 1. Before you start

- **A domain** (or a subdomain) with an **A record pointing to the server's IP**.
  Google OAuth doesn't accept bare IP addresses as redirect URIs, and HTTPS needs a domain.
- Ports **80** and **443** open in the server firewall.
- The server needs about 2 GB of free RAM to build the image (Maven + Node). If it's short on memory, build on your PC and copy the image across (see step 6).

## 2. Install Docker on the server (Ubuntu/Debian)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out and back in afterwards
```

## 3. Create the OAuth apps

**GitHub** → <https://github.com/settings/developers> → *New OAuth App*
- Homepage URL: `https://YOUR_DOMAIN`
- Authorization callback URL: `https://YOUR_DOMAIN/login/oauth2/code/github`

**Google** → <https://console.cloud.google.com/apis/credentials> → *Create credentials → OAuth client ID → Web application*
- Authorised JavaScript origins: `https://YOUR_DOMAIN`
- Authorised redirect URIs: `https://YOUR_DOMAIN/login/oauth2/code/google`
- Set up the OAuth consent screen (app name, support email, and the `email`/`profile` scopes). Publish it so anyone can sign in.

You can deploy with only one provider. The UI shows a button for each provider that has credentials.

## 3b. Email (email/password sign-up)

Email/password accounts need outgoing mail for the verification and password-reset links. The app sends mail itself over **SMTP**, so any provider works. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` and `MAIL_FROM` in `.env`:

| Provider | Host / port | Notes |
| --- | --- | --- |
| Gmail | `smtp.gmail.com` / 587 | Turn on 2-Step Verification, then create an **App Password** (Google Account → Security → App passwords). About 500 emails a day. |
| Brevo | `smtp-relay.brevo.com` / 587 | Free tier: 300 emails a day. Verify your sender address first. |
| Zoho, Outlook, SES… | see the provider's docs | Any STARTTLS SMTP server on 587 works. |

`MAIL_FROM` must be an address the SMTP account is allowed to send as (for Gmail, your Gmail address).
If `SMTP_HOST` is empty, emails are written to the app log instead of being sent: fine for testing, not for real users.

## 4. Get the code and configure it

```bash
git clone https://github.com/avinash-p05/dsa-master.git
cd dsa-master
cp .env.example .env
nano .env        # set DOMAIN, DB_PASSWORD (openssl rand -base64 32), OAuth IDs/secrets and SMTP
chmod 600 .env
```

## 5. Start everything

First check whether something already serves websites on this server:

```bash
sudo ss -tlnp | grep -E ':(80|443|8080)\s'
```

### A. Ports 80/443 are already in use (another site on Nginx, Apache…)

Run only the app and the database. The app is published on `127.0.0.1:8080`; set `APP_PORT=8081` (or similar) in `.env` if 8080 is taken.

```bash
docker compose up -d --build
docker compose logs -f app      # wait for "Started DsaMasterApplication"
curl -s localhost:8080/actuator/health
```

Then point your existing web server at it.

**Nginx** (see `deploy/nginx-dsamaster.conf`):

```bash
sudo cp deploy/nginx-dsamaster.conf /etc/nginx/sites-available/dsamaster
sudo ln -s /etc/nginx/sites-available/dsamaster /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d dsamaster.duckdns.org
```

**Caddy already on the host:** add this to its Caddyfile and reload:

```
dsamaster.duckdns.org {
    reverse_proxy 127.0.0.1:8080
}
```

**Traefik / nginx-proxy in Docker:** put the `app` service on that proxy's network and add its labels or `VIRTUAL_HOST` env (container port 8080).

### B. Fresh server, nothing on 80/443

```bash
docker compose --profile caddy up -d --build
```

The bundled Caddy gets the HTTPS certificate on the first request.

Either way, open `https://YOUR_DOMAIN`. Database migrations (Flyway) run automatically at startup.

## 6. Updating

```bash
git pull
docker compose up -d --build app
```

**Low-memory server?** Build on your PC instead and send only the image:

```bash
docker build -t dsa-master:latest .
docker save dsa-master:latest | gzip | ssh user@SERVER 'gunzip | docker load'
ssh user@SERVER 'cd dsa-master && docker compose up -d --no-build app'
```

## Operations

| Task | Command |
| --- | --- |
| App logs | `docker compose logs -f app` |
| Health | `curl -s localhost:8080/actuator/health` |
| Restart app | `docker compose restart app` |
| DB shell | `docker compose exec db psql -U dsamaster dsamaster` |
| Backup DB | `docker compose exec -T db pg_dump -U dsamaster dsamaster \| gzip > backup-$(date +%F).sql.gz` |
| Restore DB | `gunzip -c backup.sql.gz \| docker compose exec -T db psql -U dsamaster dsamaster` |

Set up a daily cron job for the backup command and copy the files off the server.

## Running the jar without Docker (alternative)

```bash
# On your PC
cd backend && ./mvnw -DskipTests package       # -> target/dsa-master.jar

# On the server (Java 17+ and PostgreSQL installed)
SPRING_PROFILES_ACTIVE=prod DB_URL=jdbc:postgresql://localhost:5432/dsamaster \
DB_USERNAME=dsamaster DB_PASSWORD=... GITHUB_CLIENT_ID=... GITHUB_CLIENT_SECRET=... \
java -jar dsa-master.jar
```

Put it behind Caddy or Nginx for HTTPS, and run it with systemd so it restarts on reboot.
