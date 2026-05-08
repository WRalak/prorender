import React from 'react';
import { useQuery } from 'react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceChart = ({ timeRange = 'month', metric = 'revenue' }) => {
  const { data: performanceData, isLoading } = useQuery(
    ['performance-chart', timeRange, metric],
    async () => {
      const response = await fetch(`/api/admin/reports/performance-chart?timeRange=${timeRange}&metric=${metric}`);
      return response.json();
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = {
    labels: performanceData?.labels || [],
    datasets: [
      {
        label: metric === 'revenue' ? 'Revenue' : metric === 'applications' ? 'Applications' : metric === 'users' ? 'Users' : 'Properties',
        data: performanceData?.data || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'rgb(59, 130, 246)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: metric === 'revenue' ? 'Target' : metric === 'applications' ? 'Target' : metric === 'users' ? 'Target' : 'Target',
        data: performanceData?.target || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'rgb(239, 68, 68)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (metric === 'revenue') {
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y.toLocaleString();
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            if (metric === 'revenue') {
              return '$' + value.toLocaleString();
            }
            return value.toLocaleString();
          },
        },
      },
    },
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'revenue':
        return 'Revenue Performance';
      case 'applications':
        return 'Application Performance';
      case 'users':
        return 'User Engagement';
      case 'properties':
        return 'Property Performance';
      default:
        return 'Performance Metrics';
    }
  };

  const getMetricDescription = () => {
    switch (metric) {
      case 'revenue':
        'Track revenue growth against targets';
      case 'applications':
        'Monitor application volume and conversion rates';
      case 'users':
        'Measure user engagement and retention';
      case 'properties':
        'Analyze property performance metrics';
      default:
        'View performance trends over time';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {getMetricLabel()}
        </h3>
        <p className="text-sm text-gray-600">
          {getMetricDescription()}
        </p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-md">
          <div className="text-2xl font-bold text-blue-600">
            {performanceData?.current || 0}
          </div>
          <div className="text-sm text-gray-600">Current Period</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-md">
          <div className="text-2xl font-bold text-green-600">
            {performanceData?.previous || 0}
          </div>
          <div className="text-sm text-gray-600">Previous Period</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-md">
          <div className="text-2xl font-bold text-purple-600">
            {performanceData?.growth || 0}%
          </div>
          <div className="text-sm text-gray-600">Growth Rate</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;