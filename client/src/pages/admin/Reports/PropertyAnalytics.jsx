import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { BuildingOfficeIcon, ChartBarIcon, TrendingUpIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/common/StatusBadge';

const PropertyAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [viewType, setViewType] = useState('overview');

  const { data: analyticsData, isLoading } = useQuery(
    ['property-analytics', timeRange, viewType],
    async () => {
      const response = await fetch(`/api/admin/reports/property-analytics?timeRange=${timeRange}&view=${viewType}`);
      return response.json();
    }
  );

  const overview = analyticsData?.overview || {};
  const properties = analyticsData?.properties || [];
  const trends = analyticsData?.trends || {};

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  const viewTypes = [
    { value: 'overview', label: 'Overview' },
    { value: 'performance', label: 'Performance' },
    { value: 'locations', label: 'Locations' },
    { value: 'trends', label: 'Trends' },
  ];

  if (isLoading) {
    return <LoadingSpinner size="large" text="Loading property analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Analytics</h1>
        <p className="mt-2 text-gray-600">
          Analyze property performance and market trends
        </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">View Type</label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {viewTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Overview View */}
      {viewType === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
                      <dd className="text-lg font-medium text-gray-900">{overview.totalProperties || 0}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-green-600">+{overview.newProperties || 0}</span>
                    <span className="text-gray-500 ml-1">new this period</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <TrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Occupancy Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{overview.occupancyRate || 0}%</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className={overview.occupancyTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                      {overview.occupancyTrend > 0 ? '+' : ''}{overview.occupancyTrend || 0}%
                    </span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Average Rent</dt>
                      <dd className="text-lg font-medium text-gray-900">${overview.averageRent || 0}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className={overview.rentTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                      {overview.rentTrend > 0 ? '+' : ''}{overview.rentTrend || 0}%
                    </span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Days on Market</dt>
                      <dd className="text-lg font-medium text-gray-900">{overview.averageDaysOnMarket || 0}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className={overview.marketTrend < 0 ? 'text-green-600' : 'text-red-600'}>
                      {overview.marketTrend < 0 ? '-' : '+'}{overview.marketTrend || 0} days
                    </span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Property Status Distribution */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Property Status Distribution</h3>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">{overview.availableProperties || 0}</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-md">
                  <div className="text-2xl font-bold text-blue-600">{overview.rentedProperties || 0}</div>
                  <div className="text-sm text-gray-600">Rented</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-md">
                  <div className="text-2xl font-bold text-yellow-600">{overview.pendingProperties || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Performance View */}
      {viewType === 'performance' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Property Performance</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{property.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{property.address?.city}, {property.address?.state}</span>
                      <StatusBadge status={property.status} />
                    </div>
                    <div className="flex items-center space-x-6 mt-2">
                      <div>
                        <span className="text-xs text-gray-500">Rent:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">${property.rent}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Days on Market:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{property.daysOnMarket}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Views:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{property.views}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Inquiries:</span>
                        <span className="text-sm font-medium text-gray-900 ml-1">{property.inquiries}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {property.performanceScore}/100
                    </div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Locations View */}
      {viewType === 'locations' && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">Property Locations</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {Object.entries(overview.locations || {}).map(([location, data]) => (
                <div key={location} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{location}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{data.count} properties</span>
                        <span>Avg rent: ${data.averageRent}</span>
                        <span>Occupancy: {data.occupancyRate}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${data.totalRevenue}
                    </div>
                    <div className="text-xs text-gray-500">Total Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Trends View */}
      {viewType === 'trends' && (
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Market Trends</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Rental Price Trends</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {trends.priceTrend > 0 ? '+' : ''}{trends.priceTrend || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Price Change</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-md">
                      <div className="text-2xl font-bold text-green-600">${trends.averagePrice || 0}</div>
                      <div className="text-sm text-gray-600">Average Price</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-md">
                      <div className="text-2xl font-bold text-purple-600">${trends.medianPrice || 0}</div>
                      <div className="text-sm text-gray-600">Median Price</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Market Activity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-md">
                      <div className="text-2xl font-bold text-yellow-600">{trends.listingTrend > 0 ? '+' : ''}{trends.listingTrend || 0}%</div>
                      <div className="text-sm text-gray-600">Listing Trend</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-md">
                      <div className="text-2xl font-bold text-green-600">{trends.newListings || 0}</div>
                      <div className="text-sm text-gray-600">New Listings</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-md">
                      <div className="text-2xl font-bold text-blue-600">{trends.soldProperties || 0}</div>
                      <div className="text-sm text-gray-600">Sold Properties</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Demand Indicators</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-md">
                      <div className="text-2xl font-bold text-purple-600">{trends.viewsPerProperty || 0}</div>
                      <div className="text-sm text-gray-600">Avg Views per Property</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-md">
                      <div className="text-2xl font-bold text-orange-600">{trends.inquiriesPerProperty || 0}</div>
                      <div className="text-sm text-gray-600">Avg Inquiries per Property</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Top Performing Properties */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Top Performing Properties</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {properties
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .slice(0, 5)
                  .map((property, index) => (
                    <div key={property._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="text-lg font-medium text-gray-900 mr-3">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{property.title}</p>
                          <p className="text-xs text-gray-600">{property.address?.city}, {property.address?.state}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{property.performanceScore}/100</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PropertyAnalytics;
