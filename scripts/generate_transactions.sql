-- Generate Strategic Transaction Data
-- Simplified approach for Snowflake compatibility

USE DATABASE NATIVE_APPS_ANALYTICS_DB;
USE SCHEMA ANALYTICS_SCHEMA;

-- Generate transactions for the last 24 months
-- Create date dimension first
CREATE OR REPLACE TEMPORARY TABLE temp_dates AS
SELECT DATEADD(month, ROW_NUMBER() OVER (ORDER BY 1) - 1, '2023-01-01'::date) as transaction_date
FROM TABLE(GENERATOR(ROWCOUNT => 24));

-- Generate strategic transaction combinations  
INSERT INTO REVENUE_TRANSACTIONS 
(transaction_id, transaction_date, provider_id, app_id, consumer_id, consumer_name, amount, transaction_type)
SELECT 
    'TXN' || LPAD(ROW_NUMBER() OVER (ORDER BY d.transaction_date, p.provider_id, a.app_id, c.consumer_id), 8, '0'),
    d.transaction_date,
    p.provider_id,
    a.app_id,
    c.consumer_id,
    c.name,
    -- Strategic pricing model with realistic variance
    CASE 
        WHEN c.size = 'Enterprise' THEN 
            (UNIFORM(25000, 75000, RANDOM()) * (1 + UNIFORM(-0.15, 0.15, RANDOM())))
        WHEN c.size = 'Mid-Market' THEN 
            (UNIFORM(7500, 22500, RANDOM()) * (1 + UNIFORM(-0.2, 0.2, RANDOM())))
        ELSE 
            (UNIFORM(2500, 7500, RANDOM()) * (1 + UNIFORM(-0.25, 0.25, RANDOM())))
    END::NUMBER(15,2),
    CASE 
        WHEN UNIFORM(1, 10, RANDOM()) <= 7 THEN 'Subscription'
        WHEN UNIFORM(1, 10, RANDOM()) <= 9 THEN 'Usage-Based' 
        ELSE 'One-Time'
    END
FROM temp_dates d
CROSS JOIN (
    SELECT provider_id FROM PROVIDERS 
    WHERE status = 'Active' 
    ORDER BY provider_id 
    LIMIT 15
) p
CROSS JOIN (
    SELECT app_id FROM NATIVE_APPS 
    ORDER BY app_id 
    LIMIT 20
) a  
CROSS JOIN (
    SELECT consumer_id, name, size FROM CONSUMERS 
    WHERE status = 'Active' 
    ORDER BY consumer_id 
    LIMIT 15
) c
WHERE 
    -- Realistic transaction probability based on customer tier
    UNIFORM(1, 100, RANDOM()) <= CASE 
        WHEN c.size = 'Enterprise' THEN 70
        WHEN c.size = 'Mid-Market' THEN 50  
        ELSE 30
    END
LIMIT 3000; -- Generate substantial dataset for analysis

-- Verify data generation
SELECT 
    COUNT(*) as total_transactions,
    MIN(transaction_date) as earliest_date,
    MAX(transaction_date) as latest_date,
    ROUND(AVG(amount), 2) as avg_amount,
    COUNT(DISTINCT consumer_id) as unique_consumers,
    COUNT(DISTINCT provider_id) as unique_providers,
    COUNT(DISTINCT app_id) as unique_apps
FROM REVENUE_TRANSACTIONS;
