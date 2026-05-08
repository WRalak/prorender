import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="mt-6 text-6xl font-extrabold text-gray-900">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Page not found</h2>
          <p className="mt-2 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go back home
            </Link>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
              Go back
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Looking for something specific?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Link
              to="/properties"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Browse Properties →
            </Link>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Dashboard →
            </Link>
            <Link
              to="/applications"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              My Applications →
            </Link>
            <Link
              to="/messages"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Messages →
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Still can't find what you're looking for?{' '}
          <a
            href="mailto:support@prorender.com"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
