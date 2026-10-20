#!/bin/sh
set -e
cd /var/www/html

[ -f .env ] || cp .env.example .env

# app, queue and scheduler start together: lock so only one generates the key
flock .env sh -c "grep -Eq '^APP_KEY=.+' .env || php artisan key:generate --force --no-interaction"

# env_file was read before the key existed; an empty APP_KEY env var would win over .env
APP_KEY="$(sed -n 's/^APP_KEY=//p' .env)"
export APP_KEY

exec docker-php-serversideup-entrypoint "$@"
