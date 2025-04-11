import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16 bg-white dark:bg-slate-900">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="relative">
            <h1 className="text-8xl font-bold text-indigo-600 dark:text-indigo-500">404</h1>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mt-4">Page Not Found</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors inline-flex items-center justify-center font-medium text-base"
          >
            Go to Dashboard
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors inline-flex items-center justify-center font-medium text-base"
          >
            Go Back
          </button>
        </div>
        
        <p className="mt-8 text-xs text-gray-500 dark:text-gray-500">
          If you believe this is an error, please contact the administrator.
        </p>
      </div>
    </div>
  );
};

export default NotFound;