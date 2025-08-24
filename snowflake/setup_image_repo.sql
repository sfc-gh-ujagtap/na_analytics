-- Setup image repository for Native Apps Analytics Platform
-- This script creates the necessary image repository for SPCS deployment

USE ROLE NATIVE_APPS_ANALYTICS_ROLE;
USE WAREHOUSE COMPUTE_WH;

-- Use the analytics database created earlier
USE DATABASE NATIVE_APPS_ANALYTICS_DB;

-- Create image schema for storing container images
CREATE SCHEMA IF NOT EXISTS IMAGE_SCHEMA
COMMENT = 'Schema for storing Native Apps Analytics container images';

USE SCHEMA IMAGE_SCHEMA;

-- Create image repository
CREATE IMAGE REPOSITORY IF NOT EXISTS IMAGE_REPO
COMMENT = 'Repository for Native Apps Analytics container images';

-- Show the repository URL for deployment script
SHOW IMAGE REPOSITORIES;
DESCRIBE IMAGE REPOSITORY IMAGE_REPO;

SELECT '📦 Native Apps Analytics image repository setup complete!' as status;
SELECT 'Ready for Docker image build and upload process' as next_step;
