#!/bin/bash
set -e

echo "Deploying Native Apps Analytics Platform to SPCS..."

# Step 1: Run setup (database, roles, etc.)
echo "Running setup..."
./setup.sh

echo "Building and uploading SPCS application..."

APP_NAME="native-apps-analytics"
IMAGE_TAG="latest"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Run this script from the project root."
    exit 1
fi

echo "Using existing dashboard files in build/ directory"

echo "Building Docker image..."
docker build --platform linux/amd64 -t ${APP_NAME}:${IMAGE_TAG} .

echo "Using configured values from deploy.sql..."

echo "Tagging image for Snowflake registry..."
SNOWFLAKE_IMAGE_URL="pm-nax-consumer.registry.snowflakecomputing.com/native_apps_analytics_db/image_schema/image_repo/${APP_NAME}:${IMAGE_TAG}"
echo "Registry URL: ${SNOWFLAKE_IMAGE_URL}"
docker tag ${APP_NAME}:${IMAGE_TAG} ${SNOWFLAKE_IMAGE_URL}

echo "Logging into Snowflake registry..."
snow spcs image-registry login

echo "Pushing image to Snowflake..."
docker push ${SNOWFLAKE_IMAGE_URL}

echo "Image uploaded to: ${SNOWFLAKE_IMAGE_URL}"

echo "Deploying SPCS service..."
snowsql -c default -f snowflake/deploy.sql

echo "Deployment complete!"
echo "Check service status with: snowsql -c default -f snowflake/manage_service.sql"
