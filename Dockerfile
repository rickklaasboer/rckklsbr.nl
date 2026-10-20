# syntax=docker/dockerfile:1

FROM node:24-slim AS frontend
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack install && pnpm install --frozen-lockfile
COPY vite.config.js ./
COPY resources/ resources/
COPY public/ public/
RUN pnpm build

FROM composer:2.10 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
COPY app/ app/
COPY bootstrap/ bootstrap/
COPY config/ config/
COPY database/ database/
COPY routes/ routes/
COPY artisan ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

FROM serversideup/php:8.4-fpm-nginx-alpine-v5.0.1 AS base

# Base image already ships pdo_mysql, pcntl, opcache and zip.

FROM base AS dev

USER root
COPY --from=composer:2.10 /usr/bin/composer /usr/bin/composer

# Match the host user so the bind mount stays writable.
ARG PUID=1000
ARG PGID=1000
RUN docker-php-serversideup-set-id www-data ${PUID}:${PGID} \
    && docker-php-serversideup-set-file-permissions --owner ${PUID}:${PGID} --service nginx

COPY docker/app/dev-entrypoint.sh /usr/local/bin/dev-entrypoint
USER www-data

ENTRYPOINT ["dev-entrypoint"]
CMD ["/init"]

FROM base AS prod

WORKDIR /var/www/html

COPY --chown=www-data:www-data . .
COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor
COPY --from=frontend --chown=www-data:www-data /app/public/build ./public/build

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

USER www-data

ARG APP_COMMIT=dev
ARG APP_BUILT_AT
ENV APP_COMMIT=$APP_COMMIT APP_BUILT_AT=$APP_BUILT_AT

ENV AUTORUN_ENABLED=true
ENV PHP_OPCACHE_ENABLE=1
