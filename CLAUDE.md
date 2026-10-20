@../homelab/CLAUDE.md

# CLAUDE.md

URL shortener for rckklsbr.nl. Public form creates a link (8 random chars, `links.code` is the string PK), `/{code}` counts the click and answers a 302 to the destination. Only http and https destinations. Create is protected by Turnstile and 10 attempts per hour per IP. Admin (`/links`, single user via Fortify with 2FA) lists and deletes links. Laravel 13, PHP 8.4, Inertia + React + TypeScript + Tailwind 4 (Vite 8), MySQL 8.4, pnpm. Setup and deploy: `README.md`.

## Commands

Everything runs in Docker (dev app on http://localhost:8001, Vite on 5174).

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app php artisan migrate
docker compose exec app php artisan test    # Pest on MySQL db rckklsbr_test (created by docker/mysql/init.sql)
docker compose exec app vendor/bin/pint --test
docker compose exec app php artisan user:create    # the single admin user
pnpm typecheck && pnpm test && pnpm i18n:check && pnpm build
```

## Rules

- Track work on the board HLAB (label `non-code` or none yet: ask Rick for a repo label). See the homelab CLAUDE.md.
- Commits: Angular format, English, no attribution. Never read `.env`, only `.env.example`.
- Deploy: push to `main` builds `ghcr.io/rickklaasboer/rckklsbr.nl`. Prod compose is `compose.prod.yaml` on zwolle-edge, port 8095. The central Caddy block is mirrored in `deploy/central-caddy.example`.
- Existing production schema: `links(code PK string, destination longtext, timestamps)` plus old unused Laravel tables. Never edit or delete old migrations; add new ones.
