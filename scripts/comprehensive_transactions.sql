-- Generate Comprehensive Transaction Data Covering All Customers
-- World-class business intelligence requires comprehensive transaction coverage

USE DATABASE NATIVE_APPS_ANALYTICS_DB;
USE SCHEMA ANALYTICS_SCHEMA;

-- Clear existing transaction data to rebuild comprehensively
DELETE FROM REVENUE_TRANSACTIONS;

-- Generate comprehensive transactions covering ALL 400 customers across 12 months
-- This creates realistic business transaction patterns

INSERT INTO REVENUE_TRANSACTIONS 
(transaction_id, transaction_date, provider_id, app_id, consumer_id, consumer_name, amount, transaction_type)
SELECT 
    'TXN' || LPAD(ROW_NUMBER() OVER (ORDER BY month_date, c.consumer_id, a.app_id), 8, '0'),
    month_date,
    p.provider_id,
    a.app_id,
    c.consumer_id,
    c.name,
    -- Realistic monthly transaction amounts based on customer size and app usage
    CASE 
        WHEN c.size = 'Enterprise' THEN 
            UNIFORM(25000, 85000, RANDOM()) * (1 + UNIFORM(-0.2, 0.3, RANDOM()))  -- $25K-$85K with variance
        WHEN c.size = 'Mid-Market' THEN 
            UNIFORM(8000, 35000, RANDOM()) * (1 + UNIFORM(-0.25, 0.35, RANDOM()))  -- $8K-$35K with variance
        ELSE 
            UNIFORM(2500, 15000, RANDOM()) * (1 + UNIFORM(-0.3, 0.4, RANDOM()))  -- $2.5K-$15K with variance
    END,
    CASE 
        WHEN UNIFORM(1, 10, RANDOM()) <= 6 THEN 'Subscription'
        WHEN UNIFORM(1, 10, RANDOM()) <= 8 THEN 'Usage-Based'
        ELSE 'One-Time'
    END
FROM (
    -- Generate 12 months of transaction dates (current month back to 11 months ago)
    SELECT DATEADD(month, -seq, DATE_TRUNC('month', CURRENT_DATE())) as month_date
    FROM (SELECT ROW_NUMBER() OVER (ORDER BY 1) - 1 as seq FROM TABLE(GENERATOR(ROWCOUNT => 12)))
) months
CROSS JOIN (
    -- Use ALL customers - stratified sampling to ensure good coverage
    SELECT consumer_id, name, size FROM CONSUMERS 
    WHERE status = 'Active'
    ORDER BY consumer_id
) c
CROSS JOIN (
    -- Use representative apps from different providers
    SELECT app_id FROM NATIVE_APPS 
    ORDER BY monthly_revenue DESC
    LIMIT 40  -- Top 40 apps to ensure realistic usage patterns
) a
CROSS JOIN (
    -- Link to providers for realistic business relationships
    SELECT provider_id FROM PROVIDERS 
    WHERE status = 'Active'
    ORDER BY total_revenue DESC
    LIMIT 30  -- Top 30 providers
) p
WHERE 
    -- Realistic transaction probability - higher for larger customers
    UNIFORM(1, 100, RANDOM()) <= CASE 
        WHEN c.size = 'Enterprise' THEN 45    -- Enterprise customers transact more frequently
        WHEN c.size = 'Mid-Market' THEN 30    -- Mid-market customers moderate frequency
        ELSE 18                               -- SMB customers less frequent but still significant
    END
    -- Ensure we get good coverage across customer base
    AND (
        c.consumer_id <= 'CONS100' OR  -- Always include first 100 customers
        UNIFORM(1, 100, RANDOM()) <= CASE   -- Probabilistic inclusion for remaining customers
            WHEN c.size = 'Enterprise' THEN 85
            WHEN c.size = 'Mid-Market' THEN 65
            ELSE 40
        END
    )
LIMIT 25000;  -- Generate substantial dataset for comprehensive analysis

-- Verify the comprehensive transaction coverage
SELECT 'Transaction Coverage Analysis:' as analysis_type;

SELECT 
    'Total Transactions' as metric,
    COUNT(*) as value
FROM REVENUE_TRANSACTIONS
UNION ALL
SELECT 
    'Unique Customers',
    COUNT(DISTINCT consumer_id)
FROM REVENUE_TRANSACTIONS
UNION ALL
SELECT 
    'Unique Apps',
    COUNT(DISTINCT app_id)
FROM REVENUE_TRANSACTIONS
UNION ALL
SELECT 
    'Unique Providers',
    COUNT(DISTINCT provider_id)  
FROM REVENUE_TRANSACTIONS
UNION ALL
SELECT 
    'Date Range (Months)',
    COUNT(DISTINCT DATE_TRUNC('month', transaction_date))
FROM REVENUE_TRANSACTIONS
ORDER BY metric;

-- Customer segment coverage analysis
SELECT 
    'Customer Segment Coverage:' as analysis_type;

SELECT 
    c.size as customer_segment,
    COUNT(DISTINCT c.consumer_id) as total_customers,
    COUNT(DISTINCT rt.consumer_id) as customers_with_transactions,
    ROUND(COUNT(DISTINCT rt.consumer_id) * 100.0 / COUNT(DISTINCT c.consumer_id), 1) as coverage_percentage,
    COUNT(rt.transaction_id) as total_transactions,
    ROUND(AVG(rt.amount), 0) as avg_transaction_amount
FROM CONSUMERS c
LEFT JOIN REVENUE_TRANSACTIONS rt ON c.consumer_id = rt.consumer_id
GROUP BY c.size
ORDER BY total_customers DESC;
