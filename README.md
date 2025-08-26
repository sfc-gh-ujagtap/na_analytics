# 📊 Native Apps Analytics Platform

A comprehensive business intelligence dashboard for Snowflake Native Apps marketplace analytics, featuring executive-level visualizations and strategic insights. Built with React + Express.js and deployable to Snowflake's Snowpark Container Services (SPCS).

## 🏗️ Architecture

This Native Apps Analytics Platform features:
- **Executive Dashboard** with multi-tab business intelligence interface
- **Enhanced Provider Analytics** with streamlined tables and actionable insights
- **Strategic APIs** for market intelligence, customer analytics, and revenue trends
- **Real-time Data** from comprehensive Snowflake Native Apps marketplace simulation
- **SPCS-Optimized** deployment with OAuth authentication and scalable architecture

### Key Features
- 📊 **Top Providers by Revenue** - Streamlined table without rating/category clutter
- 🏭 **Industry Performance Heatmap** - Market opportunities by sector  
- 🌍 **Geographic Revenue Distribution** - Regional market intelligence
- 🎯 **Multi-dimensional Sector Analysis** - Comprehensive industry insights
- 💰 **Multi-month Revenue Trends** - Historical transaction analysis

## 📁 Project Structure

```
na_analytics/
├── package.json                        # Dependencies and scripts
├── server.js                          # Express server with strategic APIs
├── tsconfig.json                      # TypeScript configuration  
├── Dockerfile                         # Multi-stage Docker build
├── setup.sh                          # Complete database setup orchestration
├── deploy.sh                         # End-to-end SPCS deployment
├── src/                               # React application source
│   ├── App.tsx                        # Main dashboard application
│   ├── index.tsx                      # React entry point
│   └── components/                    # Dashboard components
│       └── Dashboard.tsx              # Enhanced analytics dashboard
├── build/                             # Static dashboard files
│   ├── dashboard.html                 # Executive dashboard interface
│   └── chart.js                      # Local Chart.js for CSP compliance
├── public/                            # Static assets
├── scripts/                           # Database setup and data generation
│   ├── create_app_role.sql           # Application role creation
│   ├── setup_database.sql            # Schema and tables creation  
│   ├── insert_sample_data.sql        # Basic sample data
│   ├── expand_strategic_data.sql     # Scale to 50+ providers, 110+ apps
│   ├── quick_scale_fix.sql           # Customer scale adjustment
│   └── comprehensive_transactions.sql # Multi-month revenue generation
└── snowflake/                         # SPCS deployment files
    ├── deploy.sql                     # Service deployment with embedded spec
    ├── setup_image_repo.sql          # Container registry setup
    └── manage_service.sql             # Service management commands
```

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/sfc-gh-ujagtap/na_analytics
cd na_analytics
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Local Development

```bash
# Start Express server with analytics dashboard
node server.js

# Dashboard available at: http://localhost:3002
# API endpoints: http://localhost:3002/api/*
```

### 4. Database Setup (Required for Live Data)

```bash
# Complete database setup with comprehensive analytics data
./setup.sh

# Includes:
# - 75 Providers across multiple industries and tiers
# - 350+ Customers with realistic spend patterns  
# - 90+ Apps with varied categories and performance
# - 15,000+ Revenue transactions across multiple months
```

### 5. SPCS Deployment

```bash
# Single command deployment to Snowflake Container Services
./deploy.sh

# Check deployment status
snowsql -q "SELECT SYSTEM\$GET_SERVICE_STATUS('NATIVE_APPS_ANALYTICS_SERVICE');"
```

## 🔧 Configuration

### Environment Variables

The application automatically detects whether it's running in SPCS or locally:

**SPCS Container (automatic):**
- `SNOWFLAKE_DATABASE` - Database name (default: SPCS_APP_DB)  
- `SNOWFLAKE_SCHEMA` - Schema name (default: APP_SCHEMA)
- `SNOWFLAKE_WAREHOUSE` - Warehouse (default: COMPUTE_WH)
- `SNOWFLAKE_ROLE` - Role (default: APP_SPCS_ROLE)

**Local Development:**
- Uses `~/.snowsql/config` or environment variables
- Falls back to mock data if database unavailable

### Updating Configuration

1. **Database/Schema names**: Update in `scripts/setup_database.sql` and `snowflake/deploy.sql`
2. **Application name**: Update in `package.json` and `deploy.sh`
3. **Container image**: Update in `snowflake/deploy.sql`

## 🚀 SPCS Deployment

### Prerequisites

1. **Snowflake CLI tools** configured:
   ```bash
   snowsql -q "SELECT CURRENT_ACCOUNT();"
   snow sql -q "SELECT CURRENT_ACCOUNT();"
   ```

2. **Docker** installed and running

### Deployment Steps

```bash
# Single command deployment (handles everything):
./deploy.sh

# Or run setup and deployment separately:
./setup.sh        # Creates roles, database, sample data (fixes SPCS access issues)
# Then build and deploy separately if needed
```

### 🔧 SPCS Data Access Issues - FIXED!

The following critical issues have been resolved:
- ✅ **Role Assignment**: `NATIVE_APPS_ANALYTICS_ROLE` now properly granted to user
- ✅ **Database Ownership**: Database now owned by correct role, not ACCOUNTADMIN  
- ✅ **SPCS Account Config**: Added missing `SNOWFLAKE_ACCOUNT` environment variable
- ✅ **Setup Order**: Correct sequence ensures clean role-based ownership

### Legacy Manual Steps (if needed)

```bash
# 1. Create application role (run once per account)
snowsql -f scripts/create_app_role.sql

# 2. Setup database and schema
snowsql -f scripts/setup_database.sql  

# 3. Setup image repository
snowsql -f snowflake/setup_image_repo.sql

# 4. Build and upload container image
./deploy.sh

# 5. Deploy service
snowsql -f snowflake/deploy.sql

# 6. Check service status
snowsql -f snowflake/manage_service.sql
```

### Verification

```bash
# Check service status
snowsql -q "SELECT SYSTEM\$GET_SERVICE_STATUS('SPCS_APP_SERVICE');"

# View logs
snowsql -q "CALL SYSTEM\$GET_SERVICE_LOGS('SPCS_APP_SERVICE', '0');"

# Get service endpoints
snowsql -q "SHOW ENDPOINTS IN SERVICE SPCS_APP_SERVICE;"
```

## 🔧 Development

### Adding New API Endpoints

```javascript
// In server.js, add new endpoints following this pattern:
app.get('/api/your-endpoint', async (req, res) => {
    let connection;
    try {
        connection = await connectToSnowflake();
        const rows = await executeQuery(connection, 'YOUR QUERY HERE');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    } finally {
        if (connection) {
            connection.destroy(); // CRITICAL: Always cleanup
        }
    }
});
```

### Adding React Components

1. Create new components in `src/components/`
2. Import and use in `src/App.tsx`
3. Use TypeScript interfaces for type safety

### Database Changes

1. Update `scripts/setup_database.sql` with new tables/schemas
2. Update queries in `server.js`  
3. Redeploy with updated database setup

## 🐛 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check logs
snowsql -q "CALL SYSTEM\$GET_SERVICE_LOGS('SPCS_APP_SERVICE', '0');"

# Verify image exists
snowsql -q "SHOW IMAGES IN IMAGE REPOSITORY SPCS_APP_DB.IMAGE_SCHEMA.IMAGE_REPO;"
```

**CSS/JS not loading:**
- Ensure React build files are in `build/` directory
- Check Express static file serving: `app.use(express.static('build'))`

**Database connection issues:**
- Verify role permissions: `SHOW GRANTS TO ROLE APP_SPCS_ROLE;`
- Check warehouse access: `USE WAREHOUSE COMPUTE_WH;`

### Debug Commands

```bash
# Service status
SELECT SYSTEM$GET_SERVICE_STATUS('SPCS_APP_SERVICE');

# Service logs  
CALL SYSTEM$GET_SERVICE_LOGS('SPCS_APP_SERVICE', '0');

# Compute pool status
SHOW COMPUTE POOLS;

# Health check (once deployed)
# Access /api/health endpoint via service URL
```

## 🏆 Best Practices

1. **Always use the Sun Valley reference**: https://github.com/sfc-gh-ujagtap/sun_valley_spcs
2. **Per-request connections**: Create fresh Snowflake connections for each API call
3. **Consistent ports**: Use 3002 across all environments  
4. **Role consistency**: Use same role for service creation AND data access
5. **Mock data**: Implement fallbacks for local development
6. **Error handling**: Always include proper error boundaries and cleanup

## 📚 Resources

- [Sun Valley SPCS Reference](https://github.com/sfc-gh-ujagtap/sun_valley_spcs) - Proven implementation
- [Snowpark Container Services Documentation](https://docs.snowflake.com/en/developer-guide/snowpark-container-services)
- [React Documentation](https://reactjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)

## 📄 License

MIT License - Use this template freely for your SPCS applications.
