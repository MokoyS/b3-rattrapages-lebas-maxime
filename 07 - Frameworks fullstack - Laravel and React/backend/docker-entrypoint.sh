#!/bin/sh
set -e

echo "Waiting for the database to be ready..."
attempt=0
until php bin/console dbal:run-sql "SELECT 1"; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 15 ]; then
    echo "Could not reach the database after 15 attempts, giving up."
    exit 1
  fi
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
