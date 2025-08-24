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
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      clientSessionKeepAlive: true,
    };
  }
}

async function connectToSnowflakeFromEnv() {
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
    return await connectToSnowflakeFromEnv();
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
  
  const isInContainer = fs.existsSync('/snowflake/session/token');
  if (isInContainer) {
    console.log('🐳 Running in SPCS container - OAuth authentication enabled');
  } else {
    console.log('🖥️  Running locally - config-based authentication');
  }
});