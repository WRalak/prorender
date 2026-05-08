import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalculatorIcon,
  DocumentTextIcon,
  HomeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { formatCurrency } from '../../../utils/formatCurrency';

const Tools = () => {
  const { user } = useAuth();
  const [rentalCalculations, setRentalCalculations] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    maxRent: '',
  });

  const [affordabilityResults, setAffordabilityResults] = useState(null);

  const calculateMaxRent = () => {
    const monthlyIncome = parseFloat(rentalCalculations.monthlyIncome) || 0;
    const monthlyExpenses = parseFloat(rentalCalculations.monthlyExpenses) || 0;
    
    // Rule of thumb: rent should not exceed 30% of monthly income after expenses
    const availableIncome = monthlyIncome - monthlyExpenses;
    const maxRent = availableIncome * 0.3;
    
    setRentalCalculations({
      ...rentalCalculations,
      maxRent: maxRent.toFixed(2),
    });
    
    setAffordabilityResults({
      maxRent,
      availableIncome,
      percentage: ((maxRent / monthlyIncome) * 100).toFixed(1),
    });
  };

  const tools = [
    {
      id: 'rental-calculator',
      name: 'Rental Calculator',
      description: 'Calculate how much rent you can afford based on your income and expenses',
      icon: CalculatorIcon,
      color: 'blue',
    },
    {
      id: 'moving-checklist',
      name: 'Moving Checklist',
      description: 'Complete checklist for moving to a new rental property',
      icon: DocumentTextIcon,
      color: 'green',
    },
    {
      id: 'lease-analyzer',
      name: 'Lease Agreement Analyzer',
      description: 'Understand and analyze lease agreements before signing',
      icon: DocumentTextIcon,
      color: 'purple',
    },
    {
      id: 'neighborhood-guide',
      name: 'Neighborhood Guide',
      description: 'Research and compare different neighborhoods for your move',
      icon: MapPinIcon,
      color: 'orange',
    },
    {
      id: 'budget-planner',
      name: 'Budget Planner',
      description: 'Plan your monthly budget including rent, utilities, and other expenses',
      icon: CurrencyDollarIcon,
      color: 'red',
    },
    {
      id: 'property-comparison',
      name: 'Property Comparison',
      description: 'Compare multiple rental properties side by side',
      icon: HomeIcon,
      color: 'indigo',
    },
  ];

  const getColorClass = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'purple':
        return 'bg-purple-500';
      case 'orange':
        return 'bg-orange-500';
      case 'red':
        return 'bg-red-500';
      case 'indigo':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Tools</h1>
              <p className="text-sm text-gray-500">
                Helpful tools and resources for renters
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Tool - Rental Calculator */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <CalculatorIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">Rental Affordability Calculator</h2>
                <p className="text-gray-600">
                  Calculate how much rent you can afford based on your income and expenses
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income
                  </label>
                  <input
                    type="number"
                    value={rentalCalculations.monthlyIncome}
                    onChange={(e) => setRentalCalculations({
                      ...rentalCalculations,
                      monthlyIncome: e.target.value,
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your monthly income"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Expenses
                  </label>
                  <input
                    type="number"
                    value={rentalCalculations.monthlyExpenses}
                    onChange={(e) => setRentalCalculations({
                      ...rentalCalculations,
                      monthlyExpenses: e.target.value,
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your monthly expenses"
                  />
                </div>
                <Button
                  onClick={calculateMaxRent}
                  className="w-full"
                >
                  Calculate Maximum Rent
                </Button>
              </div>

              <div className="space-y-6">
                {affordabilityResults && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">Results</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Available Income:</span>
                        <span className="text-sm font-bold text-blue-900">
                          {formatCurrency(affordabilityResults.availableIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Maximum Rent:</span>
                        <span className="text-sm font-bold text-blue-900">
                          {formatCurrency(affordabilityResults.maxRent)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Percentage of Income:</span>
                        <span className="text-sm font-bold text-blue-900">
                          {affordabilityResults.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Recommendation:</strong> Your rent should not exceed 30% of your monthly income.
                        Based on your calculations, you can afford up to {formatCurrency(affordabilityResults.maxRent)} per month.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Other Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClass(tool.color)}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{tool.name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm font-medium">Use Tool</span>
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Resources Section */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Renting Guides</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <Link to="/guides/first-apartment" className="text-blue-600 hover:text-blue-800">
                      First Apartment Guide
                    </Link>
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <Link to="/guides/roommate-finding" className="text-blue-600 hover:text-blue-800">
                      Finding Roommates
                    </Link>
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <Link to="/guides/renters-rights" className="text-blue-600 hover:text-blue-800">
                      Renters Rights Guide
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Resources</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <DocumentTextIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <Link to="/legal/lease-agreement" className="text-blue-600 hover:text-blue-800">
                      Lease Agreement Templates
                    </Link>
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <DocumentTextIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <Link to="/legal/notice-templates" className="text-blue-600 hover:text-blue-800">
                      Notice Templates
                    </Link>
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <DocumentTextIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <Link to="/legal/inspection-checklist" className="text-blue-600 hover:text-blue-800">
                      Property Inspection Checklist
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Tips Section */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pro Tips for Renters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Budget Wisely</h3>
                  <p className="text-sm text-gray-600">
                    Keep rent under 30% of your monthly income to ensure financial stability.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Read Everything</h3>
                  <p className="text-sm text-gray-600">
                    Carefully review lease agreements and understand all terms before signing.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Document Everything</h3>
                  <p className="text-sm text-gray-600">
                    Take photos and document the property condition when moving in and out.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Research Neighborhoods</h3>
                  <p className="text-sm text-gray-600">
                    Visit the area at different times to get a feel for the neighborhood.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Get Renters Insurance</h3>
                  <p className="text-sm text-gray-600">
                    Protect your belongings with appropriate renters insurance coverage.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Know Your Rights</h3>
                  <p className="text-sm text-gray-600">
                    Understand local tenant laws and your rights as a renter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tools;
