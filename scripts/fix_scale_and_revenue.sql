-- Fix Scale and Revenue Data for World-Class Analytics
-- Proper proportions: 50 providers → 120 apps → 400 customers

USE DATABASE NATIVE_APPS_ANALYTICS_DB;
USE SCHEMA ANALYTICS_SCHEMA;

-- Clear existing data
DELETE FROM REVENUE_TRANSACTIONS;
DELETE FROM NATIVE_APPS WHERE app_id NOT LIKE 'APP00%' OR app_id > 'APP060'; -- Keep first 60
DELETE FROM CONSUMERS WHERE consumer_id NOT LIKE 'CONS0%' OR consumer_id > 'CONS050'; -- Keep first 50

-- Add 70 more Apps (to reach 120+ total - more than 50 providers)
INSERT INTO NATIVE_APPS (app_id, name, provider_name, category, pricing_model, rating, installations, monthly_revenue, growth_rate)
VALUES
-- Advanced Enterprise Apps
('APP061', 'Enterprise Data Fabric', 'DataTech Global', 'Data Engineering', 'Enterprise', 4.7, 15200, 485000.00, 22.5, '2022-01-15'),
('APP062', 'Real-time Analytics Engine', 'AI Innovations Corp', 'Analytics', 'Premium', 4.8, 18500, 625000.00, 28.3, '2022-03-22'),
('APP063', 'Cloud Security Suite', 'SecureCloud Enterprise', 'Security', 'Enterprise', 4.6, 12800, 520000.00, 19.7, '2022-02-10'),
('APP064', 'Advanced BI Platform', 'Analytics Masters', 'Business Intelligence', 'Enterprise', 4.5, 22400, 685000.00, 21.2, '2021-11-08'),
('APP065', 'Multi-Cloud Orchestrator', 'CloudFirst Solutions', 'Cloud Services', 'Professional', 4.4, 14600, 425000.00, 35.8, '2022-04-18'),
('APP066', 'Quantum ML Platform', 'Quantum Computing Labs', 'ML/AI', 'Premium', 4.9, 1200, 1850000.00, 125.7, '2023-01-12'),
('APP067', 'Digital Process Optimizer', 'Digital Transformation Inc', 'Business Intelligence', 'Enterprise', 4.6, 28900, 785000.00, 24.6, '2022-02-28'),
('APP068', 'Global Analytics Hub', 'Global Analytics Hub', 'Analytics', 'Professional', 4.3, 16800, 485000.00, 32.1, '2022-05-15'),
('APP069', 'Enterprise AI Suite', 'Enterprise AI Systems', 'ML/AI', 'Enterprise', 4.7, 19200, 650000.00, 29.4, '2022-06-20'),
('APP070', 'Advanced Data Intelligence', 'Data Intelligence Pro', 'Analytics', 'Professional', 4.2, 13400, 395000.00, 33.8, '2022-07-12'),

-- Mid-tier Growth Apps
('APP071', 'Smart Visualization Pro', 'DataViz Experts', 'Business Intelligence', 'Professional', 4.1, 9800, 285000.00, 48.5, '2022-08-25'),
('APP072', 'AutoML Enterprise', 'ML Dynamics', 'ML/AI', 'Professional', 4.0, 7200, 195000.00, 58.7, '2022-09-18'),
('APP073', 'Business Intelligence Hub', 'Business Intelligence Pro', 'Business Intelligence', 'Professional', 4.2, 11600, 325000.00, 42.3, '2022-10-08'),
('APP074', 'Cloud-Native Analytics', 'Cloud Native Systems', 'Analytics', 'Professional', 4.1, 10800, 298000.00, 45.9, '2022-11-14'),
('APP075', 'Predictive Intelligence', 'Predictive Analytics', 'Analytics', 'Professional', 3.9, 8600, 245000.00, 52.4, '2022-12-05'),

-- Industry-Specific Apps
('APP076', 'Retail Analytics Pro', 'Retail Intelligence', 'Business Intelligence', 'Professional', 4.0, 6800, 185000.00, 55.3, '2023-01-20'),
('APP077', 'Marketing Intelligence Pro', 'Marketing Analytics Hub', 'Analytics', 'Enterprise', 4.2, 14200, 485000.00, 38.7, '2022-04-12'),
('APP078', 'Supply Chain Intelligence', 'Supply Chain Analytics', 'Analytics', 'Enterprise', 4.1, 9600, 385000.00, 47.8, '2022-05-28'),
('APP079', 'Customer Analytics Pro', 'Customer Experience AI', 'ML/AI', 'Professional', 3.8, 7400, 225000.00, 62.1, '2022-06-15'),
('APP080', 'Energy Analytics Suite', 'Energy Analytics Corp', 'Analytics', 'Professional', 3.9, 5200, 145000.00, 43.2, '2022-07-22'),

-- Specialized and Emerging Apps
('APP081', 'Transportation Analytics', 'Transportation Intelligence', 'Analytics', 'Professional', 4.0, 6400, 175000.00, 49.6, '2022-08-10'),
('APP082', 'Media Intelligence Platform', 'Media Analytics Pro', 'Business Intelligence', 'Professional', 4.1, 8200, 245000.00, 41.8, '2022-09-05'),
('APP083', 'Education Analytics Suite', 'Education Data Labs', 'Analytics', 'Growth', 3.8, 4200, 95000.00, 67.4, '2022-10-18'),
('APP084', 'Government Analytics Pro', 'Government Analytics', 'Analytics', 'Professional', 4.0, 3800, 125000.00, 35.9, '2022-11-25'),
('APP085', 'Real Estate Intelligence', 'Real Estate Intelligence', 'Business Intelligence', 'Professional', 3.7, 2900, 85000.00, 58.3, '2022-12-12'),

-- High-Growth Emerging Apps
('APP086', 'Blockchain Analytics Pro', 'Blockchain Analytics', 'Analytics', 'Professional', 4.2, 5600, 285000.00, 78.9, '2023-01-08'),
('APP087', 'IoT Data Analytics', 'IoT Data Platform', 'Analytics', 'Professional', 4.1, 7800, 225000.00, 56.7, '2022-03-16'),
('APP088', 'AR Analytics Suite', 'AR/VR Analytics', 'Analytics', 'Growth', 3.9, 1800, 65000.00, 112.5, '2023-02-20'),
('APP089', 'Climate Intelligence Pro', 'Climate Data Corp', 'Analytics', 'Professional', 4.0, 3600, 125000.00, 71.8, '2022-04-28'),
('APP090', 'Voice Analytics Engine', 'Voice Analytics Systems', 'ML/AI', 'Professional', 4.2, 4200, 145000.00, 68.4, '2022-05-14'),

-- Continue to reach 120+ apps with varied performance levels...
('APP091', 'Document AI Pro', 'Document Intelligence AI', 'ML/AI', 'Professional', 4.1, 6200, 185000.00, 52.3, '2022-06-08'),
('APP092', 'Geospatial Analytics Suite', 'Geospatial Analytics Pro', 'Analytics', 'Professional', 3.9, 4800, 135000.00, 47.9, '2022-07-25'),
('APP093', 'Network Intelligence Pro', 'Network Intelligence', 'Analytics', 'Professional', 4.0, 7200, 205000.00, 44.2, '2022-08-18'),
('APP094', 'Identity Analytics Suite', 'Identity Management Corp', 'Security', 'Enterprise', 4.3, 8900, 385000.00, 31.7, '2022-02-14'),
('APP095', 'Data Governance Pro', 'Data Catalog Systems', 'Data Engineering', 'Professional', 4.1, 5400, 165000.00, 39.8, '2022-09-22'),
('APP096', 'API Analytics Pro', 'API Intelligence Hub', 'Analytics', 'Professional', 3.8, 6800, 195000.00, 48.6, '2022-10-15'),
('APP097', 'Time Series Pro', 'Time Series Analytics', 'Analytics', 'Professional', 4.2, 7600, 225000.00, 36.4, '2022-11-08'),
('APP098', 'Graph Analytics Suite', 'Graph Database Solutions', 'Analytics', 'Enterprise', 4.4, 9200, 425000.00, 42.7, '2022-01-28'),
('APP099', 'Streaming Analytics Pro', 'Streaming Data Platform', 'Data Engineering', 'Enterprise', 4.5, 11800, 485000.00, 33.9, '2022-03-12'),
('APP100', 'Compliance Analytics Pro', 'Compliance Automation', 'Compliance', 'Enterprise', 4.3, 8400, 365000.00, 28.5, '2022-04-20'),

-- Additional high-performance apps to complete 120+
('APP101', 'Fraud Detection Suite', 'Fraud Detection AI', 'Security', 'Enterprise', 4.6, 6800, 685000.00, 24.8, '2021-12-15'),
('APP102', 'Content Analytics Pro', 'Content Intelligence', 'Analytics', 'Professional', 3.9, 5200, 145000.00, 51.2, '2022-07-08'),
('APP103', 'Recommendation AI Pro', 'Recommendation Engine Pro', 'ML/AI', 'Growth', 3.7, 2400, 65000.00, 89.7, '2023-01-25'),
('APP104', 'Edge Analytics Suite', 'Edge Computing Analytics', 'Analytics', 'Professional', 4.1, 4600, 125000.00, 58.3, '2022-08-12'),
('APP105', 'Container Analytics Pro', 'Container Intelligence', 'DevOps', 'Professional', 4.0, 6200, 175000.00, 45.2, '2022-09-28'),

-- Startup and emerging high-growth apps
('APP106', 'StartupBI Pro', 'StartupBI Analytics', 'Business Intelligence', 'Growth', 3.9, 1800, 45000.00, 125.8, '2023-02-10'),
('APP107', 'DataStream Intelligence', 'DataStream Innovations', 'Data Engineering', 'Growth', 3.8, 2200, 58000.00, 98.4, '2023-03-05'),
('APP108', 'Innovation Analytics', 'Emerging Tech Labs', 'Analytics', 'Growth', 4.0, 1200, 38000.00, 145.7, '2023-03-18'),
('APP109', 'Growth Analytics Pro', 'Growth Analytics Startup', 'Analytics', 'Growth', 3.6, 1600, 42000.00, 112.3, '2023-02-28'),
('APP110', 'NextGen AI Analytics', 'NextGen AI Systems', 'ML/AI', 'Growth', 3.8, 1400, 35000.00, 89.6, '2023-03-12');

-- Add 350 more Enterprise Customers (to reach 400 total - way more than providers and apps)
-- Insert in batches for efficiency
INSERT INTO CONSUMERS (consumer_id, name, industry, country, size, status, installed_apps, total_spend, satisfaction_score, contract_type)
VALUES
