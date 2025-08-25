const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const snowflake = require('snowflake-sdk');

const app = express();
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors());
app.use(express.json());

function isRunningInSnowflakeContainer() {
  return fs.existsSync("/snowflake/session/token");
}

function getEnvConnectionOptions() {
  // Check if running inside Snowpark Container Services
  if (isRunningInSnowflakeContainer()) {
    return {
      accessUrl: "https://" + (process.env.SNOWFLAKE_HOST || ''),
      account: process.env.SNOWFLAKE_ACCOUNT || '',
      authenticator: 'OAUTH',
      token: fs.readFileSync('/snowflake/session/token', 'ascii'),
      role: process.env.SNOWFLAKE_ROLE,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      clientSessionKeepAlive: true,
    };
  } else {
    // Running locally - use environment variables for credentials
    return {
      account: process.env.SNOWFLAKE_ACCOUNT || '',
      username: process.env.SNOWFLAKE_USER,
      password: process.env.SNOWFLAKE_PASSWORD,
      role: process.env.SNOWFLAKE_ROLE,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      clientSessionKeepAlive: true,
    };
  }
}

async function connectToSnowflakeFromEnv(connectionName = 'default') {
  const connection = snowflake.createConnection(getEnvConnectionOptions());
  await new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        reject(err);
      } else {
        resolve(conn);
      }
    });
  });
  return connection;
}

// Function to read snowsql config (similar to Python version)
function readSnowsqlConfig(configPath = '~/.snowsql/config') {
  const expandedPath = configPath.replace('~', require('os').homedir());
  
  if (!fs.existsSync(expandedPath)) {
    throw new Error(`Config file not found at ${expandedPath}`);
  }
  
  const configContent = fs.readFileSync(expandedPath, 'utf8');
  return parseIniFile(configContent);
}

// Simple INI file parser
function parseIniFile(content) {
  const config = {};
  let currentSection = null;
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1);
      config[currentSection] = {};
    } else if (line.includes('=') && currentSection) {
      const [key, value] = line.split('=').map(s => s.trim());
      config[currentSection][key] = value.replace(/['"]/g, ''); // Remove quotes
    }
  });
  
  return config;
}

// Function to load private key (Node.js Snowflake SDK expects PEM string)
function loadPrivateKey(privateKeyPath) {
  try {
    const keyPath = privateKeyPath.replace('~', require('os').homedir());
    
    console.log(`Loading private key from: ${keyPath}`);
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    
    // The Node.js Snowflake SDK expects the private key as a PEM string
    console.log('Successfully loaded private key as PEM string');
    return keyContent;
  } catch (error) {
    console.error('Error loading private key:', error);
    return null;
  }
}

// Connect to Snowflake using default configuration
async function connectToSnowflakeFromConfig(connectionName = 'default') {
  try {
    console.log(`Connecting to Snowflake using ${connectionName}...`);
    
    // Read configuration
    const config = readSnowsqlConfig();
    
    // Try to get connection parameters from the specified connection
    let sectionName = `connections.${connectionName}`;
    if (!config[sectionName]) {
      // Fall back to direct section name
      const availableSections = Object.keys(config).filter(s => !s.startsWith('connections.'));
      if (availableSections.length > 0) {
        sectionName = availableSections[0];
        console.log(`Connection '${connectionName}' not found, using '${sectionName}'`);
      } else {
        throw new Error('No valid connection configuration found');
      }
    }
    
    const section = config[sectionName];
    console.log('Found config section:', sectionName);
    
    // Extract connection parameters
    const account = section.accountname || section.account;
    const username = section.username || section.user;
    const privateKeyPath = section.private_key_path;
    const password = section.password;
    const warehouse = section.warehousename || section.warehouse || process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH';
    const database = section.databasename || section.database || process.env.SNOWFLAKE_DATABASE;
    const schema = section.schemaname || section.schema || process.env.SNOWFLAKE_SCHEMA;
    
    if (!account || !username) {
      throw new Error('Missing required connection parameters (account, username)');
    }
    
    if (!privateKeyPath && !password) {
      throw new Error('Missing authentication method (private_key_path or password)');
    }
    
    console.log(`Account: ${account}`);
    console.log(`Username: ${username}`);
    console.log(`Warehouse: ${warehouse}`);
    
    // Create connection parameters
    const connectionParams = {
      account: account,
      username: username,
      warehouse: warehouse
    };
    
    // Add database and schema if available
    if (database) connectionParams.database = database;
    if (schema) connectionParams.schema = schema;
    
    // Add authentication method
    if (privateKeyPath) {
      console.log('Using private key authentication');
      const privateKey = loadPrivateKey(privateKeyPath);
      if (!privateKey) {
        throw new Error('Failed to load private key');
      }
      connectionParams.privateKey = privateKey;
      connectionParams.authenticator = 'SNOWFLAKE_JWT';
    } else {
      console.log('Using password authentication');
      connectionParams.password = password;
    }
    
    // Create and connect
    const connection = snowflake.createConnection(connectionParams);
    
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    });
    
    console.log('✅ Successfully connected to Snowflake!');
    return connection;
    
  } catch (error) {
    console.error('❌ Error connecting to Snowflake:', error);
    throw error;
  }
}

async function connectToSnowflake(connectionName = 'default') {
  if (isRunningInSnowflakeContainer()) {
    return await connectToSnowflakeFromEnv(connectionName);
  } else {
    return await connectToSnowflakeFromConfig(connectionName);
  }
}

// Execute query with proper error handling
async function executeQuery(connection, query) {
    return new Promise((resolve, reject) => {
        connection.execute({
            sqlText: query,
            complete: (err, stmt, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        });
    });
}

// Utility function to simulate database delay
const simulateDelay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Dashboard Overview API
app.get('/api/dashboard/overview', async (req, res) => {
    let connection;
    try {
        console.log('📊 Loading dashboard overview from database...');
        connection = await connectToSnowflake('default');
        
        // Query database for overview metrics
        const overviewQuery = `
            SELECT 
                (SELECT SUM(total_revenue) FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.PROVIDERS) as total_revenue,
                (SELECT COUNT(*) FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.PROVIDERS) as total_providers,
                (SELECT COUNT(*) FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.CONSUMERS) as total_consumers,
                (SELECT COUNT(*) FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.NATIVE_APPS) as total_apps
        `;
        
        const results = await executeQuery(connection, overviewQuery);
        const overview = results[0];
        
        res.json({
            success: true,
            data: {
                totalRevenue: overview.TOTAL_REVENUE || 0,
                totalProviders: overview.TOTAL_PROVIDERS || 0,
                totalConsumers: overview.TOTAL_CONSUMERS || 0,
                totalApps: overview.TOTAL_APPS || 0,
                growthRate: 12.5 // Could be calculated from historical data
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading overview:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Providers API
app.get('/api/providers', async (req, res) => {
    let connection;
    try {
        console.log('👥 Loading providers from database...');
        connection = await connectToSnowflake('default');
        
        const providersQuery = `
            SELECT provider_id, name, industry, country, tier, total_revenue, 
                   monthly_growth, app_count, consumer_count, avg_app_rating, status
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.PROVIDERS
            ORDER BY total_revenue DESC
        `;
        
        const providers = await executeQuery(connection, providersQuery);
        
        res.json({
            success: true,
            data: providers.map(p => ({
                id: p.PROVIDER_ID,
                name: p.NAME,
                industry: p.INDUSTRY,
                country: p.COUNTRY,
                tier: p.TIER,
                totalRevenue: p.TOTAL_REVENUE || 0,
                monthlyGrowth: p.MONTHLY_GROWTH || 0,
                appCount: p.APP_COUNT || 0,
                consumerCount: p.CONSUMER_COUNT || 0,
                avgAppRating: p.AVG_APP_RATING || 0,
                status: p.STATUS
            }))
        });
        
    } catch (error) {
        console.error('❌ Error loading providers:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Consumers API
app.get('/api/consumers', async (req, res) => {
    let connection;
    try {
        console.log('👥 Loading consumers from database...');
        connection = await connectToSnowflake('default');
        
        const consumersQuery = `
            SELECT consumer_id, name, industry, country, size, total_spend,
                   monthly_spend, installed_apps, satisfaction_score, status, contract_type
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.CONSUMERS
            ORDER BY total_spend DESC
        `;
        
        const consumers = await executeQuery(connection, consumersQuery);
        
        res.json({
            success: true,
            data: consumers.map(c => ({
                id: c.CONSUMER_ID,
                name: c.NAME,
                industry: c.INDUSTRY,
                country: c.COUNTRY,
                size: c.SIZE,
                totalSpend: c.TOTAL_SPEND || 0,
                monthlySpend: c.MONTHLY_SPEND || 0,
                installedApps: c.INSTALLED_APPS || 0,
                satisfactionScore: c.SATISFACTION_SCORE || 0,
                status: c.STATUS,
                contractType: c.CONTRACT_TYPE
            }))
        });
        
    } catch (error) {
        console.error('❌ Error loading consumers:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Native Apps API
app.get('/api/apps', async (req, res) => {
    let connection;
    try {
        console.log('📱 Loading native apps from database...');
        connection = await connectToSnowflake('default');
        
        const appsQuery = `
            SELECT app_id, name, provider_name, category, pricing_model,
                   monthly_revenue, installations, rating, growth_rate, status
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.NATIVE_APPS
            ORDER BY monthly_revenue DESC
        `;
        
        const apps = await executeQuery(connection, appsQuery);
        
        res.json({
            success: true,
            data: apps.map(a => ({
                id: a.APP_ID,
                name: a.NAME,
                providerName: a.PROVIDER_NAME,
                category: a.CATEGORY,
                pricing: a.PRICING_MODEL,
                monthlyRevenue: a.MONTHLY_REVENUE || 0,
                installations: a.INSTALLATIONS || 0,
                rating: a.RATING || 0,
                growthRate: a.GROWTH_RATE || 0,
                status: a.STATUS
            }))
        });
        
    } catch (error) {
        console.error('❌ Error loading apps:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (connection) {
            connection.destroy(); // CRITICAL: Always cleanup connections
        }
    }
});

// Revenue Analytics API
app.get('/api/revenue', async (req, res) => {
    let connection;
    try {
        console.log('💰 [REVENUE API] Starting revenue data fetch...');
        console.log('🔌 [REVENUE API] Connecting to Snowflake...');
        connection = await connectToSnowflake('default');
        console.log('✅ [REVENUE API] Connected to Snowflake successfully');
        
        const revenueQuery = `
            SELECT DATE_TRUNC('month', transaction_date) as month, SUM(amount) as revenue
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.REVENUE_TRANSACTIONS
            GROUP BY DATE_TRUNC('month', transaction_date)
            ORDER BY month DESC
            LIMIT 12
        `;
        
        console.log('📊 [REVENUE API] Executing revenue query...');
        console.log('🔍 [REVENUE API] Query:', revenueQuery);
        
        const revenueData = await executeQuery(connection, revenueQuery);
        
        console.log('📈 [REVENUE API] Raw query results:', revenueData.length, 'rows');
        if (revenueData.length > 0) {
            console.log('📈 [REVENUE API] First row structure:', Object.keys(revenueData[0]));
            console.log('📈 [REVENUE API] Sample raw data:', JSON.stringify(revenueData.slice(0, 2), null, 2));
        } else {
            console.log('⚠️  [REVENUE API] No data returned from query!');
        }
        
        const monthlyRevenue = revenueData.map(row => ({
            month: row.MONTH ? row.MONTH.toISOString().substring(0, 7) : row.month ? row.month.toISOString().substring(0, 7) : 'unknown',
            revenue: row.REVENUE || row.revenue || 0
        }));
        
        console.log('🎯 [REVENUE API] Processed revenue data:', monthlyRevenue.length, 'entries');
        console.log('🎯 [REVENUE API] Final processed data:', JSON.stringify(monthlyRevenue, null, 2));
        
        res.json({
            success: true,
            data: {
                monthlyRevenue
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading revenue:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (connection) {
            connection.destroy(); // CRITICAL: Always cleanup connections
        }
    }
});

// Strategic Market Intelligence API
app.get('/api/market-intelligence', async (req, res) => {
    let connection;
    try {
        console.log('🌍 [MARKET INTEL] Starting market intelligence analysis...');
        connection = await connectToSnowflake('default');
        
        // Provider Performance Matrix with Growth & Risk Analysis
        const providerAnalysisQuery = `
            SELECT 
                p.provider_id,
                p.name,
                p.industry,
                p.country,
                p.tier,
                p.app_count,
                p.total_revenue,
                p.monthly_growth,
                p.avg_app_rating,
                -- Calculate market share within tier
                ROUND(p.total_revenue / SUM(p.total_revenue) OVER (PARTITION BY p.tier) * 100, 2) as market_share_in_tier,
                -- Risk score based on multiple factors
                CASE 
                    WHEN p.monthly_growth > 30 AND p.avg_app_rating > 4.5 THEN 'Low Risk'
                    WHEN p.monthly_growth > 15 AND p.avg_app_rating > 4.0 THEN 'Medium Risk'
                    ELSE 'High Risk'
                END as risk_assessment,
                -- Strategic categorization
                CASE 
                    WHEN p.total_revenue > 1500000 AND p.monthly_growth > 20 THEN 'Star Performer'
                    WHEN p.total_revenue > 1000000 THEN 'Market Leader'
                    WHEN p.monthly_growth > 40 THEN 'Growth Champion'
                    ELSE 'Developing Partner'
                END as strategic_category
            FROM PROVIDERS p
            WHERE p.status = 'Active'
            ORDER BY p.total_revenue DESC
        `;
        
        // Geographic Market Distribution
        const geoAnalysisQuery = `
            SELECT 
                p.country,
                COUNT(*) as provider_count,
                SUM(p.total_revenue) as total_market_value,
                AVG(p.monthly_growth) as avg_growth_rate,
                AVG(p.avg_app_rating) as avg_quality_score,
                -- Market maturity indicator
                CASE 
                    WHEN AVG(p.monthly_growth) > 35 THEN 'Emerging Market'
                    WHEN AVG(p.monthly_growth) > 20 THEN 'Growth Market'
                    ELSE 'Mature Market'
                END as market_maturity
            FROM PROVIDERS p
            WHERE p.status = 'Active'
            GROUP BY p.country
            ORDER BY total_market_value DESC
        `;
        
        // Industry Sector Radar Analysis
        const sectorAnalysisQuery = `
            SELECT 
                p.industry,
                COUNT(*) as provider_count,
                AVG(p.total_revenue) as avg_revenue_per_provider,
                AVG(p.monthly_growth) as avg_growth_rate,
                AVG(p.avg_app_rating) as avg_quality,
                SUM(p.app_count) as total_apps_in_sector,
                -- Innovation index
                ROUND(AVG(p.monthly_growth) * AVG(p.avg_app_rating) / 100, 2) as innovation_index
            FROM PROVIDERS p
            WHERE p.status = 'Active'
            GROUP BY p.industry
            ORDER BY innovation_index DESC
        `;
        
        const [providerData, geoData, sectorData] = await Promise.all([
            executeQuery(connection, providerAnalysisQuery),
            executeQuery(connection, geoAnalysisQuery),
            executeQuery(connection, sectorAnalysisQuery)
        ]);
        
        console.log('✅ [MARKET INTEL] Market intelligence analysis complete');
        res.json({
            success: true,
            data: {
                providerMatrix: providerData,
                geographicDistribution: geoData,
                sectorAnalysis: sectorData,
                insights: {
                    topGrowthMarkets: geoData.filter(g => g.MARKET_MATURITY === 'Emerging Market'),
                    starPerformers: providerData.filter(p => p.STRATEGIC_CATEGORY === 'Star Performer'),
                    highRiskProviders: providerData.filter(p => p.RISK_ASSESSMENT === 'High Risk').length,
                    innovationLeaders: sectorData.slice(0, 3)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading market intelligence:', error);
        res.status(500).json({ error: 'Failed to load market intelligence data' });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Strategic Customer Analytics API
app.get('/api/customer-analytics', async (req, res) => {
    let connection;
    try {
        console.log('👥 [CUSTOMER ANALYTICS] Starting customer intelligence analysis...');
        connection = await connectToSnowflake('default');
        
        // Customer Segmentation & LTV Analysis
        const customerSegmentationQuery = `
            SELECT 
                c.consumer_id,
                c.name,
                c.industry,
                c.size,
                c.country,
                c.installed_apps,
                c.total_spend,
                c.satisfaction_score,
                c.contract_type,
                -- LTV Calculation
                CASE 
                    WHEN c.size = 'Enterprise' THEN c.total_spend * 3.2
                    WHEN c.size = 'Mid-Market' THEN c.total_spend * 2.8
                    ELSE c.total_spend * 2.1
                END as estimated_ltv,
                -- Customer Health Score
                CASE 
                    WHEN c.satisfaction_score >= 9.0 THEN 'Champion'
                    WHEN c.satisfaction_score >= 8.5 THEN 'Advocate'
                    WHEN c.satisfaction_score >= 8.0 THEN 'Satisfied'
                    WHEN c.satisfaction_score >= 7.5 THEN 'At Risk'
                    ELSE 'Critical'
                END as health_segment,
                -- Expansion Opportunity Score
                ROUND((10 - c.installed_apps) * c.satisfaction_score / 10, 2) as expansion_opportunity,
                -- Revenue per App
                ROUND(c.total_spend / NULLIF(c.installed_apps, 0), 2) as revenue_per_app
            FROM CONSUMERS c
            WHERE c.status = 'Active'
            ORDER BY estimated_ltv DESC
        `;
        
        // Churn Risk Analysis
        const churnAnalysisQuery = `
            SELECT 
                c.size,
                COUNT(*) as customer_count,
                AVG(c.satisfaction_score) as avg_satisfaction,
                -- Churn risk based on satisfaction and engagement
                COUNT(CASE WHEN c.satisfaction_score < 8.0 THEN 1 END) as at_risk_count,
                ROUND(COUNT(CASE WHEN c.satisfaction_score < 8.0 THEN 1 END) * 100.0 / COUNT(*), 2) as churn_risk_percentage,
                SUM(c.total_spend) as segment_revenue,
                AVG(c.installed_apps) as avg_app_adoption
            FROM CONSUMERS c
            WHERE c.status = 'Active'
            GROUP BY c.size
            ORDER BY churn_risk_percentage DESC
        `;
        
        // Industry-based Customer Analysis
        const industryAnalysisQuery = `
            SELECT 
                c.industry,
                COUNT(*) as customer_count,
                AVG(c.total_spend) as avg_spend_per_customer,
                SUM(c.total_spend) as total_industry_revenue,
                AVG(c.satisfaction_score) as avg_satisfaction,
                AVG(c.installed_apps) as avg_apps_per_customer,
                -- Growth potential
                CASE 
                    WHEN AVG(c.installed_apps) < 15 AND AVG(c.satisfaction_score) > 8.0 THEN 'High Growth Potential'
                    WHEN AVG(c.satisfaction_score) > 8.5 THEN 'Stable & Satisfied'
                    ELSE 'Needs Attention'
                END as segment_opportunity
            FROM CONSUMERS c
            WHERE c.status = 'Active'
            GROUP BY c.industry
            ORDER BY total_industry_revenue DESC
        `;
        
        const [segmentationData, churnData, industryData] = await Promise.all([
            executeQuery(connection, customerSegmentationQuery),
            executeQuery(connection, churnAnalysisQuery),
            executeQuery(connection, industryAnalysisQuery)
        ]);
        
        console.log('✅ [CUSTOMER ANALYTICS] Customer analysis complete');
        res.json({
            success: true,
            data: {
                customerSegmentation: segmentationData,
                churnAnalysis: churnData,
                industryBreakdown: industryData,
                actionableInsights: {
                    highValueCustomers: segmentationData.filter(c => c.ESTIMATED_LTV > 3000000),
                    expansionOpportunities: segmentationData.filter(c => c.EXPANSION_OPPORTUNITY > 5).slice(0, 10),
                    championCustomers: segmentationData.filter(c => c.HEALTH_SEGMENT === 'Champion'),
                    criticalCustomers: segmentationData.filter(c => c.HEALTH_SEGMENT === 'Critical'),
                    highGrowthIndustries: industryData.filter(i => i.SEGMENT_OPPORTUNITY === 'High Growth Potential')
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading customer analytics:', error);
        res.status(500).json({ error: 'Failed to load customer analytics data' });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Strategic Product Portfolio API
app.get('/api/product-intelligence', async (req, res) => {
    let connection;
    try {
        console.log('🚀 [PRODUCT INTEL] Starting product portfolio analysis...');
        connection = await connectToSnowflake('default');
        
        // App Performance Matrix
        const appPerformanceQuery = `
            SELECT 
                na.app_id,
                na.name,
                na.provider_name,
                na.category,
                na.pricing_model,
                na.rating,
                na.installations,
                na.monthly_revenue,
                na.growth_rate,
                -- Market Position Analysis
                CASE 
                    WHEN na.monthly_revenue > 400000 AND na.growth_rate > 25 THEN 'Star Product'
                    WHEN na.monthly_revenue > 200000 THEN 'Cash Cow'
                    WHEN na.growth_rate > 50 THEN 'Rising Star'
                    ELSE 'Question Mark'
                END as portfolio_position,
                -- Competitive Strength
                ROUND(na.rating * na.installations / 1000, 2) as market_strength_score,
                -- Revenue per Installation
                ROUND(na.monthly_revenue / NULLIF(na.installations, 0), 2) as revenue_per_install
            FROM NATIVE_APPS na
            ORDER BY na.monthly_revenue DESC
        `;
        
        // Category Analysis
        const categoryAnalysisQuery = `
            SELECT 
                na.category,
                COUNT(*) as app_count,
                SUM(na.monthly_revenue) as category_revenue,
                AVG(na.rating) as avg_category_rating,
                SUM(na.installations) as total_installations,
                AVG(na.growth_rate) as avg_growth_rate,
                -- Category Maturity
                CASE 
                    WHEN AVG(na.growth_rate) > 40 THEN 'Emerging Category'
                    WHEN AVG(na.growth_rate) > 25 THEN 'Growth Category'
                    ELSE 'Mature Category'
                END as category_maturity,
                -- Market Concentration (top app's share)
                MAX(na.monthly_revenue) / SUM(na.monthly_revenue) * 100 as market_concentration
            FROM NATIVE_APPS na
            GROUP BY na.category
            ORDER BY category_revenue DESC
        `;
        
        // Competitive Benchmarking
        const competitiveAnalysisQuery = `
            WITH app_rankings AS (
                SELECT 
                    na.*,
                    ROW_NUMBER() OVER (PARTITION BY na.category ORDER BY na.monthly_revenue DESC) as revenue_rank,
                    ROW_NUMBER() OVER (PARTITION BY na.category ORDER BY na.rating DESC) as quality_rank,
                    ROW_NUMBER() OVER (PARTITION BY na.category ORDER BY na.growth_rate DESC) as growth_rank
                FROM NATIVE_APPS na
            )
            SELECT 
                category,
                app_id,
                name,
                provider_name,
                monthly_revenue,
                rating,
                growth_rate,
                installations,
                revenue_rank,
                quality_rank,
                growth_rank,
                -- Overall competitive position
                ROUND((revenue_rank + quality_rank + growth_rank) / 3.0, 1) as overall_rank
            FROM app_rankings
            WHERE revenue_rank <= 5 OR quality_rank <= 5 OR growth_rank <= 5
            ORDER BY category, overall_rank
        `;
        
        const [performanceData, categoryData, competitiveData] = await Promise.all([
            executeQuery(connection, appPerformanceQuery),
            executeQuery(connection, categoryAnalysisQuery),
            executeQuery(connection, competitiveAnalysisQuery)
        ]);
        
        console.log('✅ [PRODUCT INTEL] Product intelligence analysis complete');
        res.json({
            success: true,
            data: {
                appPerformanceMatrix: performanceData,
                categoryAnalysis: categoryData,
                competitiveLandscape: competitiveData,
                strategicRecommendations: {
                    starProducts: performanceData.filter(a => a.PORTFOLIO_POSITION === 'Star Product'),
                    cashCows: performanceData.filter(a => a.PORTFOLIO_POSITION === 'Cash Cow'),
                    risingStars: performanceData.filter(a => a.PORTFOLIO_POSITION === 'Rising Star'),
                    emergingCategories: categoryData.filter(c => c.CATEGORY_MATURITY === 'Emerging Category'),
                    underperformers: performanceData.filter(a => a.GROWTH_RATE < 20 && a.MONTHLY_REVENUE < 100000)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading product intelligence:', error);
        res.status(500).json({ error: 'Failed to load product intelligence data' });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Strategic Revenue Analytics & Forecasting API
app.get('/api/revenue-intelligence', async (req, res) => {
    let connection;
    try {
        console.log('💰 [REVENUE INTEL] Starting revenue intelligence analysis...');
        connection = await connectToSnowflake('default');
        
        // Monthly Revenue Trends with Growth Analysis
        const revenueTrendsQuery = `
            SELECT 
                DATE_TRUNC('month', rt.transaction_date) as month,
                SUM(rt.amount) as monthly_revenue,
                COUNT(DISTINCT rt.consumer_id) as active_customers,
                COUNT(rt.transaction_id) as transaction_count,
                AVG(rt.amount) as avg_transaction_value,
                -- Month-over-month growth
                LAG(SUM(rt.amount)) OVER (ORDER BY DATE_TRUNC('month', rt.transaction_date)) as prev_month_revenue,
                CASE 
                    WHEN LAG(SUM(rt.amount)) OVER (ORDER BY DATE_TRUNC('month', rt.transaction_date)) > 0 THEN
                        ROUND((SUM(rt.amount) / LAG(SUM(rt.amount)) OVER (ORDER BY DATE_TRUNC('month', rt.transaction_date)) - 1) * 100, 2)
                    ELSE NULL
                END as month_over_month_growth
            FROM REVENUE_TRANSACTIONS rt
            GROUP BY DATE_TRUNC('month', rt.transaction_date)
            ORDER BY month DESC
            LIMIT 12
        `;
        
        // Revenue by Customer Segment
        const segmentRevenueQuery = `
            SELECT 
                c.size as customer_segment,
                c.contract_type,
                SUM(rt.amount) as segment_revenue,
                COUNT(DISTINCT rt.consumer_id) as customers_in_segment,
                AVG(rt.amount) as avg_transaction_value,
                COUNT(rt.transaction_id) as total_transactions,
                -- Revenue concentration
                ROUND(SUM(rt.amount) / (SELECT SUM(amount) FROM REVENUE_TRANSACTIONS) * 100, 2) as revenue_share_percentage
            FROM REVENUE_TRANSACTIONS rt
            JOIN CONSUMERS c ON rt.consumer_id = c.consumer_id
            GROUP BY c.size, c.contract_type
            ORDER BY segment_revenue DESC
        `;
        
        // Provider Revenue Performance
        const providerRevenueQuery = `
            SELECT 
                p.name as provider_name,
                p.tier,
                SUM(rt.amount) as total_revenue,
                COUNT(DISTINCT rt.consumer_id) as unique_customers,
                COUNT(DISTINCT rt.app_id) as active_apps,
                AVG(rt.amount) as avg_transaction_value,
                -- Revenue efficiency
                ROUND(SUM(rt.amount) / COUNT(DISTINCT rt.app_id), 2) as revenue_per_app
            FROM REVENUE_TRANSACTIONS rt
            JOIN PROVIDERS p ON rt.provider_id = p.provider_id
            GROUP BY p.name, p.tier
            ORDER BY total_revenue DESC
            LIMIT 20
        `;
        
        const [trendsData, segmentData, providerData] = await Promise.all([
            executeQuery(connection, revenueTrendsQuery),
            executeQuery(connection, segmentRevenueQuery),
            executeQuery(connection, providerRevenueQuery)
        ]);
        
        console.log('✅ [REVENUE INTEL] Revenue intelligence analysis complete');
        res.json({
            success: true,
            data: {
                monthlyTrends: trendsData,
                segmentBreakdown: segmentData,
                providerPerformance: providerData,
                executiveSummary: {
                    totalRevenue: segmentData.reduce((sum, s) => sum + s.SEGMENT_REVENUE, 0),
                    growthRate: trendsData[0]?.MONTH_OVER_MONTH_GROWTH || 0,
                    topPerformingSegment: segmentData[0],
                    topProvider: providerData[0],
                    revenueAtRisk: segmentData.filter(s => s.CUSTOMER_SEGMENT === 'SMB').reduce((sum, s) => sum + s.SEGMENT_REVENUE, 0)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading revenue intelligence:', error);
        res.status(500).json({ error: 'Failed to load revenue intelligence data' });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Strategic Executive Tables API - Top Performers & Growth Analysis
app.get('/api/executive-tables', async (req, res) => {
    let connection;
    try {
        console.log('📋 [EXECUTIVE TABLES] Starting executive dashboard analysis...');
        connection = await connectToSnowflake('default');
        
        // Top Performing Providers (Revenue + Growth)
        const topProvidersQuery = `
            SELECT 
                p.name as provider_name,
                p.tier,
                p.country,
                p.industry,
                p.total_revenue,
                p.monthly_growth as growth_rate,
                p.avg_app_rating,
                p.app_count,
                -- Performance Score (simplified calculation)
                ROUND((p.total_revenue / 1000000) + (p.monthly_growth * 2) + (p.avg_app_rating * 10), 1) as performance_score,
                -- Strategic Category
                CASE 
                    WHEN p.total_revenue > 2000000 AND p.monthly_growth > 25 THEN 'Star Performer'
                    WHEN p.total_revenue > 1500000 THEN 'Market Leader' 
                    WHEN p.monthly_growth > 40 THEN 'High Growth'
                    ELSE 'Developing'
                END as category
            FROM PROVIDERS p
            WHERE p.status = 'Active'
            ORDER BY p.total_revenue DESC
            LIMIT 15
        `;
        
        // Top Customer Segments by Revenue & Potential
        const topCustomersQuery = `
            SELECT 
                c.name as customer_name,
                c.industry,
                c.size,
                c.country,
                c.installed_apps,
                c.total_spend,
                c.satisfaction_score,
                c.contract_type,
                -- Customer LTV calculation
                CASE 
                    WHEN c.size = 'Enterprise' THEN c.total_spend * 3.5
                    WHEN c.size = 'Mid-Market' THEN c.total_spend * 2.8
                    ELSE c.total_spend * 2.2
                END as estimated_ltv,
                -- Expansion potential
                ROUND((50 - c.installed_apps) * c.satisfaction_score / 10, 1) as expansion_score,
                -- Health status
                CASE 
                    WHEN c.satisfaction_score >= 9.0 THEN 'Champion'
                    WHEN c.satisfaction_score >= 8.5 THEN 'Healthy'
                    WHEN c.satisfaction_score >= 8.0 THEN 'Stable'
                    WHEN c.satisfaction_score >= 7.5 THEN 'At Risk'
                    ELSE 'Critical'
                END as health_status
            FROM CONSUMERS c
            WHERE c.status = 'Active'
            ORDER BY estimated_ltv DESC
            LIMIT 20
        `;
        
        // Revenue Performance by Month (Enhanced)
        const revenuePerformanceQuery = `
            SELECT 
                DATE_TRUNC('month', rt.transaction_date) as month,
                SUM(rt.amount) as monthly_revenue,
                COUNT(DISTINCT rt.consumer_id) as active_customers,
                COUNT(rt.transaction_id) as total_transactions,
                AVG(rt.amount) as avg_transaction_value,
                -- Customer segment breakdown
                SUM(CASE WHEN c.size = 'Enterprise' THEN rt.amount ELSE 0 END) as enterprise_revenue,
                SUM(CASE WHEN c.size = 'Mid-Market' THEN rt.amount ELSE 0 END) as midmarket_revenue,
                SUM(CASE WHEN c.size = 'SMB' THEN rt.amount ELSE 0 END) as smb_revenue,
                -- Growth calculation
                LAG(SUM(rt.amount)) OVER (ORDER BY DATE_TRUNC('month', rt.transaction_date)) as prev_month_revenue,
                CASE 
                    WHEN LAG(SUM(rt.amount)) OVER (ORDER BY DATE_TRUNC('month', rt.transaction_date)) > 0 THEN
                        ROUND((SUM(rt.amount) / LAG(SUM(rt.amount)) OVER (ORDER BY DATE_TRUNC('month', rt.transaction_date)) - 1) * 100, 2)
                    ELSE NULL
                END as month_over_month_growth
            FROM REVENUE_TRANSACTIONS rt
            LEFT JOIN CONSUMERS c ON rt.consumer_id = c.consumer_id
            GROUP BY DATE_TRUNC('month', rt.transaction_date)
            ORDER BY month DESC
            LIMIT 12
        `;
        
        // High-Growth Apps Analysis
        const topAppsQuery = `
            SELECT 
                na.name as app_name,
                na.provider_name,
                na.category,
                na.installations,
                na.monthly_revenue,
                na.growth_rate,
                na.rating,
                -- Market position
                CASE 
                    WHEN na.monthly_revenue > 500000 AND na.growth_rate > 25 THEN 'Star Product'
                    WHEN na.monthly_revenue > 300000 THEN 'Cash Cow'
                    WHEN na.growth_rate > 50 THEN 'Rising Star'  
                    ELSE 'Question Mark'
                END as market_position,
                -- Revenue per user
                ROUND(na.monthly_revenue / NULLIF(na.installations, 0), 2) as revenue_per_user,
                -- Market strength (simplified calculation)
                ROUND(na.rating * na.installations / 1000, 2) as market_strength_score
            FROM NATIVE_APPS na
            ORDER BY na.monthly_revenue DESC
            LIMIT 15
        `;
        
        // Industry Growth Analysis
        const industryGrowthQuery = `
            SELECT 
                p.industry,
                COUNT(p.provider_id) as provider_count,
                AVG(p.total_revenue) as avg_revenue_per_provider,
                AVG(p.monthly_growth) as avg_growth_rate,
                SUM(p.total_revenue) as total_industry_revenue,
                AVG(p.avg_app_rating) as avg_quality_score,
                -- Innovation index
                ROUND(AVG(p.monthly_growth) * AVG(p.avg_app_rating) / 10, 2) as innovation_index,
                -- Market opportunity
                CASE 
                    WHEN AVG(p.monthly_growth) > 40 THEN 'Explosive Growth'
                    WHEN AVG(p.monthly_growth) > 25 THEN 'High Growth'
                    WHEN AVG(p.monthly_growth) > 15 THEN 'Steady Growth'
                    ELSE 'Mature Market'
                END as market_opportunity
            FROM PROVIDERS p
            WHERE p.status = 'Active'
            GROUP BY p.industry
            ORDER BY innovation_index DESC
        `;
        
        const [topProviders, topCustomers, revenuePerformance, topApps, industryGrowth] = await Promise.all([
            executeQuery(connection, topProvidersQuery),
            executeQuery(connection, topCustomersQuery),
            executeQuery(connection, revenuePerformanceQuery),
            executeQuery(connection, topAppsQuery),
            executeQuery(connection, industryGrowthQuery)
        ]);
        
        console.log('✅ [EXECUTIVE TABLES] Executive analysis complete');
        res.json({
            success: true,
            data: {
                topProviders,
                topCustomers,
                revenuePerformance,
                topApps,
                industryGrowth,
                executiveSummary: {
                    totalProviders: topProviders.length,
                    totalCustomers: topCustomers.length,
                    starPerformers: topProviders.filter(p => p.CATEGORY === 'Star Performer').length,
                    championCustomers: topCustomers.filter(c => c.HEALTH_STATUS === 'Champion').length,
                    atRiskCustomers: topCustomers.filter(c => c.HEALTH_STATUS === 'At Risk' || c.HEALTH_STATUS === 'Critical').length,
                    highGrowthIndustries: industryGrowth.filter(i => i.MARKET_OPPORTUNITY === 'Explosive Growth' || i.MARKET_OPPORTUNITY === 'High Growth').length
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading executive tables:', error);
        res.status(500).json({ error: 'Failed to load executive dashboard data' });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const frontendDistPath = path.join(__dirname, 'build');
console.log(frontendDistPath);
// Serve static files from the React app build directory
app.use(express.static(frontendDistPath));

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
   // Don't serve index.html for API routes
   if (req.path.startsWith('/api')) {
     return res.status(404).json({ error: 'API endpoint not found' });
   }
   
   res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Health check: http://${HOST}:${PORT}/api/health`);
});