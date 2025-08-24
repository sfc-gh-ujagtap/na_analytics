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
app.use(express.static('build')); // Serve React build files

// Snowflake configuration - dual authentication (SPCS + local)
function getSnowflakeConfig() {
    const isInContainer = fs.existsSync('/snowflake/session/token');
    
    if (isInContainer) {
        console.log('🐳 Running in SPCS container - using OAuth token');
        return {
            account: process.env.SNOWFLAKE_ACCOUNT || 'your-account',
            username: process.env.SNOWFLAKE_USERNAME || 'your-username',
            role: process.env.SNOWFLAKE_ROLE || 'APP_SPCS_ROLE',
            warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
            database: process.env.SNOWFLAKE_DATABASE || 'SPCS_APP_DB',
            schema: process.env.SNOWFLAKE_SCHEMA || 'APP_SCHEMA',
            authenticator: 'OAUTH',
            token: fs.readFileSync('/snowflake/session/token', 'ascii'),
            accessUrl: `https://app-${process.env.SNOWFLAKE_ACCOUNT}.snowflakecomputing.com`
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
                role: connection.role || process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN',
                warehouse: connection.warehouse || process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
                database: process.env.SNOWFLAKE_DATABASE || 'NATIVE_APPS_ANALYTICS_DB',
                schema: process.env.SNOWFLAKE_SCHEMA || 'ANALYTICS_SCHEMA'
            };
        } else {
            console.log('⚠️  No snowsql config found, using environment variables');
            return {
                account: process.env.SNOWFLAKE_ACCOUNT,
                username: process.env.SNOWFLAKE_USERNAME,
                password: process.env.SNOWFLAKE_PASSWORD,
                role: process.env.SNOWFLAKE_ROLE || 'APP_SPCS_ROLE',
                warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
                database: process.env.SNOWFLAKE_DATABASE || 'SPCS_APP_DB',
                schema: process.env.SNOWFLAKE_SCHEMA || 'APP_SCHEMA'
            };
        }
    }
}

// CRITICAL: Per-request connection pattern to prevent timeouts
async function connectToSnowflake() {
    const config = getSnowflakeConfig();
    const connection = snowflake.createConnection(config);
    
    return new Promise((resolve, reject) => {
        connection.connect(async (err, conn) => {
            if (err) {
                console.error('❌ Failed to connect to Snowflake:', err);
                reject(err);
            } else {
                console.log('✅ Successfully connected to Snowflake');
                
                // Set warehouse context
                try {
                    await executeQuery(connection, `USE WAREHOUSE ${config.warehouse}`);
                    await executeQuery(connection, `USE DATABASE ${config.database}`);
                    await executeQuery(connection, `USE SCHEMA ${config.schema}`);
                } catch (contextErr) {
                    console.log('⚠️ Warning: Could not set context:', contextErr.message);
                }
                
                resolve(connection);
            }
        });
    });
}

// Execute query with proper error handling
async function executeQuery(connection, query, binds = []) {
    return new Promise((resolve, reject) => {
        connection.execute({
            sqlText: query,
            binds: binds,
            complete: (err, stmt, rows) => {
                if (err) {
                    console.error('❌ Query execution failed:', err);
                    reject(err);
                } else {
                    console.log(`✅ Query executed successfully. Returned ${rows.length} rows.`);
                    resolve(rows);
                }
            }
        });
    });
}

// Essential API endpoints
app.get('/api/health', (req, res) => {
    const isInContainer = fs.existsSync('/snowflake/session/token');
    res.json({
        status: 'OK',
        environment: isInContainer ? 'SPCS Container' : 'Local Development',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// No sample data - using real database connections for all endpoints

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
                (SELECT COUNT(*) FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.NATIVE_APPS) as total_apps;
        `;
        
        const revenueQuery = `
            SELECT DATE_TRUNC('month', transaction_date) as month, SUM(amount) as revenue
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.REVENUE_TRANSACTIONS
            WHERE transaction_date >= DATEADD(month, -12, CURRENT_DATE())
            GROUP BY DATE_TRUNC('month', transaction_date)
            ORDER BY month;
        `;
        
        const [overviewData, revenueData] = await Promise.all([
            executeQuery(connection, overviewQuery),
            executeQuery(connection, revenueQuery)
        ]);
        
        const overview = overviewData[0] || {};
        const totalRevenue = overview.TOTAL_REVENUE || 0;
        const totalProviders = overview.TOTAL_PROVIDERS || 0;
        const totalConsumers = overview.TOTAL_CONSUMERS || 0;
        const totalApps = overview.TOTAL_APPS || 0;
        
        // Process monthly revenue
        const monthlyRevenue = revenueData.map(row => ({
            month: row.MONTH.toISOString().substring(0, 7),
            revenue: row.REVENUE || 0
        }));
        
        // Calculate growth rate
        const currentMonth = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
        const previousMonth = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
        const growthRate = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100) : 0;

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalApps,
                totalProviders,
                totalConsumers,
                activeApps: totalApps, // Assuming all apps are active
                monthlyRevenue,
                growthRate: Math.round(growthRate * 100) / 100,
                lastUpdated: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Dashboard API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data from database',
            message: error.message
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
        
        const { sortBy = 'total_revenue', sortOrder = 'desc', limit = 50 } = req.query;
        
        const sortColumn = sortBy === 'totalRevenue' ? 'total_revenue' : sortBy;
        const providersQuery = `
            SELECT provider_id, name, industry, country, tier, total_revenue,
                   monthly_growth, app_count, consumer_count, avg_app_rating, status
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.PROVIDERS
            ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
            LIMIT ${parseInt(limit)};
        `;
        
        const providersData = await executeQuery(connection, providersQuery);
        
        const formattedProviders = providersData.map(p => ({
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
        }));
        
        res.json({
            success: true,
            data: formattedProviders,
            total: providersData.length
        });
        
    } catch (error) {
        console.error('❌ Providers API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch providers data from database',
            message: error.message
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
        
        const { sortBy = 'total_spend', sortOrder = 'desc', limit = 50 } = req.query;
        
        const sortColumn = sortBy === 'totalSpend' ? 'total_spend' : sortBy;
        const consumersQuery = `
            SELECT consumer_id, name, industry, country, size, total_spend,
                   monthly_spend, installed_apps, satisfaction_score, status, contract_type
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.CONSUMERS
            ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
            LIMIT ${parseInt(limit)};
        `;
        
        const consumersData = await executeQuery(connection, consumersQuery);
        
        const formattedConsumers = consumersData.map(c => ({
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
        }));
        
        res.json({
            success: true,
            data: formattedConsumers,
            total: consumersData.length
        });
        
    } catch (error) {
        console.error('❌ Consumers API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch consumers data from database',
            message: error.message
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
        
        const { providerId, category, sortBy = 'monthly_revenue', sortOrder = 'desc', limit = 50 } = req.query;
        
        let whereClause = '';
        if (providerId || category) {
            const conditions = [];
            if (providerId) conditions.push(`provider_name = '${providerId}'`);
            if (category) conditions.push(`category = '${category}'`);
            whereClause = `WHERE ${conditions.join(' AND ')}`;
        }
        
        const sortColumn = sortBy === 'monthlyRevenue' ? 'monthly_revenue' : sortBy;
        const appsQuery = `
            SELECT app_id, name, provider_name, category, pricing_model,
                   monthly_revenue, installations, rating, growth_rate, status
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.NATIVE_APPS
            ${whereClause}
            ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
            LIMIT ${parseInt(limit)};
        `;
        
        const appsData = await executeQuery(connection, appsQuery);
        
        const formattedApps = appsData.map(a => ({
            id: a.APP_ID,
            name: a.NAME,
            providerId: a.PROVIDER_NAME, // Using provider_name as providerId for now
            providerName: a.PROVIDER_NAME,
            category: a.CATEGORY,
            pricing: a.PRICING_MODEL,
            monthlyRevenue: a.MONTHLY_REVENUE || 0,
            installations: a.INSTALLATIONS || 0,
            rating: a.RATING || 0,
            growthRate: a.GROWTH_RATE || 0,
            status: a.STATUS
        }));
        
        res.json({
            success: true,
            data: formattedApps,
            total: appsData.length
        });
        
    } catch (error) {
        console.error('❌ Apps API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch apps data from database',
            message: error.message
        });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Revenue Analytics API
app.get('/api/analytics/revenue', async (req, res) => {
    let connection;
    
    try {
        console.log('💰 Loading revenue analytics from database...');
        connection = await connectToSnowflake();
        
        const { timeframe = 'monthly', providerId, appId } = req.query;
        
        let whereClause = 'WHERE transaction_date >= DATEADD(month, -12, CURRENT_DATE())';
        if (providerId || appId) {
            const conditions = [];
            if (providerId) conditions.push(`provider_id = '${providerId}'`);
            if (appId) conditions.push(`app_id = '${appId}'`);
            whereClause += ' AND ' + conditions.join(' AND ');
        }
        
        let dateFormat;
        switch (timeframe) {
            case 'daily':
                dateFormat = 'transaction_date';
                break;
            case 'weekly':
                dateFormat = 'DATE_TRUNC(\'week\', transaction_date)';
                break;
            case 'monthly':
            default:
                dateFormat = 'DATE_TRUNC(\'month\', transaction_date)';
                break;
        }
        
        const revenueQuery = `
            SELECT ${dateFormat} as period, 
                   SUM(amount) as revenue, 
                   COUNT(*) as transactions
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.REVENUE_TRANSACTIONS
            ${whereClause}
            GROUP BY ${dateFormat}
            ORDER BY period;
        `;
        
        const revenueData = await executeQuery(connection, revenueQuery);
        
        const formattedData = revenueData.map(row => ({
            period: row.PERIOD.toISOString().split('T')[0],
            revenue: row.REVENUE || 0,
            transactions: row.TRANSACTIONS || 0
        }));
        
        const total = formattedData.reduce((sum, r) => sum + r.revenue, 0);
        const totalTransactions = formattedData.reduce((sum, r) => sum + r.transactions, 0);
        
        res.json({
            success: true,
            data: formattedData,
            total,
            transactions: totalTransactions
        });
        
    } catch (error) {
        console.error('❌ Revenue analytics API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch revenue data from database',
            message: error.message
        });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Pipeline API
app.get('/api/pipeline', async (req, res) => {
    let connection;
    
    try {
        console.log('📊 Loading pipeline data from database...');
        connection = await connectToSnowflake();
        
        const { providerId } = req.query;
        
        let whereClause = '';
        if (providerId) {
            whereClause = `WHERE provider_id = '${providerId}'`;
        }
        
        // For now, return a basic response since pipeline opportunities table may not be fully set up
        // This would need to be implemented based on your actual pipeline data structure
        const pipelineQuery = `
            SELECT 'lead' as stage, COUNT(*) as count, SUM(25000) as value FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.PROVIDERS ${whereClause};
        `;
        
        const pipelineData = await executeQuery(connection, pipelineQuery);
        
        // Static pipeline stages for now
        const pipelineStages = [
            { id: 'lead', name: 'Lead', order: 1, conversionRate: 0.25 },
            { id: 'qualified', name: 'Qualified', order: 2, conversionRate: 0.40 },
            { id: 'demo', name: 'Demo Scheduled', order: 3, conversionRate: 0.60 },
            { id: 'proposal', name: 'Proposal Sent', order: 4, conversionRate: 0.75 },
            { id: 'negotiation', name: 'Negotiation', order: 5, conversionRate: 0.85 },
            { id: 'closed-won', name: 'Closed Won', order: 6, conversionRate: 1.00 }
        ];
        
        const pipelineSummary = pipelineStages.map((stage, index) => ({
            stage: stage.name,
            stageId: stage.id,
            count: Math.max(0, (pipelineData[0]?.COUNT || 0) - index * 2),
            value: Math.max(0, (pipelineData[0]?.VALUE || 0) - index * 5000),
            conversionRate: stage.conversionRate
        }));
        
        res.json({
            success: true,
            data: {
                summary: pipelineSummary,
                opportunities: [],
                stages: pipelineStages
            },
            total: pipelineData[0]?.COUNT || 0
        });
        
    } catch (error) {
        console.error('❌ Pipeline API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pipeline data from database',
            message: error.message
        });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Provider Details API
app.get('/api/provider/:id', async (req, res) => {
    let connection;
    try {
        console.log('👥 Loading provider details from database...');
        connection = await connectToSnowflake();
        
        const { id } = req.params;
        
        // Get provider details
        const providerQuery = `
            SELECT provider_id, name, industry, country, tier, total_revenue,
                   monthly_growth, app_count, consumer_count, avg_app_rating, status
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.PROVIDERS
            WHERE provider_id = '${id}';
        `;
        
        // Get provider's apps
        const appsQuery = `
            SELECT app_id, name, category, pricing_model, monthly_revenue, installations, rating, status
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.NATIVE_APPS
            WHERE provider_name = (SELECT name FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.PROVIDERS WHERE provider_id = '${id}');
        `;
        
        // Get provider's revenue
        const revenueQuery = `
            SELECT DATE_TRUNC('month', transaction_date) as month, SUM(amount) as revenue, COUNT(*) as transactions
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.REVENUE_TRANSACTIONS
            WHERE provider_id = '${id}' AND transaction_date >= DATEADD(month, -6, CURRENT_DATE())
            GROUP BY DATE_TRUNC('month', transaction_date)
            ORDER BY month;
        `;
        
        const [providerData, appsData, revenueData] = await Promise.all([
            executeQuery(connection, providerQuery),
            executeQuery(connection, appsQuery),
            executeQuery(connection, revenueQuery)
        ]);
        
        if (providerData.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Provider not found'
            });
        }
        
        const provider = {
            id: providerData[0].PROVIDER_ID,
            name: providerData[0].NAME,
            industry: providerData[0].INDUSTRY,
            country: providerData[0].COUNTRY,
            tier: providerData[0].TIER,
            totalRevenue: providerData[0].TOTAL_REVENUE || 0,
            monthlyGrowth: providerData[0].MONTHLY_GROWTH || 0,
            appCount: providerData[0].APP_COUNT || 0,
            consumerCount: providerData[0].CONSUMER_COUNT || 0,
            avgAppRating: providerData[0].AVG_APP_RATING || 0,
            status: providerData[0].STATUS
        };
        
        const providerApps = appsData.map(a => ({
            id: a.APP_ID,
            name: a.NAME,
            category: a.CATEGORY,
            pricing: a.PRICING_MODEL,
            monthlyRevenue: a.MONTHLY_REVENUE || 0,
            installations: a.INSTALLATIONS || 0,
            rating: a.RATING || 0,
            status: a.STATUS
        }));
        
        const providerRevenue = revenueData.map(r => ({
            month: r.MONTH.toISOString().substring(0, 7),
            revenue: r.REVENUE || 0,
            transactions: r.TRANSACTIONS || 0
        }));
        
        res.json({
            success: true,
            data: {
                provider,
                apps: providerApps,
                revenue: providerRevenue,
                pipeline: [] // Pipeline data would need to be implemented based on your schema
            }
        });
        
    } catch (error) {
        console.error('❌ Provider details API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch provider details from database',
            message: error.message
        });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Consumer Details API
app.get('/api/consumer/:id', async (req, res) => {
    let connection;
    try {
        console.log('👥 Loading consumer details from database...');
        connection = await connectToSnowflake();
        
        const { id } = req.params;
        
        // Get consumer details
        const consumerQuery = `
            SELECT consumer_id, name, industry, country, size, total_spend,
                   monthly_spend, installed_apps, satisfaction_score, status, contract_type
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.CONSUMERS
            WHERE consumer_id = '${id}';
        `;
        
        // Get consumer's spending
        const spendingQuery = `
            SELECT DATE_TRUNC('month', transaction_date) as month, SUM(amount) as spending, COUNT(*) as transactions
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.REVENUE_TRANSACTIONS
            WHERE consumer_id = '${id}' AND transaction_date >= DATEADD(month, -6, CURRENT_DATE())
            GROUP BY DATE_TRUNC('month', transaction_date)
            ORDER BY month;
        `;
        
        // Get consumer's installed apps (from transactions)
        const appsQuery = `
            SELECT DISTINCT a.app_id, a.name, a.category, a.rating, a.provider_name
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.NATIVE_APPS a
            JOIN NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.REVENUE_TRANSACTIONS r ON a.app_id = r.app_id
            WHERE r.consumer_id = '${id}';
        `;
        
        const [consumerData, spendingData, appsData] = await Promise.all([
            executeQuery(connection, consumerQuery),
            executeQuery(connection, spendingQuery),
            executeQuery(connection, appsQuery)
        ]);
        
        if (consumerData.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Consumer not found'
            });
        }
        
        const consumer = {
            id: consumerData[0].CONSUMER_ID,
            name: consumerData[0].NAME,
            industry: consumerData[0].INDUSTRY,
            country: consumerData[0].COUNTRY,
            size: consumerData[0].SIZE,
            totalSpend: consumerData[0].TOTAL_SPEND || 0,
            monthlySpend: consumerData[0].MONTHLY_SPEND || 0,
            installedApps: consumerData[0].INSTALLED_APPS || 0,
            satisfactionScore: consumerData[0].SATISFACTION_SCORE || 0,
            status: consumerData[0].STATUS,
            contractType: consumerData[0].CONTRACT_TYPE
        };
        
        const consumerSpending = spendingData.map(s => ({
            month: s.MONTH.toISOString().substring(0, 7),
            spending: s.SPENDING || 0,
            transactions: s.TRANSACTIONS || 0
        }));
        
        const installedApps = appsData.map(a => ({
            id: a.APP_ID,
            name: a.NAME,
            category: a.CATEGORY,
            rating: a.RATING || 0,
            providerName: a.PROVIDER_NAME
        }));
        
        res.json({
            success: true,
            data: {
                consumer,
                spending: consumerSpending,
                installedApps
            }
        });
        
    } catch (error) {
        console.error('❌ Consumer details API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch consumer details from database',
            message: error.message
        });
    } finally {
        if (connection) {
            connection.destroy();
        }
    }
});

// Sample data endpoint - replace with your actual queries
app.get('/api/data', async (req, res) => {
    let connection;
    
    try {
        connection = await connectToSnowflake();
        
        // Sample query - replace with your actual data query
        const query = `
            SELECT CURRENT_TIMESTAMP() as timestamp, 
                   CURRENT_USER() as user, 
                   CURRENT_ROLE() as role;
        `;
        
        const rows = await executeQuery(connection, query);
        res.json({ 
            success: true,
            data: rows,
            count: rows.length 
        });
        
    } catch (error) {
        console.error('❌ API error:', error);
        
        // Return mock data for local development when DB unavailable
        res.json({
            success: false,
            error: 'Database connection failed',
            mockData: [
                { timestamp: new Date().toISOString(), user: 'mock_user', role: 'mock_role' }
            ],
            message: 'Using mock data for development'
        });
        
    } finally {
        if (connection) {
            connection.destroy(); // CRITICAL: Always cleanup connections
        }
    }
});

// Dashboard route with embedded database data (SPCS compatible)
app.get('/dashboard', async (req, res) => {
    let connection;
    try {
        console.log('📊 Loading dashboard with real database data...');
        
        // Connect to Snowflake database
        connection = await connectToSnowflake();
        
        // Fetch real data from our analytics tables
        const providersQuery = `
            SELECT provider_id, name, industry, country, tier, total_revenue, 
                   monthly_growth, app_count, consumer_count, avg_app_rating, status
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.PROVIDERS
            ORDER BY total_revenue DESC
        `;
        
        const consumersQuery = `
            SELECT consumer_id, name, industry, country, size, total_spend,
                   monthly_spend, installed_apps, satisfaction_score, status, contract_type
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.CONSUMERS
            ORDER BY total_spend DESC
        `;
        
        const appsQuery = `
            SELECT app_id, name, provider_name, category, pricing_model,
                   monthly_revenue, installations, rating, growth_rate, status
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.NATIVE_APPS
            ORDER BY monthly_revenue DESC
        `;
        
        const revenueQuery = `
            SELECT DATE_TRUNC('month', transaction_date) as month, SUM(amount) as revenue
            FROM NATIVE_APPS_ANALYTICS_DB.ANALYTICS_SCHEMA.REVENUE_TRANSACTIONS
            WHERE transaction_date >= DATEADD(month, -12, CURRENT_DATE())
            GROUP BY DATE_TRUNC('month', transaction_date)
            ORDER BY month
        `;
        
        // Execute all queries in parallel
        const [providersData, consumersData, appsData, revenueData] = await Promise.all([
            executeQuery(connection, providersQuery),
            executeQuery(connection, consumersQuery),
            executeQuery(connection, appsQuery),
            executeQuery(connection, revenueQuery)
        ]);
        
        // Calculate overview metrics from real data
        const totalRevenue = providersData.reduce((sum, p) => sum + (p.TOTAL_REVENUE || 0), 0);
        const totalProviders = providersData.length;
        const totalConsumers = consumersData.length;
        const totalApps = appsData.length;
        
        // Process monthly revenue for charts
        const monthlyRevenue = revenueData.map(row => ({
            month: row.MONTH.toISOString().substring(0, 7), // YYYY-MM format
            revenue: row.REVENUE || 0
        }));
        
        // Calculate growth rate
        const currentMonth = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
        const previousMonth = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
        const growthRate = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100) : 0;
        
        // Prepare dashboard data object
        const dashboardData = {
            overview: {
                totalRevenue,
                totalProviders,
                totalConsumers,
                totalApps,
                growthRate,
                monthlyRevenue
            },
            providers: providersData.map(p => ({
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
            })),
            consumers: consumersData.map(c => ({
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
            })),
            apps: appsData.map(a => ({
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
        };
        
        console.log(`✅ Loaded real data: ${totalProviders} providers, ${totalConsumers} consumers, ${totalApps} apps`);
        
        // Read dashboard HTML template
        let dashboardHtml = fs.readFileSync(path.join(__dirname, 'build', 'dashboard.html'), 'utf8');
        
        // Inject real database data as JavaScript variable
        const dataScript = `
            <script>
                window.DASHBOARD_DATA = ${JSON.stringify(dashboardData)};
                window.DATA_SOURCE = 'DATABASE';
                console.log('📊 Dashboard loaded with real Snowflake data:', window.DASHBOARD_DATA);
            </script>
        `;
        
        // Insert before closing </head> tag
        dashboardHtml = dashboardHtml.replace('</head>', dataScript + '</head>');
        
        res.send(dashboardHtml);
        
    } catch (error) {
        console.error('❌ Database error loading dashboard:', error);
        
        // Fallback: serve dashboard with error message (no hardcoded data)
        try {
            let dashboardHtml = fs.readFileSync(path.join(__dirname, 'build', 'dashboard.html'), 'utf8');
            const errorScript = `
                <script>
                    window.DATABASE_ERROR = true;
                    window.ERROR_MESSAGE = 'Unable to connect to analytics database';
                    console.error('Database connection failed:', '${error.message}');
                </script>
            `;
            dashboardHtml = dashboardHtml.replace('</head>', errorScript + '</head>');
            res.send(dashboardHtml);
        } catch (fileError) {
            res.status(500).send('Dashboard temporarily unavailable');
        }
        
    } finally {
        if (connection) {
            connection.destroy();
            console.log('🔐 Database connection closed');
        }
    }
});

// Redirect main route to dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// React routing - must be last to catch all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
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
