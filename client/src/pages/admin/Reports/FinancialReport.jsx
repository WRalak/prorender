import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, CurrencyDollarIcon, ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { formatCurrency } from '../../../utils/formatCurrency';

const FinancialReport = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('summary');

  const { data: reportData, isLoading } = useQuery(
    ['financial-report', timeRange, reportType],
    async () => {
      const response = await fetch(`/api/admin/reports/financial?timeRange=${timeRange}&type=${reportType}`);
      return response.json();
    }
  );

  const summary = reportData?.summary || {};
  const transactions = reportData?.transactions || [];
  const revenueBreakdown = reportData?.revenueBreakdown || {};

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  const reportTypes = [
    { value: 'summary', label: 'Summary' },
    { value: 'detailed', label: 'Detailed Transactions' },
    { value: 'revenue', label: 'Revenue Breakdown' },
  ];

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/reports/financial/export?timeRange=${timeRange}&type=${reportType}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading financial report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Report</h1>
          <p className="mt-2 text-gray-600">
            Track revenue, expenses, and financial performance
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Summary Report */}
      {reportType === 'summary' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(summary.totalRevenue || 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">+{summary.revenueGrowth || 0}%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(summary.totalExpenses || 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-red-600">+{summary.expensesGrowth || 0}%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Net Profit</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(summary.netProfit || 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600">+{summary.profitGrowth || 0}%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Leases</dt>
                      <dd className="text-lg font-medium text-gray-900">{summary.activeLeases || 0}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-purple-600">+{summary.newLeases || 0}</span>
                    <span className="text-gray-500 ml-1">new this period</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Revenue Breakdown</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {Object.entries(revenueBreakdown).map(([source, amount]) => (
                  <div key={source} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {source.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((amount / (summary.totalRevenue || 1)) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Detailed Transactions */}
      {reportType === 'detailed' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </Card.Header>
          <Card.Body>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'revenue'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'revenue' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Revenue Breakdown */}
      {reportType === 'revenue' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Revenue Analysis</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-6">
              {/* Revenue by Source */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Revenue by Source</h4>
                <div className="space-y-3">
                  {Object.entries(revenueBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([source, amount]) => (
                      <div key={source} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {source.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-900">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(amount / (summary.totalRevenue || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Revenue Trends */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Revenue Trends</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-md">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(summary.averageMonthlyRevenue || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Average Monthly</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-md">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(summary.bestMonthRevenue || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Best Month</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-md">
                    <div className="text-2xl font-bold text-purple-600">
                      {summary.revenuePerLease ? formatCurrency(summary.revenuePerLease) : '$0'}
                    </div>
                    <div className="text-sm text-gray-600">Per Lease</div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default FinancialReport;
