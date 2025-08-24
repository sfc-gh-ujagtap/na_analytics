import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  Download,
  Star,
  ExternalLink,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatDistance, parseISO } from 'date-fns';
import ProviderDetailView from './ProviderDetailView';
import ConsumerDetailView from './ConsumerDetailView';

interface DashboardData {
  totalRevenue: number;
  totalApps: number;
  totalProviders: number;
  totalConsumers: number;
  activeApps: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  growthRate: number;
  lastUpdated: string;
}

interface Provider {
  id: string;
  name: string;
  industry: string;
  tier: string;
  totalRevenue: number;
  monthlyGrowth: number;
  appCount: number;
  avgAppRating: number;
  status: string;
}

interface Consumer {
  id: string;
  name: string;
  industry: string;
  size: string;
  totalSpend: number;
  monthlySpend: number;
  installedApps: number;
  satisfactionScore: number;
  status: string;
}

interface NativeApp {
  id: string;
  name: string;
  providerName: string;
  category: string;
  monthlyRevenue: number;
  installations: number;
  rating: number;
  growthRate: number;
  status: string;
}

const BusinessDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [topProviders, setTopProviders] = useState<Provider[]>([]);
  const [topConsumers, setTopConsumers] = useState<Consumer[]>([]);
  const [topApps, setTopApps] = useState<NativeApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'providers' | 'consumers' | 'apps' | 'revenue' | 'pipeline'>('overview');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedConsumerId, setSelectedConsumerId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard overview
      const [overviewRes, providersRes, consumersRes, appsRes] = await Promise.all([
        fetch('/api/dashboard/overview'),
        fetch('/api/providers?limit=10'),
        fetch('/api/consumers?limit=10'),
        fetch('/api/apps?limit=10')
      ]);

      const overview = await overviewRes.json();
      const providers = await providersRes.json();
      const consumers = await consumersRes.json();
      const apps = await appsRes.json();

      if (overview.success) {
        setDashboardData(overview.data);
      }
      
      if (providers.success) {
        setTopProviders(providers.data);
      }
      
      if (consumers.success) {
        setTopConsumers(consumers.data);
      }
      
      if (apps.success) {
        setTopApps(apps.data);
      }

    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? 
      <ArrowUp className="h-4 w-4 text-green-500" /> : 
      <ArrowDown className="h-4 w-4 text-red-500" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const CHART_COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-lg">Loading Analytics Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  // Show detail views
  if (selectedProviderId) {
    return (
      <ProviderDetailView 
        providerId={selectedProviderId} 
        onBack={() => setSelectedProviderId(null)} 
      />
    );
  }

  if (selectedConsumerId) {
    return (
      <ConsumerDetailView 
        consumerId={selectedConsumerId} 
        onBack={() => setSelectedConsumerId(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Snowflake Native Apps Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Business Intelligence Dashboard for Native App Ecosystem
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg border">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'providers', label: 'Providers', icon: Users },
            { key: 'consumers', label: 'Consumers', icon: Target },
            { key: 'apps', label: 'Apps', icon: Package },
            { key: 'revenue', label: 'Revenue', icon: DollarSign },
            { key: 'pipeline', label: 'Pipeline', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Dashboard */}
      {activeView === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardData.totalRevenue)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {getGrowthIcon(dashboardData.growthRate)}
                <span className={`ml-1 text-sm font-medium ${getGrowthColor(dashboardData.growthRate)}`}>
                  {Math.abs(dashboardData.growthRate).toFixed(1)}%
                </span>
                <span className="ml-1 text-sm text-gray-500">vs last month</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Apps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(dashboardData.activeApps)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  {formatNumber(dashboardData.totalApps)} total apps
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Providers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(dashboardData.totalProviders)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Active providers</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Consumers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(dashboardData.totalConsumers)}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Active consumers</span>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <div className="text-sm text-gray-500">
                Last updated: {formatDistance(parseISO(dashboardData.lastUpdated), new Date(), { addSuffix: true })}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Providers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Providers</h3>
              <div className="space-y-4">
                {topProviders.slice(0, 5).map((provider, index) => (
                  <div 
                    key={provider.id} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedProviderId(provider.id)}
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                        <p className="text-xs text-gray-500">{provider.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(provider.totalRevenue)}
                        </p>
                        <div className="flex items-center">
                          {getGrowthIcon(provider.monthlyGrowth)}
                          <span className={`ml-1 text-xs ${getGrowthColor(provider.monthlyGrowth)}`}>
                            {provider.monthlyGrowth.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Consumers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Consumers</h3>
              <div className="space-y-4">
                {topConsumers.slice(0, 5).map((consumer, index) => (
                  <div 
                    key={consumer.id} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedConsumerId(consumer.id)}
                  >
                    <div className="flex items-center">
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{consumer.name}</p>
                        <p className="text-xs text-gray-500">{consumer.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(consumer.totalSpend)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {consumer.installedApps} apps
                        </p>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Apps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Apps</h3>
              <div className="space-y-4">
                {topApps.slice(0, 5).map((app, index) => (
                  <div key={app.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.name}</p>
                        <p className="text-xs text-gray-500">{app.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(app.monthlyRevenue)}
                      </p>
                      <div className="flex items-center">
                        <span className="text-xs text-yellow-500 mr-1">★</span>
                        <span className="text-xs text-gray-500">
                          {app.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* App Categories Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">App Categories Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topApps.reduce((acc, app) => {
                      const existing = acc.find(item => item.category === app.category);
                      if (existing) {
                        existing.count += 1;
                        existing.revenue += app.monthlyRevenue;
                      } else {
                        acc.push({
                          category: app.category,
                          count: 1,
                          revenue: app.monthlyRevenue
                        });
                      }
                      return acc;
                    }, [] as Array<{ category: string; count: number; revenue: number }>)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ category, revenue }) => `${category}: ${formatCurrency(revenue)}`}
                  >
                    {topApps.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Providers Tab */}
      {activeView === 'providers' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Providers ({topProviders.length})</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Tiers</option>
                  <option>Enterprise</option>
                  <option>Growth</option>
                  <option>Startup</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {topProviders.map((provider) => (
              <div 
                key={provider.id} 
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedProviderId(provider.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{provider.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        provider.tier === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                        provider.tier === 'Growth' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {provider.tier}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        provider.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600 mb-3">
                      <div>{provider.industry}</div>
                      <div>{provider.country}</div>
                      <div>{provider.appCount} apps</div>
                      <div>{formatNumber(provider.consumerCount)} consumers</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{provider.avgAppRating.toFixed(1)} avg rating</span>
                      </div>
                      <div>{provider.marketingQualifiedLeads} leads</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-6">
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(provider.totalRevenue)}
                      </div>
                      <div className="flex items-center mt-1">
                        {getGrowthIcon(provider.monthlyGrowth)}
                        <span className={`ml-1 text-sm font-medium ${getGrowthColor(provider.monthlyGrowth)}`}>
                          {provider.monthlyGrowth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consumers Tab */}
      {activeView === 'consumers' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Consumers ({topConsumers.length})</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search consumers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Sizes</option>
                  <option>Enterprise</option>
                  <option>Mid-Market</option>
                  <option>SMB</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {topConsumers.map((consumer) => (
              <div 
                key={consumer.id} 
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedConsumerId(consumer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{consumer.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consumer.size === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                        consumer.size === 'Mid-Market' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {consumer.size}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consumer.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        consumer.status === 'Churned' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {consumer.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consumer.contractType === 'Annual' ? 'bg-green-100 text-green-800' :
                        consumer.contractType === 'Monthly' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {consumer.contractType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600 mb-3">
                      <div>{consumer.industry}</div>
                      <div>{consumer.country}</div>
                      <div>{consumer.installedApps} apps</div>
                      <div>{consumer.averageUsage.toFixed(1)}% usage</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{consumer.satisfactionScore.toFixed(1)} satisfaction</span>
                      </div>
                      <div>{formatCurrency(consumer.monthlySpend)}/month</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-6">
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(consumer.totalSpend)}
                      </div>
                      <div className="text-sm text-gray-500">Total spend</div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apps Tab */}
      {activeView === 'apps' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Apps ({topApps.length})</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search apps..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Categories</option>
                  <option>Analytics</option>
                  <option>ML/AI</option>
                  <option>Security</option>
                  <option>Business Intelligence</option>
                  <option>Data Engineering</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {topApps.map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{app.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.pricing === 'Free' ? 'bg-green-100 text-green-800' :
                        app.pricing === 'Subscription' ? 'bg-blue-100 text-blue-800' :
                        app.pricing === 'Usage-Based' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {app.pricing}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {app.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'Published' ? 'bg-green-100 text-green-800' :
                        app.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      By {app.providerName}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600 mb-3">
                      <div>{formatNumber(app.installations)} installations</div>
                      <div>{formatNumber(app.activeUsers)} active users</div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{app.rating.toFixed(1)} ({app.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+{app.growthRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(app.monthlyRevenue)}
                    </div>
                    <div className="text-sm text-gray-500">Monthly revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeView === 'revenue' && dashboardData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
                <div className="text-3xl font-bold text-green-500">
                  {formatCurrency(dashboardData.totalRevenue)}
                </div>
                <div className="flex items-center justify-center mt-2">
                  {getGrowthIcon(dashboardData.growthRate)}
                  <span className={`ml-1 text-sm font-medium ${getGrowthColor(dashboardData.growthRate)}`}>
                    {dashboardData.growthRate.toFixed(1)}% vs last month
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Monthly Revenue</h3>
                <div className="text-3xl font-bold text-blue-500">
                  {formatCurrency(dashboardData.totalRevenue / 12)}
                </div>
                <p className="text-sm text-gray-500 mt-2">Based on 12 months</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Package className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue per App</h3>
                <div className="text-3xl font-bold text-purple-500">
                  {formatCurrency(dashboardData.totalRevenue / dashboardData.totalApps)}
                </div>
                <p className="text-sm text-gray-500 mt-2">Average across all apps</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown by Provider</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProviders.slice(0, 10).map(provider => ({
                  name: provider.name,
                  revenue: provider.totalRevenue
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeView === 'pipeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Opportunities</h3>
                <div className="text-3xl font-bold text-blue-500">247</div>
                <p className="text-sm text-gray-500 mt-2">Across all providers</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pipeline Value</h3>
                <div className="text-3xl font-bold text-green-500">{formatCurrency(15420000)}</div>
                <p className="text-sm text-gray-500 mt-2">Total potential value</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Target className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Rate</h3>
                <div className="text-3xl font-bold text-purple-500">24.3%</div>
                <p className="text-sm text-gray-500 mt-2">Lead to closed won</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Activity className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Deal Size</h3>
                <div className="text-3xl font-bold text-orange-500">{formatCurrency(62500)}</div>
                <p className="text-sm text-gray-500 mt-2">Per opportunity</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pipeline by Stage</h3>
            <div className="space-y-4">
              {[
                { stage: 'Lead', count: 89, value: 2240000, color: 'bg-gray-400' },
                { stage: 'Qualified', count: 67, value: 3350000, color: 'bg-blue-400' },
                { stage: 'Demo Scheduled', count: 42, value: 2630000, color: 'bg-yellow-400' },
                { stage: 'Proposal Sent', count: 28, value: 1750000, color: 'bg-orange-400' },
                { stage: 'Negotiation', count: 15, value: 937500, color: 'bg-purple-400' },
                { stage: 'Closed Won', count: 6, value: 375000, color: 'bg-green-400' }
              ].map((item) => (
                <div key={item.stage} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.stage}</h4>
                      <p className="text-sm text-gray-500">{item.count} opportunities</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(item.value)}</div>
                    <div className="text-sm text-gray-500">
                      {((item.value / 15420000) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
