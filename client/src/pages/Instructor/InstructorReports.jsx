import { useState } from 'react';
import api from '../../utils/api';
import { useSelector } from 'react-redux';
import { 
  Search, 
  Calendar, 
  FileText, 
  Clock, 
  Users, 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  BookOpen,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showFilters, setShowFilters] = useState(true);

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

  const resetFilters = () => {
    setFilters({ year: '', semester: '', program: '' });
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
  
  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
              My Teaching Assignments
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View your course assignments across different semesters and programs
            </p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 py-2 px-4 rounded-lg transition-colors"
          >
            <Filter size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-700 dark:text-red-300">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
            >
              &times;
            </button>
          </div>
        )}

        {/* Search Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                  <Search className="text-indigo-600 dark:text-indigo-400" size={20} />
                  Search Filters
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Year Filter */}
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                      Academic Year
                    </label>
                    <select
                      id="year"
                      name="year"
                      value={filters.year}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition text-base"
                    >
                      <option value="">Select Year</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Semester Filter */}
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                      Semester
                    </label>
                    <select
                      id="semester"
                      name="semester"
                      value={filters.semester}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition text-base"
                    >
                      <option value="">Select Semester</option>
                      {semesterOptions.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Program Filter */}
                  <div>
                    <label htmlFor="program" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Users size={16} className="text-gray-500 dark:text-gray-400" />
                      Program
                    </label>
                    <select
                      id="program"
                      name="program"
                      value={filters.program}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 transition text-base"
                    >
                      <option value="">Select Program</option>
                      {programOptions.map(prog => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium flex items-center gap-1 order-2 sm:order-1"
                    >
                      <RefreshCw size={14} />
                      Reset Filters
                    </button>
                  )}
                  
                  <button
                    onClick={fetchReports}
                    disabled={!hasFilters || loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        <span>Search Reports</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Results */}
        <motion.div 
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/30">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
              Assignment Reports
            </h2>
          </div>
          
          {loading && !reports.length ? (
            <div className="p-12 text-center">
              <Loader2 size={32} className="animate-spin mx-auto text-indigo-600 dark:text-indigo-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No reports found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {hasFilters 
                  ? "No reports match your filters. Try different criteria." 
                  : "Use the filters above to search for your teaching assignments."}
              </p>
              {hasFilters && (
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors inline-flex items-center"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile view - cards */}
              <div className="sm:hidden">
                {reports.flatMap(report => 
                  report.assignments.flatMap(assignment => 
                    assignment.assignments
                      .filter(assign => assign.instructorId._id === user._id)
                      .map((assign, idx) => (
                        <div 
                          key={`${assignment._id}-${idx}`} 
                          className="p-4 border-b border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {assign.courseId.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {assign.courseId.code}
                              </div>
                            </div>
                            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded">
                              {assignment.year}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-2 text-sm mt-3">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                              <p className="font-medium text-gray-700 dark:text-gray-300">{assignment.semester}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Program:</span>
                              <p className="font-medium text-gray-700 dark:text-gray-300">{assignment.program}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Section:</span>
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                {assign.section || 'N/A'}
                                {assign.labDivision && ` (Lab: ${assign.labDivision})`}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Workload:</span>
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                {assign.workload} Hours
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                  )
                )}
              </div>
              
              {/* Desktop view - table */}
              <div className="hidden sm:block overflow-x-auto">
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
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                                  {assignment.program}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {assign.courseId.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {assign.courseId.code}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {assign.section || 'N/A'}
                                  {assign.labDivision && ` (Lab: ${assign.labDivision})`}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm">
                                  <Clock className="mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                                    {assign.workload} Hours
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InstructorReports;