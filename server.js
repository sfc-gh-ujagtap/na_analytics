const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const snowflake = require('snowflake-sdk');
const ini = require('ini');

const app = express();
const PORT = process.env.SERVER_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Snowflake configuration - dual authentication (SPCS + local)
function getSnowflakeConfig() {
    const isInContainer = fs.existsSync('/snowflake/session/token');
    
    if (isInContainer) {
        console.log('🐳 Running in SPCS container - using OAuth token');
        const account = process.env.SNOWFLAKE_ACCOUNT;
        return {
            account,
            username: process.env.SNOWFLAKE_USERNAME,
            role: process.env.SNOWFLAKE_ROLE,
            warehouse: process.env.SNOWFLAKE_WAREHOUSE,
            database: process.env.SNOWFLAKE_DATABASE,
            schema: process.env.SNOWFLAKE_SCHEMA,
            authenticator: 'OAUTH',
            token: fs.readFileSync('/snowflake/session/token', 'ascii'),
            accessUrl: `https://${account.toLowerCase().replace(/_/g, '-')}.snowflakecomputing.com`
        };
    } else {
        console.log('🖥️  Running locally - using config from ~/.snowsql/config');
        const configPath = path.join(process.env.HOME, '.snowsql', 'config');
        
        if (fs.existsSync(configPath)) {
            const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));
            const connections = config.connections || {};
            const connection = connections.default || {};
            
            return {
                account: connection.account || process.env.SNOWFLAKE_ACCOUNT,
                username: connection.user || connection.username || process.env.SNOWFLAKE_USERNAME,
                password: connection.password || process.env.SNOWFLAKE_PASSWORD,
                role: connection.role || process.env.SNOWFLAKE_ROLE,
                warehouse: connection.warehouse || process.env.SNOWFLAKE_WAREHOUSE,
                database: connection.database || process.env.SNOWFLAKE_DATABASE,
                schema: connection.schema || process.env.SNOWFLAKE_SCHEMA
            };
        } else {
            return {
                account: process.env.SNOWFLAKE_ACCOUNT,
                username: process.env.SNOWFLAKE_USERNAME,
                password: process.env.SNOWFLAKE_PASSWORD,
                role: process.env.SNOWFLAKE_ROLE,
                warehouse: process.env.SNOWFLAKE_WAREHOUSE,
                database: process.env.SNOWFLAKE_DATABASE,
                schema: process.env.SNOWFLAKE_SCHEMA
            };
        }
    }
}

// Create fresh connection for each request (prevents timeouts)
async function connectToSnowflake() {
    const config = getSnowflakeConfig();
    const connection = snowflake.createConnection(config);
    
    return new Promise((resolve, reject) => {
        connection.connect((err, conn) => {
            if (err) {
                reject(err);
            } else {
                resolve(conn);
            }
        });
    });
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
        connection = await connectToSnowflake();
        
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
        connection = await connectToSnowflake();
        
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
        connection = await connectToSnowflake();
        
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
        connection = await connectToSnowflake();
        
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
        console.log('💰 Loading revenue analytics from database...');
        connection = await connectToSnowflake();
        
        const revenueQuery = `
            SELECT DATE_TRUNC('month', transaction_date) as month, SUM(amount) as revenue
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.REVENUE_TRANSACTIONS
            WHERE transaction_date >= DATEADD(month, -12, CURRENT_DATE())
            GROUP BY DATE_TRUNC('month', transaction_date)
            ORDER BY month
        `;
        
        const revenueData = await executeQuery(connection, revenueQuery);
        
        const monthlyRevenue = revenueData.map(row => ({
            month: row.MONTH.toISOString().substring(0, 7), // YYYY-MM format
            revenue: row.REVENUE || 0
        }));
        
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// ✅ Sun Valley SPCS Pattern: Serve static files (OAuth allows this)
const frontendDistPath = path.join(__dirname, 'build');
console.log('📁 Static files path:', frontendDistPath);
app.use(express.static(frontendDistPath));

// ✅ Sun Valley SPCS Pattern: Catch-all handler for client-side routing
app.get('*', (req, res) => {
   // Don't serve index.html for API routes
   if (req.path.startsWith('/api')) {
     return res.status(404).json({ error: 'API endpoint not found' });
   }
   
   console.log(`📄 Serving React app for route: ${req.path}`);
   res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
    const isInContainer = fs.existsSync('/snowflake/session/token');
    
    if (isInContainer) {
        console.log(`🚀 Server running in SPCS container on port ${PORT}`);
        console.log('📊 App will be available via SPCS service endpoint');
    } else {
        console.log(`🚀 Server running locally on http://localhost:${PORT}`);
        console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    }
});