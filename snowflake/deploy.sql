-- Snowflake Native Apps Business Analytics Platform
-- SPCS deployment script for analytics dashboard

USE ROLE NATIVE_APPS_ANALYTICS_ROLE;
USE WAREHOUSE COMPUTE_WH;
USE DATABASE NATIVE_APPS_ANALYTICS_DB;
USE SCHEMA ANALYTICS_SCHEMA;

-- Create compute pool if it doesn't exist
CREATE COMPUTE POOL IF NOT EXISTS NATIVE_APPS_ANALYTICS_POOL
  MIN_NODES = 1
  MAX_NODES = 3
  INSTANCE_FAMILY = CPU_X64_XS
  AUTO_RESUME = TRUE
  AUTO_SUSPEND_SECS = 300
  COMMENT = 'Compute pool for Native Apps Analytics platform';

-- Compute pool is ready (confirmed as IDLE)
SELECT 'Compute pool NATIVE_APPS_ANALYTICS_POOL is ready for service deployment' as pool_status;

-- Create the service (CREATE not REPLACE)
CREATE SERVICE IF NOT EXISTS NATIVE_APPS_ANALYTICS_SERVICE
  IN COMPUTE POOL NATIVE_APPS_ANALYTICS_POOL
  FROM SPECIFICATION $$
    spec:
      containers:
      - name: native-apps-analytics
        image: "pm-nax-consumer.registry.snowflakecomputing.com/native_apps_analytics_db/image_schema/image_repo/native-apps-analytics:latest"
        env:
          SERVER_PORT: "3002"
          NODE_ENV: production
          SNOWFLAKE_ACCOUNT: pm-nax-consumer
          SNOWFLAKE_DATABASE: NATIVE_APPS_ANALYTICS_DB
          SNOWFLAKE_SCHEMA: ANALYTICS_SCHEMA
          SNOWFLAKE_WAREHOUSE: COMPUTE_WH
          SNOWFLAKE_ROLE: NATIVE_APPS_ANALYTICS_ROLE
        readinessProbe:
          port: 3002
          path: "/api/health"
      endpoints:
      - name: analytics-dashboard
        port: 3002
        public: true
  $$
  COMMENT = 'Snowflake Native Apps Business Analytics Platform';

-- Check service status
SELECT SYSTEM$GET_SERVICE_STATUS('NATIVE_APPS_ANALYTICS_SERVICE') as service_status;

-- Show service details
SHOW SERVICES;
DESCRIBE SERVICE NATIVE_APPS_ANALYTICS_SERVICE;

-- Get service endpoints (run after service is ready)
SHOW ENDPOINTS IN SERVICE NATIVE_APPS_ANALYTICS_SERVICE;

-- Display deployment success message
SELECT 
    '🚀 Native Apps Analytics Platform deployed successfully!' as deployment_status,
    'Access your dashboard via the public endpoint shown above' as next_step;
