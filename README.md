# DSA Master

A concept-first roadmap of 180 curated LeetCode problems for mid-level interviews. Each topic teaches the pattern first, then lists its problems. You solve each problem on LeetCode and track your progress here, with notes, flags and a 2/7/14-day spaced review schedule.

- **Guests:** progress is saved in the browser.
- **Signed in (GitHub, Google, or email + password with email verification):** progress is saved to your account and syncs across devices. Whatever you ticked as a guest is merged in when you sign in.

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router |
| Backend | Spring Boot 4 (Java 17+), Spring Security (OAuth2 + email/password), Spring Mail (SMTP), Spring Data JPA, Flyway, Spring Session JDBC |
| Database | PostgreSQL 17 |
| Deploy | One jar (SPA at `/`, API at `/api`) in Docker, behind a shared edge Caddy proxy for HTTPS |

## Repository layout

```
frontend/              React app (see frontend/src: pages, components, context, lib, data)
  src/data/roadmap.ts    ✏️ topics, concepts and problems
backend/               Spring Boot app
  src/main/java/com/dsamaster/
    auth/                OAuth user services, session + dev login endpoints
    auth/local/          Email/password sign-up, login, verification, reset tokens
    mail/                SMTP email sending + templates
    progress/            Progress entity, service (merge logic), REST controller
    user/                User entity and service
    config/              Security, OAuth clients, CSRF, properties
    web/                 SPA route forwarding
  src/main/resources/
    db/migration/        Flyway SQL migrations
    application*.yml     Shared / dev / prod config
deploy/                edge/dsa-master.caddy (site file for the edge proxy) and DEPLOY.md
compose.yaml           Production stack (app + Postgres, joins the server's "edge" network)
compose.dev.yaml       Local Postgres for development
Dockerfile             Multi-stage build → small JRE image
```

## Local development

Prerequisites: Java 17+, Node 22, Docker.

```bash
docker compose -f compose.dev.yaml up -d          # Postgres on :5432, Mailpit inbox on :8025

cd backend && ./mvnw -DskipFrontend spring-boot:run   # API on :8080 (dev profile)

cd frontend && npm install && npm run dev        # UI on :5173, proxies /api to :8080
```

Open <http://localhost:5173>. The dev profile adds a **Continue as dev user** sign-in, so you can test without OAuth credentials. Emails (verification and reset links) go to Mailpit at <http://localhost:8025>. Set `SMTP_HOST=` in `backend/.env` to print them to the log instead.

For local credentials, copy `backend/.env.example` to `backend/.env`; Spring Boot loads it automatically. Real GitHub login locally needs a separate *dev* OAuth app with callback `http://localhost:5173/login/oauth2/code/github`, because a GitHub OAuth app allows only one callback URL.

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
| POST | `/api/auth/register` | Create an email/password account (sends a verification email) |
| POST | `/api/auth/login` | Email/password sign-in (verified accounts only) |
| POST | `/api/auth/verify-email` | Confirm the emailed token and sign in |
| POST | `/api/auth/resend-verification` | Send a new verification email |
| POST | `/api/auth/forgot-password` | Email a password-reset link |
| POST | `/api/auth/reset-password` | Set a new password from the emailed token (signs out other sessions) |
| GET | `/oauth2/authorization/{github\|google}` | Start OAuth sign-in (browser redirect) |
| GET | `/api/progress` | All of the user's progress |
| PUT | `/api/progress/{slug}` | Replace one problem's progress (204 if it's now empty) |
| POST | `/api/progress/merge` | Merge guest or imported progress into the account |
| DELETE | `/api/progress` | Reset all progress |

## Deployment

See [deploy/DEPLOY.md](deploy/DEPLOY.md).
