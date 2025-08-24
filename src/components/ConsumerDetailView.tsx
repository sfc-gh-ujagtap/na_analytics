import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Package, 
  DollarSign,
  Star,
  Calendar,
  Globe,
  Building,
  Activity,
  Users
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Consumer {
  id: string;
  name: string;
  industry: string;
  country: string;
  size: string;
  joinDate: string;
  totalSpend: number;
  monthlySpend: number;
  installedApps: number;
  averageUsage: number;
  satisfactionScore: number;
  status: string;
  contractType: string;
}

interface NativeApp {
  id: string;
  name: string;
  providerName: string;
  category: string;
  description: string;
  monthlyRevenue: number;
  rating: number;
  status: string;
  pricing: string;
}

interface SpendingData {
  date: string;
  amount: number;
  type: string;
  consumer: string;
}

interface ConsumerDetailViewProps {
  consumerId: string;
  onBack: () => void;
}

const ConsumerDetailView: React.FC<ConsumerDetailViewProps> = ({ consumerId, onBack }) => {
  const [consumer, setConsumer] = useState<Consumer | null>(null);
  const [installedApps, setInstalledApps] = useState<NativeApp[]>([]);
  const [spending, setSpending] = useState<SpendingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'spending' | 'usage'>('overview');

  useEffect(() => {
    fetchConsumerDetails();
  }, [consumerId]);

  const fetchConsumerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/consumer/${consumerId}`);
      const result = await response.json();

      if (result.success) {
        setConsumer(result.data.consumer);
        setInstalledApps(result.data.installedApps);
        setSpending(result.data.spending);
      } else {
        setError('Failed to fetch consumer details');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Consumer details error:', err);
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

  const getSizeBadgeColor = (size: string) => {
    switch (size) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800';
      case 'Mid-Market': return 'bg-blue-100 text-blue-800';
      case 'SMB': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800';
      case 'Churned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractBadgeColor = (contractType: string) => {
    switch (contractType) {
      case 'Annual': return 'bg-green-100 text-green-800';
      case 'Monthly': return 'bg-blue-100 text-blue-800';
      case 'Usage-Based': return 'bg-purple-100 text-purple-800';
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

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.5) return 'text-green-500';
    if (score >= 4.0) return 'text-blue-500';
    if (score >= 3.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Process spending data for charts
  const monthlySpendingData = spending.reduce((acc, s) => {
    const month = s.date.substring(0, 7);
    acc[month] = (acc[month] || 0) + s.amount;
    return acc;
  }, {} as Record<string, number>);

  const spendingChartData = Object.entries(monthlySpendingData).map(([month, amount]) => ({
    month,
    spending: amount
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Spending by category
  const spendingByCategory = installedApps.reduce((acc, app) => {
    const appSpending = spending
      .filter(s => s.consumerId === consumerId)
      .reduce((sum, s) => sum + s.amount, 0);
    
    acc[app.category] = (acc[app.category] || 0) + (appSpending / installedApps.length);
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(spendingByCategory).map(([category, amount]) => ({
    category,
    amount
  }));

  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-lg">Loading Consumer Details...</span>
      </div>
    );
  }

  if (error || !consumer) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="text-red-500 text-lg">{error || 'Consumer not found'}</div>
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
                <h1 className="text-3xl font-bold text-gray-900">{consumer.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSizeBadgeColor(consumer.size)}`}>
                  {consumer.size}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(consumer.status)}`}>
                  {consumer.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getContractBadgeColor(consumer.contractType)}`}>
                  {consumer.contractType}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  {consumer.industry}
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  {consumer.country}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined {formatDate(consumer.joinDate)}
                </div>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  {consumer.averageUsage.toFixed(1)}% avg usage
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(consumer.totalSpend)}
              </div>
              <div className="text-sm text-gray-500">Total Spend</div>
              <div className="flex items-center mt-2">
                <Star className={`h-4 w-4 mr-1 ${getSatisfactionColor(consumer.satisfactionScore)}`} />
                <span className={`text-sm font-medium ${getSatisfactionColor(consumer.satisfactionScore)}`}>
                  {consumer.satisfactionScore.toFixed(1)} satisfaction
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
            { key: 'apps', label: 'Installed Apps', icon: Package },
            { key: 'spending', label: 'Spending', icon: DollarSign },
            { key: 'usage', label: 'Usage Analytics', icon: Activity }
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
                  <p className="text-sm font-medium text-gray-600">Monthly Spend</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(consumer.monthlySpend)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Installed Apps</p>
                  <p className="text-2xl font-bold text-gray-900">{consumer.installedApps}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{consumer.averageUsage.toFixed(1)}%</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{consumer.satisfactionScore.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Spending Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Spending']} />
                  <Line 
                    type="monotone" 
                    dataKey="spending" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData.map((item, index) => ({
                      ...item,
                      fill: CHART_COLORS[index % CHART_COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="amount"
                    label={({ category, amount }) => `${category}: ${formatCurrency(amount)}`}
                  >
                    {categoryChartData.map((_, index) => (
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

      {/* Installed Apps Tab */}
      {activeTab === 'apps' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Installed Apps ({installedApps.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {installedApps.map((app) => (
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
                      <span>Provider: {app.providerName}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{app.rating.toFixed(1)} rating</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Tab */}
      {activeTab === 'spending' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Spending Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Spending</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="spending" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spending Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Total Lifetime Spend</span>
                  <span className="text-lg font-semibold text-gray-900">{formatCurrency(consumer.totalSpend)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Average Monthly Spend</span>
                  <span className="text-lg font-semibold text-gray-900">{formatCurrency(consumer.monthlySpend)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="text-lg font-semibold text-gray-900">{formatNumber(spending.length)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Contract Type</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getContractBadgeColor(consumer.contractType)}`}>
                    {consumer.contractType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions ({spending.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {spending.slice(0, 50).map((transaction, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{formatDate(transaction.date)}</div>
                    <div className="text-sm text-gray-500">{transaction.type}</div>
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

      {/* Usage Analytics Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Usage</h3>
                <div className="text-3xl font-bold text-blue-500">{consumer.averageUsage.toFixed(1)}%</div>
                <p className="text-sm text-gray-500 mt-2">Average across all apps</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfaction</h3>
                <div className={`text-3xl font-bold ${getSatisfactionColor(consumer.satisfactionScore)}`}>
                  {consumer.satisfactionScore.toFixed(1)}
                </div>
                <p className="text-sm text-gray-500 mt-2">Out of 5.0</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">App Adoption</h3>
                <div className="text-3xl font-bold text-green-500">{consumer.installedApps}</div>
                <p className="text-sm text-gray-500 mt-2">Apps currently installed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">High Engagement</h4>
                <p className="text-sm text-blue-700">
                  This consumer shows {consumer.averageUsage > 80 ? 'excellent' : consumer.averageUsage > 60 ? 'good' : 'moderate'} 
                  {' '}engagement with installed applications, indicating strong value realization.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Satisfaction Score</h4>
                <p className="text-sm text-green-700">
                  Customer satisfaction is {consumer.satisfactionScore > 4.5 ? 'exceptional' : consumer.satisfactionScore > 4.0 ? 'good' : 'needs attention'}, 
                  {' '}suggesting {consumer.satisfactionScore > 4.0 ? 'positive' : 'mixed'} experiences with current applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerDetailView;
