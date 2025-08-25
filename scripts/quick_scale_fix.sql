-- Quick Scale Fix: Proper Business Proportions
-- 50 providers → 120 apps → 400+ customers

USE DATABASE NATIVE_APPS_ANALYTICS_DB;
USE SCHEMA ANALYTICS_SCHEMA;

-- Add more apps (to reach ~120 total - more than 50 providers)
INSERT INTO NATIVE_APPS (app_id, name, provider_name, category, pricing_model, rating, installations, monthly_revenue, growth_rate)
VALUES
-- Quick batch of 50 more enterprise apps
('APP061', 'Enterprise Data Hub', 'DataTech Global', 'Data Engineering', 'Enterprise', 4.7, 15000, 485000, 22.5),
('APP062', 'AI Analytics Pro', 'AI Innovations Corp', 'ML/AI', 'Premium', 4.8, 18000, 625000, 28.3),
('APP063', 'Security Intelligence', 'SecureCloud Enterprise', 'Security', 'Enterprise', 4.6, 13000, 520000, 19.7),
('APP064', 'Advanced Analytics Suite', 'Analytics Masters', 'Analytics', 'Enterprise', 4.5, 22000, 685000, 21.2),
('APP065', 'Cloud Orchestration Pro', 'CloudFirst Solutions', 'Cloud Services', 'Professional', 4.4, 14000, 425000, 35.8),
('APP066', 'Quantum Analytics Cloud', 'Quantum Computing Labs', 'ML/AI', 'Premium', 4.9, 1200, 1850000, 125.7),
('APP067', 'Digital Transformation Suite', 'Digital Transformation Inc', 'Business Intelligence', 'Enterprise', 4.6, 28000, 785000, 24.6),
('APP068', 'Global Data Analytics', 'Global Analytics Hub', 'Analytics', 'Professional', 4.3, 16000, 485000, 32.1),
('APP069', 'Enterprise AI Platform', 'Enterprise AI Systems', 'ML/AI', 'Enterprise', 4.7, 19000, 650000, 29.4),
('APP070', 'Data Intelligence Suite', 'Data Intelligence Pro', 'Analytics', 'Professional', 4.2, 13000, 395000, 33.8),
('APP071', 'Visualization Pro', 'DataViz Experts', 'Business Intelligence', 'Professional', 4.1, 9500, 285000, 48.5),
('APP072', 'ML Pipeline Pro', 'ML Dynamics', 'ML/AI', 'Professional', 4.0, 7000, 195000, 58.7),
('APP073', 'BI Enterprise Hub', 'Business Intelligence Pro', 'Business Intelligence', 'Professional', 4.2, 11000, 325000, 42.3),
('APP074', 'Cloud Analytics Pro', 'Cloud Native Systems', 'Analytics', 'Professional', 4.1, 10000, 298000, 45.9),
('APP075', 'Predictive Suite', 'Predictive Analytics', 'Analytics', 'Professional', 3.9, 8500, 245000, 52.4),
('APP076', 'Retail Intelligence Pro', 'Retail Intelligence', 'Business Intelligence', 'Professional', 4.0, 6500, 185000, 55.3),
('APP077', 'Marketing Analytics Suite', 'Marketing Analytics Hub', 'Analytics', 'Enterprise', 4.2, 14000, 485000, 38.7),
('APP078', 'Supply Chain Pro', 'Supply Chain Analytics', 'Analytics', 'Enterprise', 4.1, 9500, 385000, 47.8),
('APP079', 'CX Analytics Pro', 'Customer Experience AI', 'ML/AI', 'Professional', 3.8, 7000, 225000, 62.1),
('APP080', 'Energy Intelligence', 'Energy Analytics Corp', 'Analytics', 'Professional', 3.9, 5000, 145000, 43.2),
('APP081', 'Transport Analytics', 'Transportation Intelligence', 'Analytics', 'Professional', 4.0, 6000, 175000, 49.6),
('APP082', 'Media Intelligence', 'Media Analytics Pro', 'Business Intelligence', 'Professional', 4.1, 8000, 245000, 41.8),
('APP083', 'Education Suite', 'Education Data Labs', 'Analytics', 'Growth', 3.8, 4000, 95000, 67.4),
('APP084', 'Government Analytics', 'Government Analytics', 'Analytics', 'Professional', 4.0, 3500, 125000, 35.9),
('APP085', 'Real Estate Pro', 'Real Estate Intelligence', 'Business Intelligence', 'Professional', 3.7, 2800, 85000, 58.3),
('APP086', 'Blockchain Suite', 'Blockchain Analytics', 'Analytics', 'Professional', 4.2, 5500, 285000, 78.9),
('APP087', 'IoT Analytics Pro', 'IoT Data Platform', 'Analytics', 'Professional', 4.1, 7500, 225000, 56.7),
('APP088', 'AR Analytics', 'AR/VR Analytics', 'Analytics', 'Growth', 3.9, 1500, 65000, 112.5),
('APP089', 'Climate Intelligence', 'Climate Data Corp', 'Analytics', 'Professional', 4.0, 3500, 125000, 71.8),
('APP090', 'Voice Analytics', 'Voice Analytics Systems', 'ML/AI', 'Professional', 4.2, 4000, 145000, 68.4),
('APP091', 'Document AI', 'Document Intelligence AI', 'ML/AI', 'Professional', 4.1, 6000, 185000, 52.3),
('APP092', 'Geospatial Suite', 'Geospatial Analytics Pro', 'Analytics', 'Professional', 3.9, 4500, 135000, 47.9),
('APP093', 'Network Intelligence', 'Network Intelligence', 'Analytics', 'Professional', 4.0, 7000, 205000, 44.2),
('APP094', 'Identity Analytics', 'Identity Management Corp', 'Security', 'Enterprise', 4.3, 8500, 385000, 31.7),
('APP095', 'Data Governance', 'Data Catalog Systems', 'Data Engineering', 'Professional', 4.1, 5000, 165000, 39.8),
('APP096', 'API Analytics', 'API Intelligence Hub', 'Analytics', 'Professional', 3.8, 6500, 195000, 48.6),
('APP097', 'Time Series Pro', 'Time Series Analytics', 'Analytics', 'Professional', 4.2, 7500, 225000, 36.4),
('APP098', 'Graph Analytics', 'Graph Database Solutions', 'Analytics', 'Enterprise', 4.4, 9000, 425000, 42.7),
('APP099', 'Streaming Pro', 'Streaming Data Platform', 'Data Engineering', 'Enterprise', 4.5, 11500, 485000, 33.9),
('APP100', 'Compliance Suite', 'Compliance Automation', 'Compliance', 'Enterprise', 4.3, 8000, 365000, 28.5),
('APP101', 'Fraud Detection', 'Fraud Detection AI', 'Security', 'Enterprise', 4.6, 6500, 685000, 24.8),
('APP102', 'Content Analytics', 'Content Intelligence', 'Analytics', 'Professional', 3.9, 5000, 145000, 51.2),
('APP103', 'Recommendation AI', 'Recommendation Engine Pro', 'ML/AI', 'Growth', 3.7, 2200, 65000, 89.7),
('APP104', 'Edge Analytics', 'Edge Computing Analytics', 'Analytics', 'Professional', 4.1, 4500, 125000, 58.3),
('APP105', 'Container Pro', 'Container Intelligence', 'DevOps', 'Professional', 4.0, 6000, 175000, 45.2),
('APP106', 'StartupBI Pro', 'StartupBI Analytics', 'Business Intelligence', 'Growth', 3.9, 1500, 45000, 125.8),
('APP107', 'DataStream Pro', 'DataStream Innovations', 'Data Engineering', 'Growth', 3.8, 2000, 58000, 98.4),
('APP108', 'Innovation Suite', 'Emerging Tech Labs', 'Analytics', 'Growth', 4.0, 1000, 38000, 145.7),
('APP109', 'Growth Analytics', 'Growth Analytics Startup', 'Analytics', 'Growth', 3.6, 1500, 42000, 112.3),
('APP110', 'NextGen AI', 'NextGen AI Systems', 'ML/AI', 'Growth', 3.8, 1200, 35000, 89.6);

-- Add 350 MORE CUSTOMERS (to reach 400+ total - way more than providers and apps)
-- Batch insert for efficiency
INSERT INTO CONSUMERS (consumer_id, name, industry, country, size, status, installed_apps, total_spend, satisfaction_score, contract_type)
SELECT 
    'CONS' || LPAD((ROW_NUMBER() OVER (ORDER BY 1) + 50), 3, '0'),
    CASE 
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 1 THEN 'Global Financial Corp #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 2 THEN 'MegaTech Industries #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 3 THEN 'Healthcare Systems #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 4 THEN 'Manufacturing Corp #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 5 THEN 'Retail Chain #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 6 THEN 'Banking Solutions #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 7 THEN 'Insurance Global #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 8 THEN 'Energy Systems #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 9 THEN 'Telecom Networks #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 10 THEN 'Logistics Corp #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 11 THEN 'Media Enterprises #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 12 THEN 'Education Systems #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 13 THEN 'Government Agency #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 14 THEN 'Pharmaceutical Co #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 15 THEN 'Automotive Group #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 16 THEN 'Real Estate Fund #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 17 THEN 'Construction Inc #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 18 THEN 'Agriculture Corp #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 20) = 19 THEN 'Transportation Co #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
        ELSE 'Technology Startup #' || (ROW_NUMBER() OVER (ORDER BY 1) + 50)
    END,
    CASE 
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) IN (1,2,3) THEN 'Banking'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) IN (4,5) THEN 'Technology'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 6 THEN 'Healthcare'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 7 THEN 'Manufacturing'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 8 THEN 'Retail'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 9 THEN 'Insurance'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 10 THEN 'Energy'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 11 THEN 'Telecommunications'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 12 THEN 'Transportation'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 13 THEN 'Media'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 15) = 14 THEN 'Education'
        ELSE 'Government'
    END,
    CASE 
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 12) IN (1,2,3,4) THEN 'United States'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 12) IN (5,6) THEN 'Germany'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 12) = 7 THEN 'United Kingdom'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 12) = 8 THEN 'Canada'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 12) = 9 THEN 'France'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 12) = 10 THEN 'Japan'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 12) = 11 THEN 'Australia'
        ELSE 'Netherlands'
    END,
    CASE 
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 10) IN (1,2,3) THEN 'Enterprise'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 10) IN (4,5,6,7) THEN 'Mid-Market'
        ELSE 'SMB'
    END,
    'Active',
    CASE 
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 10) IN (1,2,3) THEN UNIFORM(15, 45, RANDOM())  -- Enterprise: 15-45 apps
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 10) IN (4,5,6,7) THEN UNIFORM(8, 25, RANDOM())  -- Mid-Market: 8-25 apps
        ELSE UNIFORM(3, 12, RANDOM()) -- SMB: 3-12 apps
    END,
    CASE 
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 10) IN (1,2,3) THEN UNIFORM(500000, 3500000, RANDOM())  -- Enterprise spend
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 10) IN (4,5,6,7) THEN UNIFORM(150000, 1200000, RANDOM()) -- Mid-Market spend
        ELSE UNIFORM(25000, 300000, RANDOM()) -- SMB spend
    END,
    UNIFORM(7.2, 9.5, RANDOM()),  -- Satisfaction score
    CASE 
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 10) IN (1,2,3) THEN 'Enterprise'
        WHEN MOD(ROW_NUMBER() OVER (ORDER BY 1), 10) IN (4,5,6,7) THEN 'Professional'
        ELSE 'Growth'
    END
FROM TABLE(GENERATOR(ROWCOUNT => 350));

-- Generate recent transaction data for proper revenue trends (last 12 months)
-- Create transactions from recent months so revenue API shows current data
INSERT INTO REVENUE_TRANSACTIONS 
(transaction_id, transaction_date, provider_id, app_id, consumer_id, consumer_name, amount, transaction_type)
SELECT 
    'TXN' || LPAD(ROW_NUMBER() OVER (ORDER BY month_date, p.provider_id, a.app_id, c.consumer_id), 8, '0'),
    month_date,
    p.provider_id,
    a.app_id,
    c.consumer_id,
    c.name,
    -- Realistic monthly transaction amounts
    CASE 
        WHEN c.size = 'Enterprise' THEN UNIFORM(50000, 150000, RANDOM())
        WHEN c.size = 'Mid-Market' THEN UNIFORM(15000, 50000, RANDOM())
        ELSE UNIFORM(5000, 20000, RANDOM())
    END * (1 + UNIFORM(-0.3, 0.3, RANDOM())), -- Add variance
    CASE 
        WHEN UNIFORM(1, 10, RANDOM()) <= 7 THEN 'Subscription'
        WHEN UNIFORM(1, 10, RANDOM()) <= 9 THEN 'Usage-Based'
        ELSE 'One-Time'
    END
FROM (
    -- Generate last 12 months of dates  
    SELECT DATEADD(month, -seq, CURRENT_DATE()) as month_date
    FROM (SELECT ROW_NUMBER() OVER (ORDER BY 1) - 1 as seq FROM TABLE(GENERATOR(ROWCOUNT => 12)))
) months
CROSS JOIN (SELECT provider_id FROM PROVIDERS LIMIT 25) p
CROSS JOIN (SELECT app_id FROM NATIVE_APPS LIMIT 30) a
CROSS JOIN (SELECT consumer_id, name, size FROM CONSUMERS LIMIT 25) c
WHERE 
    -- Realistic transaction probability
    UNIFORM(1, 100, RANDOM()) <= CASE 
        WHEN c.size = 'Enterprise' THEN 60
        WHEN c.size = 'Mid-Market' THEN 40
        ELSE 25
    END
LIMIT 8000; -- Substantial dataset for analysis

-- Verify the new scale
SELECT 'Final Scale Check:' as status;
SELECT 
    'Providers' as entity_type, COUNT(*) as count FROM PROVIDERS
UNION ALL 
SELECT 'Apps', COUNT(*) FROM NATIVE_APPS
UNION ALL
SELECT 'Consumers', COUNT(*) FROM CONSUMERS
UNION ALL  
SELECT 'Transactions', COUNT(*) FROM REVENUE_TRANSACTIONS
ORDER BY entity_type;
