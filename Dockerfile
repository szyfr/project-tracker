# syntax=docker/dockerfile:1

################################################################################
# Stage 1 — PHP dependencies (production only)
################################################################################
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction

COPY . .

RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

################################################################################
# Stage 2 — Frontend assets
#
# Vite runs the Wayfinder plugin, which shells out to `php artisan`, so this
# stage needs both Node and a PHP CLI with the application's vendor directory.
################################################################################
FROM node:24-trixie-slim AS assets

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        php8.4-cli \
        php8.4-mbstring \
        php8.4-xml \
        php8.4-sqlite3 \
        php8.4-curl \
        php8.4-zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .
COPY --from=vendor /app/vendor ./vendor

# A key is required for the container to boot artisan during `wayfinder:generate`.
RUN cp .env.example .env \
    && php artisan key:generate --no-interaction \
    && npm run build \
    && rm .env

################################################################################
# Stage 3 — Runtime (FrankenPHP / Caddy)
################################################################################
FROM dunglas/frankenphp:1-php8.4 AS runtime

RUN install-php-extensions \
        bcmath \
        intl \
        opcache \
        pcntl \
        pdo_sqlite \
        zip

ENV APP_ENV=production \
    APP_DEBUG=false \
    SERVER_NAME=:80

WORKDIR /app

COPY --chown=www-data:www-data . .
COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor
COPY --from=assets --chown=www-data:www-data /app/public/build ./public/build

COPY --chmod=755 <<'ENTRYPOINT' /usr/local/bin/docker-entrypoint.sh
#!/bin/sh
set -e

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-interaction
fi

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    touch database/database.sqlite
fi

php artisan migrate --force --no-interaction
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
ENTRYPOINT

RUN mkdir -p storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && cp .env.example .env \
    && chown www-data:www-data /app \
    && chown -R www-data:www-data storage bootstrap/cache database .env

USER www-data

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["frankenphp", "php-server", "--root", "public/", "--listen", ":80"]
