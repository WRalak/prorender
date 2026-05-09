import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About PropRent</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mx-auto mb-4">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To connect tenants with quality rental properties and provide a seamless rental experience through innovative technology.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mx-auto mb-4">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-gray-600">
                To become the most trusted platform for property rentals, making the process simple, transparent, and efficient for everyone.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mx-auto mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Values</h3>
              <p className="text-gray-600">
                Trust, transparency, and innovation guide everything we do. We're committed to providing exceptional service to our users.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/properties"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
