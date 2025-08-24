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

echo "Getting Snowflake configuration information..."
# Get account name dynamically (use uppercase format for Snowflake SDK)
ACCOUNT_NAME=$(snowsql -c default -q "SELECT CONCAT(CURRENT_ORGANIZATION_NAME(), '-', CURRENT_ACCOUNT_NAME());" -o output_format=csv -o header=false -o timing=false -o friendly=false | grep -v "^$" | tr -d '"')

# Get image repository URL dynamically
REPO_URL=$(snowsql -c default -q "USE DATABASE NATIVE_APPS_ANALYTICS_DB; USE SCHEMA IMAGE_SCHEMA; SHOW IMAGE REPOSITORIES LIKE 'IMAGE_REPO';" -o output_format=csv -o header=false -o timing=false -o friendly=false | grep IMAGE_REPO | cut -d'"' -f10)

if [ -z "$REPO_URL" ]; then
    echo "Error: Could not get image repository URL. Make sure the repository exists."
    exit 1
fi

if [ -z "$ACCOUNT_NAME" ]; then
    echo "Error: Could not get account name from Snowflake."
    exit 1
fi

echo "Account: $ACCOUNT_NAME"

echo "Tagging image for Snowflake registry..."
SNOWFLAKE_IMAGE_URL="${REPO_URL}/${APP_NAME}:${IMAGE_TAG}"
echo "Registry URL: ${SNOWFLAKE_IMAGE_URL}"
docker tag ${APP_NAME}:${IMAGE_TAG} ${SNOWFLAKE_IMAGE_URL}

echo "Logging into Snowflake registry..."
snow spcs image-registry login

echo "Pushing image to Snowflake..."
docker push ${SNOWFLAKE_IMAGE_URL}

echo "Image uploaded to: ${SNOWFLAKE_IMAGE_URL}"

echo "Generating deployment SQL with dynamic configuration..."
# Create temporary deploy.sql with actual registry URL and account name
sed -e "s|pm-nax-consumer.registry.snowflakecomputing.com/native_apps_analytics_db/image_schema/image_repo|${REPO_URL}|g" \
    -e "s|ACCOUNT_PLACEHOLDER|${ACCOUNT_NAME}|g" \
    snowflake/deploy.sql > /tmp/deploy_dynamic.sql

echo "Deploying SPCS service..."
snowsql -c default -f /tmp/deploy_dynamic.sql

# Clean up temporary file
rm -f /tmp/deploy_dynamic.sql

echo "Deployment complete!"
echo "Check service status with: snowsql -c default -f snowflake/manage_service.sql"
