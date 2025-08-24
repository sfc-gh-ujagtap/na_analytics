#!/bin/bash
set -e

echo "Setting up Native Apps Analytics Platform..."

echo "Step 1: Creating application role and granting to current user"
snowsql -c default -f scripts/create_app_role.sql

echo "Step 2: Dropping existing database to ensure clean ownership"
snowsql -c default -q "DROP DATABASE IF EXISTS NATIVE_APPS_ANALYTICS_DB CASCADE;"

echo "Step 3: Setting up database and schema"
snowsql -c default -f scripts/setup_database.sql

echo "Step 4: Inserting sample data"
snowsql -c default -f scripts/insert_sample_data.sql

echo "Step 5: Setting up image repository"
snowsql -c default -f snowflake/setup_image_repo.sql

echo "Setup complete! Database and roles are ready."
