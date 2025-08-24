-- Snowflake Native Apps Business Analytics Platform
-- Database setup script

USE ROLE NATIVE_APPS_ANALYTICS_ROLE;
USE WAREHOUSE COMPUTE_WH;

-- Create application database
CREATE DATABASE IF NOT EXISTS NATIVE_APPS_ANALYTICS_DB
COMMENT = 'Database for Native Apps Business Analytics Platform';

-- Create application schema
CREATE SCHEMA IF NOT EXISTS NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA
COMMENT = 'Main schema for Native Apps analytics data and objects';

USE DATABASE NATIVE_APPS_ANALYTICS_DB;
USE SCHEMA ANALYTICS_SCHEMA;

-- Create providers table for Native App providers
CREATE TABLE IF NOT EXISTS PROVIDERS (
    provider_id STRING,
    name STRING,
    industry STRING,
    country STRING,
    tier STRING,
    join_date DATE,
    total_revenue NUMBER(15,2),
    monthly_growth FLOAT,
    app_count INTEGER,
    consumer_count INTEGER,
    avg_app_rating FLOAT,
    status STRING,
    contact_email STRING,
    marketing_qualified_leads INTEGER,
    created_at TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (provider_id)
)
COMMENT = 'Native App providers data';

-- Create consumers table for Native App customers
CREATE TABLE IF NOT EXISTS CONSUMERS (
    consumer_id STRING,
    name STRING,
    industry STRING,
    country STRING,
    size STRING,
    join_date DATE,
    total_spend NUMBER(15,2),
    monthly_spend NUMBER(15,2),
    installed_apps INTEGER,
    average_usage FLOAT,
    satisfaction_score FLOAT,
    status STRING,
    contract_type STRING,
    created_at TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (consumer_id)
)
COMMENT = 'Native App consumers data';

-- Create native apps table
CREATE TABLE IF NOT EXISTS NATIVE_APPS (
    app_id STRING,
    name STRING,
    provider_id STRING,
    provider_name STRING,
    category STRING,
    description STRING,
    version STRING,
    launch_date DATE,
    status STRING,
    pricing_model STRING,
    monthly_revenue NUMBER(15,2),
    installations INTEGER,
    active_users INTEGER,
    rating FLOAT,
    reviews INTEGER,
    growth_rate FLOAT,
    created_at TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (app_id),
    FOREIGN KEY (provider_id) REFERENCES PROVIDERS(provider_id)
)
COMMENT = 'Native Apps catalog and performance data';

-- Create revenue transactions table
CREATE TABLE IF NOT EXISTS REVENUE_TRANSACTIONS (
    transaction_id STRING,
    transaction_date DATE,
    provider_id STRING,
    app_id STRING,
    consumer_id STRING,
    consumer_name STRING,
    amount NUMBER(15,2),
    transaction_type STRING,
    created_at TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (provider_id) REFERENCES PROVIDERS(provider_id),
    FOREIGN KEY (app_id) REFERENCES NATIVE_APPS(app_id),
    FOREIGN KEY (consumer_id) REFERENCES CONSUMERS(consumer_id)
)
COMMENT = 'Revenue transactions and financial data';

-- Create pipeline opportunities table
CREATE TABLE IF NOT EXISTS PIPELINE_OPPORTUNITIES (
    opportunity_id STRING,
    provider_id STRING,
    app_id STRING,
    consumer_id STRING,
    consumer_name STRING,
    stage STRING,
    value NUMBER(15,2),
    probability FLOAT,
    created_date DATE,
    expected_close_date DATE,
    last_activity DATE,
    source STRING,
    created_at TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (opportunity_id),
    FOREIGN KEY (provider_id) REFERENCES PROVIDERS(provider_id),
    FOREIGN KEY (app_id) REFERENCES NATIVE_APPS(app_id),
    FOREIGN KEY (consumer_id) REFERENCES CONSUMERS(consumer_id)
)
COMMENT = 'Sales pipeline and opportunity tracking';

-- Create views for analytics
CREATE VIEW IF NOT EXISTS PROVIDER_ANALYTICS AS
SELECT 
    p.provider_id,
    p.name,
    p.industry,
    p.total_revenue,
    p.monthly_growth,
    COUNT(DISTINCT na.app_id) as published_apps,
    COUNT(DISTINCT rt.consumer_id) as active_consumers,
    SUM(rt.amount) as actual_revenue_ytd,
    AVG(na.rating) as avg_app_rating
FROM PROVIDERS p
LEFT JOIN NATIVE_APPS na ON p.provider_id = na.provider_id
LEFT JOIN REVENUE_TRANSACTIONS rt ON p.provider_id = rt.provider_id
WHERE rt.transaction_date >= DATEADD(year, -1, CURRENT_DATE())
GROUP BY p.provider_id, p.name, p.industry, p.total_revenue, p.monthly_growth;

CREATE VIEW IF NOT EXISTS CONSUMER_ANALYTICS AS
SELECT 
    c.consumer_id,
    c.name,
    c.industry,
    c.size,
    c.total_spend,
    c.satisfaction_score,
    COUNT(DISTINCT rt.app_id) as installed_apps,
    SUM(rt.amount) as actual_spend_ytd,
    AVG(c.average_usage) as avg_usage
FROM CONSUMERS c
LEFT JOIN REVENUE_TRANSACTIONS rt ON c.consumer_id = rt.consumer_id
WHERE rt.transaction_date >= DATEADD(year, -1, CURRENT_DATE())
GROUP BY c.consumer_id, c.name, c.industry, c.size, c.total_spend, c.satisfaction_score, c.average_usage;

-- Insert sample data to demonstrate the platform
INSERT INTO PROVIDERS (provider_id, name, industry, country, tier, join_date, total_revenue, monthly_growth, app_count, consumer_count, avg_app_rating, status, contact_email, marketing_qualified_leads)
VALUES 
    ('prov-demo-001', 'DataFlow Technologies Demo', 'Software', 'United States', 'Enterprise', '2023-01-15', 2850000, 12.5, 8, 142, 4.7, 'Active', 'demo@dataflow.com', 23),
    ('prov-demo-002', 'ML Insights Corp Demo', 'AI/ML', 'United Kingdom', 'Enterprise', '2022-09-10', 3200000, 8.7, 12, 203, 4.8, 'Active', 'demo@mlinsights.co.uk', 18);

INSERT INTO CONSUMERS (consumer_id, name, industry, country, size, join_date, total_spend, monthly_spend, installed_apps, average_usage, satisfaction_score, status, contract_type)
VALUES 
    ('cons-demo-001', 'Global Retail Corp Demo', 'Retail', 'United States', 'Enterprise', '2023-02-10', 485000, 42000, 12, 87.5, 4.6, 'Active', 'Annual'),
    ('cons-demo-002', 'Financial Services Demo', 'Finance', 'United Kingdom', 'Enterprise', '2022-11-15', 720000, 58000, 18, 78.3, 4.4, 'Active', 'Annual');

-- Verify setup
SELECT '🚀 Native Apps Analytics Database created successfully!' as status;
SELECT 'Database: ' || CURRENT_DATABASE() || ', Schema: ' || CURRENT_SCHEMA() || ', Role: ' || CURRENT_ROLE() as configuration;
SELECT COUNT(*) as provider_records FROM PROVIDERS;
SELECT COUNT(*) as consumer_records FROM CONSUMERS;

-- Show table summary
SELECT 
    table_name,
    row_count,
    comment
FROM INFORMATION_SCHEMA.TABLES 
WHERE table_schema = 'ANALYTICS_SCHEMA' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
