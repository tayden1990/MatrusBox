#!/bin/bash
set -e

echo "Creating Matrus database and extensions..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    CREATE EXTENSION IF NOT EXISTS "unaccent";
    
    -- Create additional schemas if needed
    -- CREATE SCHEMA IF NOT EXISTS analytics;
    
    GRANT ALL PRIVILEGES ON DATABASE matrus TO matrus;
EOSQL

echo "Database initialization completed."