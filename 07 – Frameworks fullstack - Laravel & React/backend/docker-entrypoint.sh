#!/bin/sh
set -e

echo "Waiting for the database to be ready..."
until php bin/console dbal:run-sql "SELECT 1" > /dev/null 2>&1; do
  sleep 2
done

echo "Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

if [ "$LOAD_FIXTURES" = "true" ]; then
  echo "Loading initial product catalog (fixtures)..."
  php bin/console doctrine:fixtures:load --no-interaction
fi

PORT="${PORT:-8000}"
echo "Starting Symfony on 0.0.0.0:$PORT..."
exec php -S "0.0.0.0:$PORT" -t public
