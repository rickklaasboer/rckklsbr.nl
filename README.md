# rckklsbr.nl

Small URL shortener. The form on `/` stores a link under a random 8 character code, `/{code}` redirects to the destination with a 301. Only `http` and `https` destinations are accepted.

Stack: Laravel 13, PHP 8.4, Blade with Bootstrap 5 (Vite 8), MySQL 8.4.

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

The live schema is `links(code, destination longtext, created_at, updated_at)`. A dump of that table can be loaded into the new `mysql` container before the first start of `app`; the migrations then skip what already exists only if the `migrations` table was part of the dump. Without it, load only the `links` rows into a freshly migrated database.
