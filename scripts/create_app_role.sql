-- Create Native Apps Analytics Platform role for SPCS deployment  
-- This role follows the principle of least privilege

USE ROLE ACCOUNTADMIN;

-- Create the application role
CREATE ROLE IF NOT EXISTS NATIVE_APPS_ANALYTICS_ROLE 
COMMENT = 'Role for Native Apps Analytics Platform with minimal required SPCS permissions';

-- Grant basic permissions needed for SPCS applications
GRANT USAGE ON WAREHOUSE COMPUTE_WH TO ROLE NATIVE_APPS_ANALYTICS_ROLE;

-- Grant permission to create databases (for new applications)
GRANT CREATE DATABASE ON ACCOUNT TO ROLE NATIVE_APPS_ANALYTICS_ROLE;

-- For SPCS service management
GRANT CREATE COMPUTE POOL ON ACCOUNT TO ROLE NATIVE_APPS_ANALYTICS_ROLE;
GRANT BIND SERVICE ENDPOINT ON ACCOUNT TO ROLE NATIVE_APPS_ANALYTICS_ROLE;

-- For container registry access
GRANT CREATE INTEGRATION ON ACCOUNT TO ROLE NATIVE_APPS_ANALYTICS_ROLE;

-- Grant role to current user for testing (get username dynamically)
SET username = (SELECT CURRENT_USER());
GRANT ROLE NATIVE_APPS_ANALYTICS_ROLE TO USER IDENTIFIER($username);

-- Switch to the new role for subsequent operations
USE ROLE NATIVE_APPS_ANALYTICS_ROLE;

SELECT '🚀 Native Apps Analytics Platform role created successfully!' as status;
SELECT 'Ready to proceed with database setup and SPCS deployment' as next_step;
SHOW GRANTS TO ROLE NATIVE_APPS_ANALYTICS_ROLE;
