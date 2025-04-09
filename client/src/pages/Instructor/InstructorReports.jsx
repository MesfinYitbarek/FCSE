import { useState } from 'react';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const InstructorReports = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    semester: '',
    program: ''
  });

  // Available options for select inputs
  const semesterOptions = ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"];
  const programOptions = ["Regular", "Common", "Extension", "Summer"];
  
  // Years dynamically generated (current year down to 5 years ago)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.program) queryParams.append('program', filters.program);
      
      const response = await api.get(
        `/reports/instructor/${user._id}?${queryParams.toString()}`
      );
      
      setReports(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if any filter is filled
  const hasFilters = filters.year || filters.semester || filters.program;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Teaching Assignments</h1>
      </div>
      
      {/* Search Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Search Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Year Filter */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Academic Year
            </label>
            <select
              id="year"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select Year</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Semester Filter */}
          <div>
            <label htmlFor="semester" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Semester
            </label>
            <select
              id="semester"
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select Semester</option>
              {semesterOptions.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          
          {/* Program Filter */}
          <div>
            <label htmlFor="program" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Program
            </label>
            <select
              id="program"
              name="program"
              value={filters.program}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select Program</option>
              {programOptions.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button - Only shown when at least one filter is filled */}
        {hasFilters && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={fetchReports}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                'Search Reports'
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Assignment Reports</h2>
        </div>
        
        {loading && !reports.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {hasFilters ? "No reports match your filters. Try different criteria." : "Use the filters above to search for reports."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Year/Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Workload
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reports.flatMap(report => 
                  report.assignments.flatMap(assignment => 
                    assignment.assignments
                      .filter(assign => assign.instructorId._id === user._id)
                      .map((assign, idx) => (
                        <tr 
                          key={`${assignment._id}-${idx}`} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{assignment.year}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.semester}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{assignment.program}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {assign.courseId.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {assign.courseId.code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {assign.section || 'N/A'}
                              {assign.labDivision && ` (Lab: ${assign.labDivision})`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {assign.workload} Hours
                            </div>
                          </td>
                        </tr>
                      ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorReports;