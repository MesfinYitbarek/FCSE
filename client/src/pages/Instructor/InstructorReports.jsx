import { useState, useEffect, useMemo } from 'react';
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
  Filter,
  Download,
  BarChart2,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Available options for select inputs
  const semesterOptions = ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"];
  const programOptions = ["Regular", "Common", "Extension", "Summer"];
  
  // Years dynamically generated (current year down to 5 years ago)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    // Auto-populate with current year on mount
    setFilters(prev => ({
      ...prev,
      year: currentYear.toString()
    }));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({ 
      year: currentYear.toString(), 
      semester: '', 
      program: '' 
    });
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
      setIsDataFetched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort function for table columns
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Flatten and process the data for easier display
  const flattenedReports = useMemo(() => {
    return reports.flatMap(report => 
      report.assignments.flatMap(assignment => 
        assignment.assignments
          .filter(assign => assign.instructorId._id === user._id)
          .map((assign, idx) => ({
            id: `${assignment._id}-${idx}`,
            year: assignment.year,
            semester: assignment.semester,
            program: assignment.program,
            courseName: assign.courseId.name,
            courseCode: assign.courseId.code,
            section: assign.section || 'N/A',
            labDivision: assign.labDivision,
            workload: assign.workload
          }))
      )
    );
  }, [reports, user._id]);

  // Apply sorting to flattened reports
  const sortedReports = useMemo(() => {
    if (!sortConfig.key) return flattenedReports;

    return [...flattenedReports].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [flattenedReports, sortConfig]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (flattenedReports.length === 0) return { 
      totalWorkload: 0, 
      totalCourses: 0, 
      uniqueCourses: 0 
    };

    const totalWorkload = flattenedReports.reduce((sum, item) => sum + item.workload, 0);
    const totalCourses = flattenedReports.length;
    const uniqueCourses = new Set(flattenedReports.map(item => item.courseCode)).size;

    return { totalWorkload, totalCourses, uniqueCourses };
  }, [flattenedReports]);

  // Export data to CSV
  const exportToCSV = () => {
    if (flattenedReports.length === 0) return;

    // Define headers and rows
    const headers = ['Year', 'Semester', 'Program', 'Course', 'Code', 'Section', 'Lab Division', 'Workload (Hours)'];
    const rows = flattenedReports.map(r => [
      r.year, 
      r.semester, 
      r.program, 
      r.courseName, 
      r.courseCode, 
      r.section,
      r.labDivision || '', 
      r.workload
    ]);

    // Create CSV content
    let csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `teaching-assignments-${filters.year || 'all'}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if any filter is filled
  const hasFilters = filters.year || filters.semester || filters.program;
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const staggerItems = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemFade = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FileText className="text-indigo-600 dark:text-indigo-400" size={28} />
                My Teaching Assignments
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and manage your course assignments across different semesters and programs
              </p>
            </motion.div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="sm:hidden px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter size={18} />
              </button>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="hidden sm:flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter size={18} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              
              {flattenedReports.length > 0 && (
                <button 
                  onClick={exportToCSV}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg shadow-sm transition-colors"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile filters drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden"
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30 }}
                  className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-xl p-5 overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <SlidersHorizontal size={20} className="text-indigo-600 dark:text-indigo-400" />
                      Filters
                    </h2>
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Year Filter */}
                    <div>
                      <label htmlFor="mobile-year" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                        Academic Year
                      </label>
                      <select
                        id="mobile-year"
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
                      <label htmlFor="mobile-semester" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                        Semester
                      </label>
                      <select
                        id="mobile-semester"
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
                      <label htmlFor="mobile-program" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Users size={16} className="text-gray-500 dark:text-gray-400" />
                        Program
                      </label>
                      <select
                        id="mobile-program"
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
                  
                  <div className="mt-8 space-y-4">
                    {hasFilters && (
                      <button
                        onClick={resetFilters}
                        className="w-full px-4 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={16} />
                        Reset Filters
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        fetchReports();
                        setShowMobileFilters(false);
                      }}
                      disabled={!hasFilters || loading}
                      className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-700 dark:text-red-300"
            >
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6 hidden sm:block"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="text-indigo-600 dark:text-indigo-400" size={20} />
                    Filter Assignments
                  </h2>
                  
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium flex items-center gap-1 text-sm"
                    >
                      <RefreshCw size={14} />
                      Reset Filters
                    </button>
                  )}
                </div>
                
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

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={fetchReports}
                    disabled={!hasFilters || loading}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]"
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
        
        {/* Stats Summary - Show only when there's data */}
        {flattenedReports.length > 0 && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div 
              variants={slideUp}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workload</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    {stats.totalWorkload.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Hours of teaching</p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Courses</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    {stats.totalCourses}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Total assignments</p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Courses</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    {stats.uniqueCourses}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BarChart2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Distinct subjects</p>
            </motion.div>
          </motion.div>
        )}
        
        {/* Results Container */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
                Teaching Assignments
              </h2>
              
              {flattenedReports.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-900 dark:text-white">{flattenedReports.length}</span> results
                </div>
              )}
            </div>
          </div>
          
          {loading && !isDataFetched ? (
            <div className="p-12 text-center">
              <Loader2 size={36} className="animate-spin mx-auto text-indigo-600 dark:text-indigo-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your assignments...</p>
            </div>
          ) : flattenedReports.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="mb-4 h-24 w-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-indigo-300 dark:text-indigo-700" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No assignments found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                {!isDataFetched 
                  ? "Use the search filters to find your teaching assignments" 
                  : "No assignments match your search criteria. Try different filters."}
              </p>
              {hasFilters && isDataFetched && (
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors inline-flex items-center font-medium"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reset Filters
                </button>
              )}
              {!isDataFetched && (
                <button 
                  onClick={fetchReports}
                  disabled={!hasFilters || loading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  <span>Search Now</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile view - cards */}
              <motion.div 
                variants={staggerItems}
                initial="hidden"
                animate="visible"
                className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700"
              >
                {sortedReports.map((item) => (
                  <motion.div 
                    key={item.id}
                    variants={itemFade}
                    className="p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{item.courseName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.courseCode}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {item.year}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.semester}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {item.program}
                      </span>
                      
                      <span className="ml-auto inline-flex items-center text-gray-700 dark:text-gray-300 font-medium">
                        <Clock className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                        {item.workload.toFixed(2)} Hours
                      </span>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Section:</span>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {item.section}
                        </p>
                      </div>
                      {item.labDivision && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Lab:</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            {item.labDivision}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Desktop view - table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => requestSort('year')}
                      >
                        <div className="flex items-center">
                          <span>Year/Semester</span>
                          <span className="ml-1">
                            {sortConfig.key === 'year' ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => requestSort('program')}
                      >
                        <div className="flex items-center">
                          <span>Program</span>
                          <span className="ml-1">
                            {sortConfig.key === 'program' ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => requestSort('courseName')}
                      >
                        <div className="flex items-center">
                          <span>Course</span>
                          <span className="ml-1">
                            {sortConfig.key === 'courseName' ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => requestSort('section')}
                      >
                        <div className="flex items-center">
                          <span>Section</span>
                          <span className="ml-1">
                            {sortConfig.key === 'section' ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => requestSort('workload')}
                      >
                        <div className="flex items-center">
                          <span>Workload</span>
                          <span className="ml-1">
                            {sortConfig.key === 'workload' ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedReports.map((item) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.year}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.semester}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            {item.program}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.courseName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.courseCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.section}
                            {item.labDivision && ` (Lab: ${item.labDivision})`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-3 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            <Clock className="mr-1.5 h-4 w-4" />
                            <span className="font-medium">
                              {item.workload.toFixed(2)} Hours
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary row */}
                    {sortedReports.length > 0 && (
                      <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                        <td colSpan={4} className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                          Total Workload:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-3 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            <span className="font-bold">
                              {stats.totalWorkload.toFixed(2)} Hours
                            </span>
                          </div>
                        </td>
                      </tr>
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