import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Star,
  Clock,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  FileText,
  DollarSign,
  ChevronRight,
  Plus
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const StatCard = ({ icon: Icon, title, value, trend, color, loading }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
        ) : (
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        )}
        {trend && !loading && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const AgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/agent/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const performanceData = stats?.monthlyPerformance || [
    { month: 'Jan', views: 400, leads: 24, leases: 8 },
    { month: 'Feb', views: 300, leads: 19, leases: 6 },
    { month: 'Mar', views: 500, leads: 32, leases: 12 },
    { month: 'Apr', views: 800, leads: 45, leases: 18 },
    { month: 'May', views: 750, leads: 42, leases: 15 },
    { month: 'Jun', views: 900, leads: 58, leases: 22 }
  ];

  const leadSourceData = [
    { name: 'Direct Search', value: 45, color: '#3b82f6' },
    { name: 'Social Media', value: 25, color: '#8b5cf6' },
    { name: 'Referrals', value: 20, color: '#10b981' },
    { name: 'Email', value: 10, color: '#f59e0b' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your property performance overview.</p>
            </div>
            <Link
              to="/agent/properties/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats?.totalViews?.toLocaleString() || '0'}
            trend={12}
            color="blue"
            loading={loading}
          />
          <StatCard
            icon={MessageSquare}
            title="Messages"
            value={stats?.totalMessages || '0'}
            trend={8}
            color="green"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            title="Conversion Rate"
            value={`${stats?.conversionRate || '0'}%`}
            trend={5}
            color="purple"
            loading={loading}
          />
          <StatCard
            icon={Users}
            title="Occupancy Rate"
            value={`${stats?.occupancyRate || '0'}%`}
            trend={-2}
            color="orange"
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance Trend</h2>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>Last 6 Months</option>
                <option>Last 12 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    name="Leads"
                  />
                  <Line
                    type="monotone"
                    dataKey="leases"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Leases"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Lead Sources</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {leadSourceData.map((source) => (
                <div key={source.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="text-gray-700">{source.name}</span>
                  </div>
                  <span className="font-semibold">{source.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {loading ? (
                Array(3).fill().map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                stats?.recentActivities?.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${activity.color}-100`}>
                        {activity.icon === 'view' && <Eye className={`w-5 h-5 text-${activity.color}-600`} />}
                        {activity.icon === 'message' && <MessageSquare className={`w-5 h-5 text-${activity.color}-600`} />}
                        {activity.icon === 'lease' && <FileText className={`w-5 h-5 text-${activity.color}-600`} />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/agent/properties/new"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
              >
                Add Property
              </Link>
              <Link
                to="/agent/inbox"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition text-center"
              >
                View Messages
              </Link>
              <Link
                to="/agent/schedule"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition text-center"
              >
                Schedule Tour
              </Link>
              <Link
                to="/agent/reports"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition text-center"
              >
                Generate Report
              </Link>
            </div>
            
            {/* Tips Card */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-gray-700">
                Properties with professional photos get 3x more views. Upload high-quality images to boost engagement!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;