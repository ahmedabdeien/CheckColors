import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { FaHome, FaSadTear } from 'react-icons/fa'; // Icons from React Icons

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // Navigate to the homepage
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="text-center max-w-2xl">
        {/* Icon */}
        <div className="text-8xl text-purple-600 mb-6">
          <FaSadTear className="inline-block" />
        </div>

        {/* Error Code */}
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for has vanished into the digital void.
          Don't worry, you can always return to our homepage and start fresh.
        </p>

        {/* Button */}
        <button
          onClick={handleGoHome}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <FaHome className="mr-2" />
          Back to Homepage
        </button>
      </div>
    </div>
  );
};

export default NotFound;