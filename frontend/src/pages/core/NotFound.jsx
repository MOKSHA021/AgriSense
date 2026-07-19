import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <h1 className="text-9xl font-bold text-green-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
