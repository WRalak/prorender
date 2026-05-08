import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { TrophyIcon, StarIcon, ChartBarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatCurrency } from '../../../utils/formatCurrency';

const AgentLeaderboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [metric, setMetric] = useState('revenue');

  const { data: leaderboardData, isLoading } = useQuery(
    ['agent-leaderboard', timeRange, metric],
    async () => {
      const response = await fetch(`/api/admin/reports/agent-leaderboard?timeRange=${timeRange}&metric=${metric}`);
      return response.json();
    }
  );

  const agents = leaderboardData?.agents || [];
  const stats = leaderboardData?.stats || {};

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  const metrics = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'properties', label: 'Properties Listed' },
    { value: 'applications', label: 'Applications Processed' },
    { value: 'leases', label: 'Leases Signed' },
    { value: 'rating', label: 'Average Rating' },
  ];

  const getMetricValue = (agent, metricType) => {
    switch (metricType) {
      case 'revenue':
        return formatCurrency(agent.revenue || 0);
      case 'properties':
        return agent.propertiesListed || 0;
      case 'applications':
        return agent.applicationsProcessed || 0;
      case 'leases':
        return agent.leasesSigned || 0;
      case 'rating':
        return agent.averageRating ? agent.averageRating.toFixed(1) : 'N/A';
      default:
        return 0;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <TrophyIcon className="h-6 w-6 text-gray-400" />;
      case 3:
        return <TrophyIcon className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-gray-100 text-gray-800';
      case 3:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading leaderboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agent Leaderboard</h1>
        <p className="mt-2 text-gray-600">
          Track agent performance and rankings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalAgents || 0}</div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue || 0)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProperties || 0}</div>
              <div className="text-sm text-gray-600">Properties Listed</div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.averageRating || 0}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {metrics.map((metricOption) => (
                  <option key={metricOption.value} value={metricOption.value}>
                    {metricOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Leaderboard */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Top Performing Agents</h3>
        </Card.Header>
        <Card.Body>
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <ChartBarIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-600">
                No agent performance data found for the selected criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent, index) => (
                <div
                  key={agent._id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                      {agent.profile?.avatar ? (
                        <img
                          src={agent.profile.avatar}
                          alt={agent.name?.first}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {agent.name?.first?.[0] || 'A'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {agent.name?.first} {agent.name?.last}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{agent.email}</span>
                        {agent.isTopAgent && (
                          <StatusBadge status="active" className="text-xs">
                            Top Agent
                          </StatusBadge>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(agent.averageRating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">
                            ({agent.reviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {getMetricValue(agent, metric)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {metrics.find((m) => m.value === metric)?.label}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">
                        {agent.propertiesListed || 0}
                      </div>
                      <div className="text-xs text-gray-500">Properties</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">
                        {agent.applicationsProcessed || 0}
                      </div>
                      <div className="text-xs text-gray-500">Applications</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">
                        {agent.leasesSigned || 0}
                      </div>
                      <div className="text-xs text-gray-500">Leases</div>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRankBadge(index + 1)}`}>
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Performance Trends */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Top Performers This Month</h4>
                <div className="space-y-2">
                  {agents.slice(0, 3).map((agent, index) => (
                    <div key={agent._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-900">
                          {agent.name?.first} {agent.name?.last}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {getMetricValue(agent, metric)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Most Improved</h4>
                <div className="space-y-2">
                  {agents
                    .filter(agent => agent.growth > 0)
                    .sort((a, b) => b.growth - a.growth)
                    .slice(0, 3)
                    .map((agent, index) => (
                      <div key={agent._id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {index + 1}.
                          </span>
                          <span className="text-sm text-gray-900">
                            {agent.name?.first} {agent.name?.last}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-green-600 mr-1">
                            +
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {agent.growth}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AgentLeaderboard;