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

## 4. Get the code and configure it

```bash
git clone https://github.com/avinash-p05/dsa-master.git
cd dsa-master
cp .env.example .env
nano .env        # set DOMAIN, DB_PASSWORD (openssl rand -base64 32) and the OAuth IDs/secrets
chmod 600 .env
```

## 5. Start everything

```bash
docker compose up -d --build
docker compose logs -f app      # wait for "Started DsaMasterApplication"
```

Open `https://YOUR_DOMAIN`. Caddy fetches the certificate on the first request.
Database migrations (Flyway) run automatically at startup.

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
