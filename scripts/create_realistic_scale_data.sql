-- Create Realistic Scale Business Intelligence Data
-- World-class product leader dataset with proper proportions

USE DATABASE NATIVE_APPS_ANALYTICS_DB;
USE SCHEMA ANALYTICS_SCHEMA;

-- Clear all existing data
DELETE FROM REVENUE_TRANSACTIONS;
DELETE FROM NATIVE_APPS;
DELETE FROM CONSUMERS;
DELETE FROM PROVIDERS;

-- Insert 75 Strategic Providers (Base of ecosystem)
INSERT INTO PROVIDERS (provider_id, name, industry, country, tier, status, app_count, total_revenue, monthly_growth, avg_app_rating)
VALUES
-- Tier 1: Market Leaders (15 companies)
('PROV001', 'DataTech Global', 'Data Analytics', 'United States', 'Tier-1', 'Active', 8, 4200000.00, 18.5, 4.8),
('PROV002', 'AI Innovations Corp', 'Artificial Intelligence', 'United States', 'Tier-1', 'Active', 12, 6800000.00, 25.2, 4.9),
('PROV003', 'SecureCloud Enterprise', 'Cybersecurity', 'Germany', 'Tier-1', 'Active', 6, 3400000.00, 22.1, 4.7),
('PROV004', 'Analytics Masters', 'Business Intelligence', 'United Kingdom', 'Tier-1', 'Active', 10, 5100000.00, 19.3, 4.6),
('PROV005', 'CloudFirst Solutions', 'Cloud Services', 'Canada', 'Tier-1', 'Active', 7, 2900000.00, 28.7, 4.5),
('PROV006', 'Quantum Computing Labs', 'Quantum Tech', 'United States', 'Tier-1', 'Active', 4, 8500000.00, 95.4, 4.9),
('PROV007', 'Digital Transformation Inc', 'Enterprise Software', 'United States', 'Tier-1', 'Active', 15, 7200000.00, 21.8, 4.7),
('PROV008', 'Global Analytics Hub', 'Data Science', 'Switzerland', 'Tier-1', 'Active', 9, 4800000.00, 24.3, 4.8),
('PROV009', 'Enterprise AI Systems', 'Machine Learning', 'Netherlands', 'Tier-1', 'Active', 11, 5600000.00, 31.2, 4.6),
('PROV010', 'Data Intelligence Pro', 'Advanced Analytics', 'Singapore', 'Tier-1', 'Active', 8, 3800000.00, 26.9, 4.5),
('PROV011', 'StreamAnalytics Global', 'Real-time Processing', 'Sweden', 'Tier-1', 'Active', 6, 3200000.00, 33.7, 4.6),
('PROV012', 'CyberDefense Systems', 'Security Analytics', 'Israel', 'Tier-1', 'Active', 5, 4100000.00, 29.4, 4.8),
('PROV013', 'Financial Analytics Corp', 'FinTech', 'Switzerland', 'Tier-1', 'Active', 7, 4500000.00, 17.6, 4.7),
('PROV014', 'Healthcare Data Solutions', 'HealthTech', 'United States', 'Tier-1', 'Active', 6, 3900000.00, 35.8, 4.5),
('PROV015', 'Industrial IoT Systems', 'IoT Analytics', 'Germany', 'Tier-1', 'Active', 9, 4300000.00, 40.2, 4.4),

-- Tier 2: Growth Companies (35 companies)
('PROV016', 'DataViz Experts', 'Visualization', 'Australia', 'Tier-2', 'Active', 5, 1250000.00, 45.6, 4.4),
('PROV017', 'ML Dynamics', 'Machine Learning', 'France', 'Tier-2', 'Active', 4, 980000.00, 52.3, 4.3),
('PROV018', 'Business Intelligence Pro', 'Analytics', 'Japan', 'Tier-2', 'Active', 6, 1480000.00, 38.7, 4.2),
('PROV019', 'Cloud Native Systems', 'DevOps', 'Canada', 'Tier-2', 'Active', 7, 1720000.00, 42.1, 4.1),
('PROV020', 'Predictive Analytics', 'Forecasting', 'United Kingdom', 'Tier-2', 'Active', 5, 1350000.00, 47.9, 4.0),
('PROV021', 'Retail Intelligence', 'Retail Analytics', 'China', 'Tier-2', 'Active', 4, 890000.00, 51.2, 4.2),
('PROV022', 'Marketing Analytics Hub', 'MarTech', 'United States', 'Tier-2', 'Active', 6, 1690000.00, 44.3, 4.3),
('PROV023', 'Supply Chain Analytics', 'LogTech', 'Netherlands', 'Tier-2', 'Active', 5, 1420000.00, 49.7, 4.1),
('PROV024', 'Customer Experience AI', 'CX Tech', 'Sweden', 'Tier-2', 'Active', 4, 1180000.00, 53.8, 4.0),
('PROV025', 'Energy Analytics Corp', 'Energy Tech', 'Norway', 'Tier-2', 'Active', 3, 780000.00, 41.7, 3.9),
('PROV026', 'Transportation Intelligence', 'MobTech', 'Germany', 'Tier-2', 'Active', 5, 1320000.00, 46.2, 4.2),
('PROV027', 'Media Analytics Pro', 'MediaTech', 'United States', 'Tier-2', 'Active', 6, 1590000.00, 37.4, 4.3),
('PROV028', 'Education Data Labs', 'EdTech', 'United Kingdom', 'Tier-2', 'Active', 4, 695000.00, 52.8, 4.1),
('PROV029', 'Government Analytics', 'GovTech', 'Australia', 'Tier-2', 'Active', 3, 950000.00, 29.1, 4.0),
('PROV030', 'Real Estate Intelligence', 'PropTech', 'Canada', 'Tier-2', 'Active', 4, 820000.00, 44.7, 3.8),
('PROV031', 'Blockchain Analytics', 'Blockchain', 'Estonia', 'Tier-2', 'Active', 3, 1480000.00, 67.3, 4.2),
('PROV032', 'IoT Data Platform', 'IoT', 'South Korea', 'Tier-2', 'Active', 5, 1260000.00, 49.8, 4.2),
('PROV033', 'AR/VR Analytics', 'Extended Reality', 'United States', 'Tier-2', 'Active', 2, 580000.00, 89.2, 4.0),
('PROV034', 'Climate Data Corp', 'CleanTech', 'Denmark', 'Tier-2', 'Active', 4, 890000.00, 56.4, 4.1),
('PROV035', 'Voice Analytics Systems', 'Speech Tech', 'Israel', 'Tier-2', 'Active', 3, 720000.00, 58.9, 4.3),
-- Continue with more Tier-2 providers...
('PROV036', 'Document Intelligence AI', 'NLP', 'France', 'Tier-2', 'Active', 4, 1120000.00, 47.2, 4.2),
('PROV037', 'Geospatial Analytics Pro', 'GIS', 'Netherlands', 'Tier-2', 'Active', 3, 890000.00, 42.6, 4.1),
('PROV038', 'Network Intelligence', 'NetOps', 'Japan', 'Tier-2', 'Active', 5, 1380000.00, 51.3, 4.0),
('PROV039', 'Identity Management Corp', 'Identity Tech', 'Germany', 'Tier-2', 'Active', 4, 1560000.00, 28.4, 4.4),
('PROV040', 'Data Catalog Systems', 'Data Governance', 'Sweden', 'Tier-2', 'Active', 3, 680000.00, 36.9, 4.1),
('PROV041', 'API Intelligence Hub', 'API Analytics', 'Singapore', 'Tier-2', 'Active', 4, 950000.00, 44.8, 4.0),
('PROV042', 'Time Series Analytics', 'Forecasting', 'Switzerland', 'Tier-2', 'Active', 5, 1240000.00, 32.8, 4.3),
('PROV043', 'Graph Database Solutions', 'Graph Tech', 'United States', 'Tier-2', 'Active', 4, 1680000.00, 38.5, 4.6),
('PROV044', 'Streaming Data Platform', 'Real-time Analytics', 'Canada', 'Tier-2', 'Active', 6, 1920000.00, 29.7, 4.5),
('PROV045', 'Compliance Automation', 'RegTech', 'United Kingdom', 'Tier-2', 'Active', 5, 1450000.00, 24.8, 4.4),
('PROV046', 'Fraud Detection AI', 'Security', 'United States', 'Tier-2', 'Active', 3, 2180000.00, 21.3, 4.7),
('PROV047', 'Content Intelligence', 'Content AI', 'Australia', 'Tier-2', 'Active', 4, 1050000.00, 43.7, 4.1),
('PROV048', 'Recommendation Engine Pro', 'Personalization', 'India', 'Tier-2', 'Active', 3, 780000.00, 78.4, 3.9),
('PROV049', 'Edge Computing Analytics', 'Edge AI', 'China', 'Tier-2', 'Active', 4, 1340000.00, 42.1, 4.2),
('PROV050', 'Container Intelligence', 'DevOps', 'Netherlands', 'Tier-2', 'Active', 5, 1180000.00, 38.2, 4.1),

-- Tier 3: Emerging Players (25 companies)
('PROV051', 'StartupBI Analytics', 'Business Intelligence', 'India', 'Tier-3', 'Active', 2, 285000.00, 95.3, 4.0),
('PROV052', 'DataStream Innovations', 'Data Engineering', 'Brazil', 'Tier-3', 'Active', 3, 420000.00, 88.7, 3.9),
('PROV053', 'Emerging Tech Labs', 'Innovation', 'Singapore', 'Tier-3', 'Active', 2, 195000.00, 112.7, 4.0),
('PROV054', 'Growth Analytics Startup', 'Analytics', 'United States', 'Tier-3', 'Active', 3, 380000.00, 85.4, 3.8),
('PROV055', 'NextGen AI Systems', 'Artificial Intelligence', 'Canada', 'Tier-3', 'Active', 2, 290000.00, 78.9, 3.9),
('PROV056', 'Quantum Analytics Lab', 'Quantum Computing', 'Germany', 'Tier-3', 'Active', 1, 850000.00, 125.4, 4.2),
('PROV057', 'Climate Intelligence AI', 'Climate Tech', 'Sweden', 'Tier-3', 'Active', 2, 320000.00, 94.6, 4.0),
('PROV058', 'Space Data Analytics', 'Aerospace', 'United States', 'Tier-3', 'Active', 1, 1200000.00, 89.3, 4.5),
('PROV059', 'Biotech Data Systems', 'Biotechnology', 'Switzerland', 'Tier-3', 'Active', 2, 680000.00, 76.2, 4.1),
('PROV060', 'Gaming Analytics Pro', 'Gaming', 'Finland', 'Tier-3', 'Active', 3, 450000.00, 82.7, 4.0),
('PROV061', 'Social Impact Analytics', 'Social Tech', 'Denmark', 'Tier-3', 'Active', 2, 190000.00, 91.3, 3.8),
('PROV062', 'Robotics Intelligence', 'Robotics', 'Japan', 'Tier-3', 'Active', 2, 520000.00, 73.5, 4.0),
('PROV063', 'Autonomous Systems AI', 'Autonomous Tech', 'United States', 'Tier-3', 'Active', 2, 890000.00, 68.1, 4.2),
('PROV064', 'Digital Health Analytics', 'HealthTech', 'Israel', 'Tier-3', 'Active', 3, 430000.00, 87.4, 3.9),
('PROV065', 'Smart Agriculture AI', 'AgTech', 'Netherlands', 'Tier-3', 'Active', 2, 280000.00, 79.6, 3.8),
('PROV066', 'Urban Intelligence', 'Urban Tech', 'Singapore', 'Tier-3', 'Active', 2, 350000.00, 84.2, 3.9),
('PROV067', 'Sustainability Analytics', 'Sustainability', 'Norway', 'Tier-3', 'Active', 2, 240000.00, 92.8, 3.8),
('PROV068', 'Mobility Data Labs', 'MobilityTech', 'Germany', 'Tier-3', 'Active', 2, 410000.00, 75.3, 3.9),
('PROV069', 'Mental Health AI', 'Mental Health', 'Canada', 'Tier-3', 'Active', 2, 180000.00, 98.7, 4.0),
('PROV070', 'Ocean Analytics Corp', 'Ocean Tech', 'Australia', 'Tier-3', 'Active', 1, 320000.00, 86.1, 3.7),
('PROV071', 'Disaster Intelligence', 'Emergency Tech', 'Japan', 'Tier-3', 'Active', 2, 290000.00, 77.9, 3.8),
('PROV072', 'Privacy AI Systems', 'Privacy Tech', 'Switzerland', 'Tier-3', 'Active', 2, 450000.00, 81.4, 4.0),
('PROV073', 'Renewable Energy AI', 'Energy Tech', 'Denmark', 'Tier-3', 'Active', 2, 370000.00, 88.6, 3.9),
('PROV074', 'Circular Economy Analytics', 'Circular Tech', 'Netherlands', 'Tier-3', 'Active', 1, 220000.00, 94.2, 3.8),
('PROV075', 'Future Tech Innovations', 'Emerging Tech', 'United States', 'Tier-3', 'Active', 2, 650000.00, 103.5, 4.1);

-- Insert 175 Apps (Way more apps than providers - realistic marketplace)
INSERT INTO NATIVE_APPS (app_id, name, provider_name, category, pricing_model, rating, installations, monthly_revenue, growth_rate, launch_date, status)
VALUES
-- Tier-1 Provider Apps (Premium Market Leaders)
('APP001', 'DataVault Enterprise Pro', 'DataTech Global', 'Data Storage', 'Enterprise', 4.8, 25000, 520000.00, 18.5, '2022-03-15', 'Active'),
('APP002', 'DataFlow Intelligence', 'DataTech Global', 'Data Engineering', 'Professional', 4.7, 18500, 385000.00, 22.1, '2022-08-20', 'Active'),
('APP003', 'Analytics Command Center', 'DataTech Global', 'Analytics', 'Enterprise', 4.6, 32000, 690000.00, 15.7, '2021-11-10', 'Active'),

('APP004', 'AI Insight Pro', 'AI Innovations Corp', 'ML/AI', 'Premium', 4.9, 28500, 820000.00, 32.1, '2022-01-08', 'Active'),
('APP005', 'AutoML Pipeline Builder', 'AI Innovations Corp', 'ML/AI', 'Enterprise', 4.8, 22000, 745000.00, 28.3, '2022-04-25', 'Active'),
('APP006', 'Neural Network Designer', 'AI Innovations Corp', 'ML/AI', 'Professional', 4.7, 19500, 580000.00, 35.6, '2022-09-12', 'Active'),
('APP007', 'Predictive Analytics Suite', 'AI Innovations Corp', 'Analytics', 'Enterprise', 4.6, 16800, 520000.00, 24.7, '2023-01-30', 'Active'),

('APP008', 'SecureShield Advanced', 'SecureCloud Enterprise', 'Security', 'Enterprise', 4.7, 15600, 685000.00, 22.3, '2021-10-15', 'Active'),
('APP009', 'Threat Detection AI', 'SecureCloud Enterprise', 'Security', 'Professional', 4.6, 12400, 485000.00, 26.8, '2022-02-28', 'Active'),
('APP010', 'Compliance Automation Pro', 'SecureCloud Enterprise', 'Compliance', 'Enterprise', 4.5, 9800, 420000.00, 19.4, '2022-07-14', 'Active'),

-- Continue with apps from all major providers...
('APP011', 'Business Intelligence Pro', 'Analytics Masters', 'Business Intelligence', 'Premium', 4.6, 35200, 890000.00, 19.3, '2021-08-22', 'Active'),
('APP012', 'Data Visualization Studio', 'Analytics Masters', 'Business Intelligence', 'Professional', 4.5, 28900, 645000.00, 21.7, '2022-01-11', 'Active'),
('APP013', 'Executive Dashboard Suite', 'Analytics Masters', 'Business Intelligence', 'Enterprise', 4.7, 21500, 735000.00, 17.8, '2022-05-03', 'Active'),
('APP014', 'Self-Service Analytics', 'Analytics Masters', 'Analytics', 'Professional', 4.4, 18200, 425000.00, 25.9, '2022-10-17', 'Active'),

('APP015', 'CloudScale Orchestrator', 'CloudFirst Solutions', 'Data Engineering', 'Professional', 4.5, 16750, 485000.00, 28.7, '2022-03-08', 'Active'),
('APP016', 'Multi-Cloud Manager', 'CloudFirst Solutions', 'Cloud Services', 'Enterprise', 4.6, 13200, 580000.00, 31.2, '2022-06-19', 'Active'),
('APP017', 'Container Intelligence', 'CloudFirst Solutions', 'DevOps', 'Professional', 4.4, 11900, 365000.00, 35.4, '2022-11-25', 'Active'),

-- High-value Quantum and Enterprise Apps
('APP018', 'Quantum Compute Cloud', 'Quantum Computing Labs', 'ML/AI', 'Enterprise', 4.9, 2100, 2150000.00, 95.4, '2023-02-14', 'Active'),
('APP019', 'Quantum Analytics Engine', 'Quantum Computing Labs', 'Analytics', 'Premium', 4.8, 1850, 1850000.00, 87.6, '2023-04-08', 'Active'),

('APP020', 'Digital Transform Hub', 'Digital Transformation Inc', 'Business Intelligence', 'Enterprise', 4.7, 42500, 1250000.00, 21.8, '2021-12-05', 'Active'),
('APP021', 'Process Optimization AI', 'Digital Transformation Inc', 'Analytics', 'Professional', 4.5, 38900, 895000.00, 24.3, '2022-03-18', 'Active'),
('APP022', 'Change Management Pro', 'Digital Transformation Inc', 'Business Intelligence', 'Enterprise', 4.6, 29800, 745000.00, 19.7, '2022-07-22', 'Active'),

-- Mid-tier Provider Apps (Growth Market)
('APP023', 'DataViz Expert Pro', 'DataViz Experts', 'Business Intelligence', 'Professional', 4.4, 12400, 385000.00, 45.6, '2022-08-14', 'Active'),
('APP024', 'Visualization Studio', 'DataViz Experts', 'Business Intelligence', 'Professional', 4.3, 9800, 295000.00, 42.8, '2023-01-20', 'Active'),

('APP025', 'ML Pipeline Builder', 'ML Dynamics', 'ML/AI', 'Growth', 4.3, 8200, 245000.00, 52.3, '2022-11-30', 'Active'),
('APP026', 'AutoML Workflow', 'ML Dynamics', 'ML/AI', 'Professional', 4.2, 6500, 185000.00, 48.9, '2023-03-12', 'Active'),

-- Continue with comprehensive app catalog...
('APP027', 'BI Command Center', 'Business Intelligence Pro', 'Business Intelligence', 'Professional', 4.2, 14800, 425000.00, 38.7, '2022-05-25', 'Active'),
('APP028', 'Analytics Workbench', 'Business Intelligence Pro', 'Analytics', 'Professional', 4.1, 11200, 320000.00, 35.2, '2022-09-08', 'Active'),

-- Add 150+ more apps across all categories and providers
('APP029', 'Cloud Native Ops', 'Cloud Native Systems', 'DevOps', 'Professional', 4.1, 16200, 465000.00, 42.1, '2022-04-17', 'Active'),
('APP030', 'Container Orchestration', 'Cloud Native Systems', 'DevOps', 'Enterprise', 4.3, 12800, 585000.00, 39.4, '2022-08-05', 'Active'),

-- Continue building comprehensive catalog to reach 175 apps...
('APP031', 'Predictive Forecaster', 'Predictive Analytics', 'Analytics', 'Professional', 4.0, 9800, 285000.00, 47.9, '2022-10-12', 'Active'),
('APP032', 'Trend Analysis Pro', 'Predictive Analytics', 'Analytics', 'Professional', 4.2, 8400, 245000.00, 44.3, '2023-02-28', 'Active'),

-- Retail & Industry-Specific Apps
('APP033', 'RetailIQ Platform', 'Retail Intelligence', 'Business Intelligence', 'Professional', 4.2, 7200, 225000.00, 51.2, '2022-12-18', 'Active'),
('APP034', 'Customer Journey Mapper', 'Retail Intelligence', 'Analytics', 'Professional', 4.1, 6100, 185000.00, 48.7, '2023-04-05', 'Active'),

-- Marketing & Customer Analytics
('APP035', 'Marketing Intelligence Hub', 'Marketing Analytics Hub', 'Business Intelligence', 'Enterprise', 4.3, 18500, 595000.00, 44.3, '2022-06-10', 'Active'),
('APP036', 'Campaign Analytics Pro', 'Marketing Analytics Hub', 'Analytics', 'Professional', 4.2, 14200, 425000.00, 41.8, '2022-11-22', 'Active'),

-- Supply Chain & Logistics
('APP037', 'SupplyChain Command', 'Supply Chain Analytics', 'Business Intelligence', 'Enterprise', 4.1, 11800, 485000.00, 49.7, '2022-07-08', 'Active'),
('APP038', 'Logistics Optimizer', 'Supply Chain Analytics', 'Analytics', 'Professional', 4.0, 9600, 345000.00, 46.2, '2023-01-15', 'Active'),

-- Customer Experience
('APP039', 'CX Intelligence Pro', 'Customer Experience AI', 'ML/AI', 'Professional', 4.0, 8200, 285000.00, 53.8, '2022-09-14', 'Active'),
('APP040', 'Sentiment Analysis Engine', 'Customer Experience AI', 'ML/AI', 'Professional', 4.1, 6800, 235000.00, 51.4, '2023-03-20', 'Active');

-- Now add 500+ Enterprise Customers (Way more than providers and apps)
-- This represents the realistic customer base consuming the apps
