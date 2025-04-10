import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  RefreshCw, 
  Calendar,
  Clock,
  Layers
} from 'lucide-react';

const ReportsFilter = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(true);

  // Sync with parent filters when they change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      year: '',
      semester: '',
      program: '',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Filter className="text-indigo-600 dark:text-indigo-400" size={18} />
          Filter Reports
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors text-sm flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              <span>Hide Filters</span>
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              <span>Show Filters</span>
            </>
          )}
        </button>
      </div>

      <motion.div
        initial={{ height: "auto" }}
        animate={{ height: isExpanded ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                Academic Year
              </label>
              <select
                id="year"
                name="year"
                value={localFilters.year}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                value={localFilters.semester}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Semesters</option>
                <option value="Regular 1">Regular 1</option>
                <option value="Regular 2">Regular 2</option>
                <option value="Summer">Summer</option>
                <option value="Extension 1">Extension 1</option>
                <option value="Extension 2">Extension 2</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Layers size={16} className="text-gray-500 dark:text-gray-400" />
                Program
              </label>
              <select
                id="program"
                name="program"
                value={localFilters.program}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 outline-none transition dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Programs</option>
                <option value="Regular">Regular</option>
                <option value="Common">Common</option>
                <option value="Extension">Extension</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              Reset
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Search size={16} className="mr-2" />
              Search Reports
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportsFilter;