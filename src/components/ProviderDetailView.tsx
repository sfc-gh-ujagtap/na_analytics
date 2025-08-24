import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Star,
  Calendar,
  Globe,
  Mail,
  Building
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Provider {
  id: string;
  name: string;
  industry: string;
  country: string;
  tier: string;
  joinDate: string;
  totalRevenue: number;
  monthlyGrowth: number;
  appCount: number;
  consumerCount: number;
  avgAppRating: number;
  status: string;
  contactEmail: string;
  marketingQualifiedLeads: number;
}

interface NativeApp {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  status: string;
  pricing: string;
  monthlyRevenue: number;
  installations: number;
  activeUsers: number;
  rating: number;
  reviews: number;
  growthRate: number;
}

interface Revenue {
  date: string;
  amount: number;
  type: string;
  consumer: string;
}

interface PipelineOpportunity {
  id: string;
  consumerName: string;
  stage: string;
  value: number;
  probability: number;
  createdDate: string;
  expectedCloseDate: string;
  source: string;
}

interface ProviderDetailViewProps {
  providerId: string;
  onBack: () => void;
}

const ProviderDetailView: React.FC<ProviderDetailViewProps> = ({ providerId, onBack }) => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [apps, setApps] = useState<NativeApp[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [pipeline, setPipeline] = useState<PipelineOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'revenue' | 'pipeline'>('overview');

  useEffect(() => {
    fetchProviderDetails();
  }, [providerId]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/provider/${providerId}`);
      const result = await response.json();

      if (result.success) {
        setProvider(result.data.provider);
        setApps(result.data.apps);
        setRevenue(result.data.revenue);
        setPipeline(result.data.pipeline);
      } else {
        setError('Failed to fetch provider details');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Provider details error:', err);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Growth': return 'bg-blue-100 text-blue-800';
      case 'Startup': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPricingBadgeColor = (pricing: string) => {
    switch (pricing) {
      case 'Free': return 'bg-green-100 text-green-800';
      case 'Subscription': return 'bg-blue-100 text-blue-800';
      case 'Usage-Based': return 'bg-purple-100 text-purple-800';
      case 'One-Time': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Process revenue data for charts
  const monthlyRevenueData = revenue.reduce((acc, r) => {
    const month = r.date.substring(0, 7);
    acc[month] = (acc[month] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueChartData = Object.entries(monthlyRevenueData).map(([month, amount]) => ({
    month,
    revenue: amount
  })).sort((a, b) => a.month.localeCompare(b.month));

  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-lg">Loading Provider Details...</span>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="text-red-500 text-lg">{error || 'Provider not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(provider.tier)}`}>
                  {provider.tier}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(provider.status)}`}>
                  {provider.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  {provider.industry}
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  {provider.country}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined {formatDate(provider.joinDate)}
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {provider.contactEmail}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(provider.totalRevenue)}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm font-medium">
                  +{provider.monthlyGrowth.toFixed(1)}% growth
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white p-1 rounded-lg border">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'apps', label: 'Apps', icon: Package },
            { key: 'revenue', label: 'Revenue', icon: DollarSign },
            { key: 'pipeline', label: 'Pipeline', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Apps Published</p>
                  <p className="text-2xl font-bold text-gray-900">{provider.appCount}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Consumers</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(provider.consumerCount)}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg App Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{provider.avgAppRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{provider.marketingQualifiedLeads}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Apps Tab */}
      {activeTab === 'apps' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Published Apps ({apps.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {apps.map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{app.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPricingBadgeColor(app.pricing)}`}>
                        {app.pricing}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {app.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Version {app.version}</span>
                      <span>{formatNumber(app.installations)} installations</span>
                      <span>{formatNumber(app.activeUsers)} active users</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{app.rating.toFixed(1)} ({app.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(app.monthlyRevenue)}
                    </div>
                    <div className="text-sm text-gray-500">monthly</div>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500 text-xs">+{app.growthRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by App */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by App</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={apps.map(app => ({ name: app.name, revenue: app.monthlyRevenue }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={apps.map((app, index) => ({
                        name: app.name,
                        value: app.monthlyRevenue,
                        fill: CHART_COLORS[index % CHART_COLORS.length]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {apps.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Revenue ({revenue.length} transactions)</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {revenue.slice(0, 50).map((transaction, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{transaction.consumer}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.date)} • {transaction.type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline ({pipeline.length} opportunities)</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pipeline.map((opportunity) => (
              <div key={opportunity.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{opportunity.consumerName}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Stage: {opportunity.stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span>Source: {opportunity.source}</span>
                      <span>Created: {formatDate(opportunity.createdDate)}</span>
                      <span>Expected Close: {formatDate(opportunity.expectedCloseDate)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(opportunity.value)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(opportunity.probability * 100).toFixed(0)}% probability
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetailView;
