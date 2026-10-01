#!/bin/sh
set -e

echo "Waiting for the database to be ready..."
until php bin/console dbal:run-sql "SELECT 1" > /dev/null 2>&1; do
  sleep 2
done

echo "Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

if [ ! -f var/.fixtures_loaded ]; then
  echo "Loading initial product catalog (fixtures)..."
  php bin/console doctrine:fixtures:load --no-interaction
  mkdir -p var
  touch var/.fixtures_loaded
fi

echo "Starting Symfony on 0.0.0.0:8000..."
exec php -S 0.0.0.0:8000 -t public
