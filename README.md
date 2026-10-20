# rckklsbr.nl

Small URL shortener. The form on `/` stores a link under a random 8 character code, `/{code}` counts a click and redirects to the destination with a 302. Only `http` and `https` destinations are accepted. Creating is protected by Cloudflare Turnstile and limited to 10 attempts per hour per IP. `/links` (login required, 2FA optional) lists links with clicks and deletes them.

Stack: Laravel 13, PHP 8.4, Inertia with React, TypeScript and Tailwind 4 (Vite 8), MySQL 8.4.

Environment: `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` (the `.env.example` values are Cloudflare test keys), `APP_LOCALE=nl`. Create the admin with `php artisan user:create` (only possible while no user exists).

## Development

Requires Docker.

```bash
cp .env.example .env
docker compose run --rm --no-deps --entrypoint composer app install
docker compose up -d --build
docker compose exec app php artisan migrate
```

The dev container generates `APP_KEY` in `.env` on its first start.

| Service | URL |
| --- | --- |
| App | http://localhost:8001 |
| Vite | http://localhost:5174 |

### Tests

```bash
docker compose exec app php artisan test
docker compose exec app vendor/bin/pint --test
```

Tests run on MySQL in the database `rckklsbr_test`, created by `docker/mysql/init.sql` on the first start of the `mysql` container. Existing volume without it: `docker compose down -v` or create the database by hand.

## Production

GitHub Actions (`.github/workflows/docker.yml`) runs the tests on every push to `main` and on tags `v*`, then pushes `ghcr.io/rickklaasboer/rckklsbr.nl` with the tags `latest`, `sha-<short>` and the git tag. The GHCR package must be public, or the server needs `docker login ghcr.io` with a token that has `read:packages`.

`compose.prod.yaml` runs:

- `app`: nginx and PHP-FPM, published on `${APP_BIND:-127.0.0.1}:${APP_PORT:-8095}`. Runs migrations, `storage:link` and `optimize` on start.
- `mysql`: MySQL 8.4.
- `backup`: daily database dump to `./backups`, 14 days retention.

### First deploy

```bash
# on the server
mkdir -p /opt/rckklsbr.nl && cd /opt/rckklsbr.nl
# copy compose.prod.yaml, docker/ and .env.production.example here
mv .env.production.example .env
chmod 600 .env
```

Fill in `DB_PASSWORD` and `DB_ROOT_PASSWORD` (long random values), then:

```bash
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml run --rm --no-deps -e AUTORUN_ENABLED=false app php artisan key:generate --show   # paste into APP_KEY
docker compose -f compose.prod.yaml up -d
```

### Central Caddy

Add the block from `deploy/central-caddy.example` to the Caddy of the host and reload it. The app trusts the forwarded headers of the proxy, so it must only be reachable through the proxy.

### Updating

```bash
docker compose -f compose.prod.yaml pull && docker compose -f compose.prod.yaml up -d
```

Migrations run when the `app` container starts. To pin a version, set `APP_TAG` in `.env` to `sha-<short>` or a git tag.

### Backups

The `backup` service writes `./backups/rckklsbr-YYYY-MM-DD.sql.gz` every 24 hours and deletes dumps older than 14 days. Copy that directory off the server as well.

Restore:

```bash
gunzip -c backups/rckklsbr-2026-10-20.sql.gz | docker compose -f compose.prod.yaml exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
```

### Migrating the existing database

The live schema is `links(code, destination longtext, created_at, updated_at)` in the existing `mysql` container. Load only the rows into the freshly migrated database of this stack; `clicks` starts at 0.

```bash
# 1. on the host: dump the rows of the old container (database name and credentials as in its own setup)
docker exec mysql mysqldump --no-create-info --complete-insert --skip-triggers -u<user> -p <database> links > links.sql
# 2. start the new stack once so the migrations create the tables, then create the admin
docker compose -f compose.prod.yaml up -d
docker compose -f compose.prod.yaml exec app php artisan user:create
# 3. load the rows (16 expected) and check the count
docker compose -f compose.prod.yaml exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < links.sql
docker compose -f compose.prod.yaml exec mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "select count(*) from links"'
```

Switch the Caddy upstream to port 8095 only after the count matches, and keep the old container until then.
