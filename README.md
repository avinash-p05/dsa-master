# DSA Master

A concept-first roadmap of 180 curated LeetCode problems for mid-level interviews. Each topic teaches the pattern first, then lists its problems. You solve each problem on LeetCode and track your progress here, with notes, flags and a 2/7/14-day spaced review schedule.

- **Guests:** progress is saved in the browser.
- **Signed in (GitHub or Google):** progress is saved to your account and syncs across devices. Whatever you ticked as a guest is merged in when you sign in.

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router |
| Backend | Spring Boot 4 (Java 17+), Spring Security OAuth2 login, Spring Data JPA, Flyway, Spring Session JDBC |
| Database | PostgreSQL 17 |
| Deploy | One jar (SPA at `/`, API at `/api`) in Docker, behind Caddy for HTTPS |

## Repository layout

```
frontend/              React app (see frontend/src: pages, components, context, lib, data)
  src/data/roadmap.ts    ✏️ topics, concepts and problems
backend/               Spring Boot app
  src/main/java/com/dsamaster/
    auth/                OAuth user services, session + dev login endpoints
    progress/            Progress entity, service (merge logic), REST controller
    user/                User entity and service
    config/              Security, OAuth clients, CSRF, properties
    web/                 SPA route forwarding
  src/main/resources/
    db/migration/        Flyway SQL migrations
    application*.yml     Shared / dev / prod config
deploy/                Caddyfile and DEPLOY.md (VPS guide)
compose.yaml           Production stack (Caddy + app + Postgres)
compose.dev.yaml       Local Postgres for development
Dockerfile             Multi-stage build → small JRE image
```

## Local development

Prerequisites: Java 17+, Node 22, Docker.

```bash
docker compose -f compose.dev.yaml up -d          # Postgres on :5432

cd backend && ./mvnw -DskipFrontend spring-boot:run   # API on :8080 (dev profile)

cd frontend && npm install && npm run dev        # UI on :5173, proxies /api to :8080
```

Open <http://localhost:5173>. The dev profile adds a **Continue as dev user** sign-in, so you can test without OAuth credentials. To try real OAuth locally, export `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (callback `http://localhost:5173/login/oauth2/code/github`) before starting the backend.

### Build the production jar

```bash
cd backend && ./mvnw package      # builds the React app into the jar → target/dsa-master.jar
```

## API

All endpoints are under `/api`. Session cookie auth; state-changing requests must send the `X-XSRF-TOKEN` header with the value of the `XSRF-TOKEN` cookie.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/auth/session` | Current user (if any) and available login providers |
| POST | `/api/auth/logout` | Sign out |
| GET | `/oauth2/authorization/{github\|google}` | Start OAuth sign-in (browser redirect) |
| GET | `/api/progress` | All of the user's progress |
| PUT | `/api/progress/{slug}` | Replace one problem's progress (204 if it's now empty) |
| POST | `/api/progress/merge` | Merge guest or imported progress into the account |
| DELETE | `/api/progress` | Reset all progress |

## Deployment

See [deploy/DEPLOY.md](deploy/DEPLOY.md).
