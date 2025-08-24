-- Insert comprehensive sample data for Native Apps Analytics Platform
-- This script populates all tables with realistic data

USE ROLE NATIVE_APPS_ANALYTICS_ROLE;
USE WAREHOUSE COMPUTE_WH;
USE DATABASE NATIVE_APPS_ANALYTICS_DB;
USE SCHEMA ANALYTICS_SCHEMA;

-- Clear existing data (optional - remove if you want to keep existing data)
DELETE FROM REVENUE_TRANSACTIONS;
DELETE FROM PIPELINE_OPPORTUNITIES;
DELETE FROM NATIVE_APPS;
DELETE FROM PROVIDERS;
DELETE FROM CONSUMERS;

-- Insert 10 comprehensive providers
INSERT INTO PROVIDERS (provider_id, name, industry, country, tier, join_date, total_revenue, monthly_growth, app_count, consumer_count, avg_app_rating, status, contact_email, marketing_qualified_leads)
VALUES 
    ('prov-001', 'DataFlow Technologies', 'Software', 'United States', 'Enterprise', '2023-01-15', 2850000, 12.5, 8, 142, 4.7, 'Active', 'partnerships@dataflow.com', 23),
    ('prov-002', 'SecureAnalytics Inc', 'Cybersecurity', 'Canada', 'Growth', '2023-03-22', 1420000, 18.3, 5, 89, 4.5, 'Active', 'sales@secureanalytics.ca', 31),
    ('prov-003', 'ML Insights Corp', 'Artificial Intelligence', 'United Kingdom', 'Enterprise', '2022-09-10', 3200000, 8.7, 12, 203, 4.8, 'Active', 'partnerships@mlinsights.co.uk', 18),
    ('prov-004', 'CloudMetrics Solutions', 'Cloud Computing', 'Germany', 'Growth', '2023-06-05', 890000, 25.2, 4, 56, 4.3, 'Active', 'sales@cloudmetrics.de', 42),
    ('prov-005', 'DataViz Pro', 'Data Visualization', 'Australia', 'Startup', '2023-08-18', 320000, 35.8, 2, 28, 4.9, 'Active', 'hello@datavizpro.au', 67),
    ('prov-006', 'Compliance Guard', 'Regulatory Technology', 'Singapore', 'Growth', '2023-04-12', 1680000, 14.6, 6, 94, 4.6, 'Active', 'partnerships@complianceguard.sg', 29),
    ('prov-007', 'StreamlineETL', 'Data Engineering', 'Netherlands', 'Enterprise', '2022-11-28', 2100000, 9.4, 7, 167, 4.4, 'Active', 'sales@streamlineetl.nl', 21),
    ('prov-008', 'Predictive Models Labs', 'Machine Learning', 'France', 'Growth', '2023-02-14', 1250000, 20.1, 5, 78, 4.7, 'Active', 'contact@predictivemodels.fr', 38),
    ('prov-009', 'DataQuality Plus', 'Data Quality', 'Japan', 'Startup', '2023-07-03', 480000, 42.3, 3, 35, 4.5, 'Active', 'sales@dataqualityplus.jp', 58),
    ('prov-010', 'BusinessIntel360', 'Business Intelligence', 'Brazil', 'Growth', '2023-05-20', 1120000, 16.8, 4, 72, 4.2, 'Active', 'vendas@businessintel360.com.br', 33);

-- Insert 10 comprehensive consumers
INSERT INTO CONSUMERS (consumer_id, name, industry, country, size, join_date, total_spend, monthly_spend, installed_apps, average_usage, satisfaction_score, status, contract_type)
VALUES 
    ('cons-001', 'Global Retail Corp', 'Retail', 'United States', 'Enterprise', '2023-02-10', 485000, 42000, 12, 87.5, 4.6, 'Active', 'Annual'),
    ('cons-002', 'TechStart Innovations', 'Technology', 'Canada', 'SMB', '2023-04-22', 68000, 8500, 4, 92.1, 4.8, 'Active', 'Monthly'),
    ('cons-003', 'Financial Services Ltd', 'Finance', 'United Kingdom', 'Enterprise', '2022-11-15', 720000, 58000, 18, 78.3, 4.4, 'Active', 'Annual'),
    ('cons-004', 'Healthcare Analytics Group', 'Healthcare', 'Germany', 'Mid-Market', '2023-01-08', 235000, 22000, 8, 85.7, 4.7, 'Active', 'Annual'),
    ('cons-005', 'Manufacturing Excellence Inc', 'Manufacturing', 'Japan', 'Enterprise', '2023-03-14', 398000, 35000, 11, 73.2, 4.3, 'Active', 'Usage-Based'),
    ('cons-006', 'Energy Solutions Co', 'Energy', 'Norway', 'Mid-Market', '2023-05-30', 156000, 18500, 6, 89.4, 4.5, 'Active', 'Monthly'),
    ('cons-007', 'Logistics Network Pro', 'Logistics', 'Singapore', 'Mid-Market', '2022-12-05', 287000, 26000, 9, 81.6, 4.2, 'Active', 'Annual'),
    ('cons-008', 'Media & Entertainment Hub', 'Media', 'United States', 'Enterprise', '2023-06-12', 512000, 48000, 14, 76.8, 4.6, 'Active', 'Usage-Based'),
    ('cons-009', 'Education Data Systems', 'Education', 'Australia', 'Mid-Market', '2023-07-18', 142000, 16500, 5, 94.2, 4.9, 'Active', 'Annual'),
    ('cons-010', 'Telecom Analytics Corp', 'Telecommunications', 'India', 'Enterprise', '2023-08-25', 376000, 41000, 13, 82.5, 4.4, 'Active', 'Monthly');

-- Insert 10 native apps
INSERT INTO NATIVE_APPS (app_id, name, provider_id, provider_name, category, description, version, launch_date, status, pricing_model, monthly_revenue, installations, active_users, rating, reviews, growth_rate)
VALUES 
    ('app-001', 'Advanced Analytics Suite', 'prov-001', 'DataFlow Technologies', 'Analytics', 'Comprehensive analytics platform with real-time dashboards and predictive modeling', '3.2.1', '2023-02-01', 'Published', 'Subscription', 420000, 89, 1240, 4.7, 124, 15.2),
    ('app-002', 'Security Threat Monitor', 'prov-002', 'SecureAnalytics Inc', 'Security', 'AI-powered threat detection and security monitoring for data warehouses', '2.1.4', '2023-04-15', 'Published', 'Usage-Based', 285000, 67, 890, 4.5, 89, 22.8),
    ('app-003', 'ML Model Manager', 'prov-003', 'ML Insights Corp', 'ML/AI', 'End-to-end machine learning model lifecycle management and deployment', '4.0.2', '2022-10-20', 'Published', 'Subscription', 520000, 145, 2100, 4.8, 203, 18.9),
    ('app-004', 'Cloud Cost Optimizer', 'prov-004', 'CloudMetrics Solutions', 'Analytics', 'Intelligent cloud cost analysis and optimization recommendations', '1.5.0', '2023-07-10', 'Published', 'Usage-Based', 180000, 42, 650, 4.3, 56, 35.6),
    ('app-005', 'Interactive Dashboard Builder', 'prov-005', 'DataViz Pro', 'Business Intelligence', 'Drag-and-drop dashboard creation with advanced visualization options', '2.3.1', '2023-09-05', 'Published', 'Subscription', 95000, 28, 420, 4.9, 31, 42.1),
    ('app-006', 'Compliance Automation Hub', 'prov-006', 'Compliance Guard', 'Compliance', 'Automated compliance reporting and regulatory requirement tracking', '3.1.2', '2023-05-18', 'Published', 'Subscription', 310000, 76, 980, 4.6, 94, 19.3),
    ('app-007', 'Real-time ETL Pipeline', 'prov-007', 'StreamlineETL', 'Data Engineering', 'High-performance data extraction, transformation, and loading pipeline', '2.8.3', '2023-01-25', 'Published', 'Usage-Based', 385000, 102, 1560, 4.4, 167, 12.7),
    ('app-008', 'Predictive Forecasting Engine', 'prov-008', 'Predictive Models Labs', 'ML/AI', 'Advanced time series forecasting with multiple ML algorithms', '1.9.1', '2023-03-20', 'Published', 'Subscription', 220000, 58, 780, 4.7, 78, 28.4),
    ('app-009', 'Data Quality Scanner', 'prov-009', 'DataQuality Plus', 'Data Quality', 'Automated data quality assessment and anomaly detection', '1.2.4', '2023-08-12', 'Published', 'Usage-Based', 125000, 35, 490, 4.5, 42, 39.8),
    ('app-010', 'Executive Intelligence Dashboard', 'prov-010', 'BusinessIntel360', 'Business Intelligence', 'Executive-level KPI tracking and strategic business intelligence', '2.4.0', '2023-06-28', 'Published', 'Subscription', 265000, 64, 850, 4.2, 72, 21.6);

-- Insert revenue transactions for the past 12 months (multiple transactions per month per app)
INSERT INTO REVENUE_TRANSACTIONS (transaction_id, transaction_date, provider_id, app_id, consumer_id, consumer_name, amount, transaction_type)
SELECT 
    'txn-' || ROW_NUMBER() OVER (ORDER BY dates.transaction_date, apps.app_id, consumers.consumer_id),
    dates.transaction_date,
    apps.provider_id,
    apps.app_id,
    consumers.consumer_id,
    consumers.name,
    -- Vary amounts based on app revenue and some randomness
    ROUND((apps.monthly_revenue / 10) * (0.5 + UNIFORM(0, 1.0, RANDOM())), 2),
    CASE WHEN UNIFORM(1, 3, RANDOM()) = 1 THEN 'Subscription' 
         WHEN UNIFORM(1, 3, RANDOM()) = 2 THEN 'Usage' 
         ELSE 'One-Time' END
FROM (
    -- Generate dates for past 12 months
    SELECT DATEADD(month, -seq.seq, DATE_TRUNC('month', CURRENT_DATE())) as transaction_date
    FROM (
        SELECT 0 as seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
        SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
        SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
    ) seq
) dates
CROSS JOIN NATIVE_APPS apps
CROSS JOIN (
    -- Sample some consumers for transactions (not all combinations to keep realistic)
    SELECT * FROM CONSUMERS 
    WHERE UNIFORM(1, 3, RANDOM()) <= 2  -- About 2/3 of consumers have transactions each month
) consumers
WHERE UNIFORM(1, 5, RANDOM()) <= 3;  -- About 60% of possible combinations get transactions

-- Verify the data insertion
SELECT '✅ Sample data inserted successfully!' as status;
SELECT COUNT(*) as providers FROM PROVIDERS;
SELECT COUNT(*) as consumers FROM CONSUMERS;
SELECT COUNT(*) as native_apps FROM NATIVE_APPS;
SELECT COUNT(*) as revenue_transactions FROM REVENUE_TRANSACTIONS;

-- Show category breakdown for Apps by Category chart
SELECT 
    category,
    COUNT(*) as app_count,
    SUM(monthly_revenue) as total_monthly_revenue
FROM NATIVE_APPS 
GROUP BY category 
ORDER BY total_monthly_revenue DESC;

-- Show monthly revenue for Revenue Trend chart
SELECT 
    DATE_TRUNC('month', transaction_date) as month,
    SUM(amount) as monthly_revenue,
    COUNT(*) as transaction_count
FROM REVENUE_TRANSACTIONS 
WHERE transaction_date >= DATEADD(month, -12, CURRENT_DATE())
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month;
