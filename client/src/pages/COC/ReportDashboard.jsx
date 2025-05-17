import { useState} from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, BarChart2, Search, FileText,  X, Filter } from 'lucide-react';
import ReportList from '../../components/ReportsCOC/ReportList';
import ReportStats from '../../components/ReportsCOC/ReportStats';
import api from '../../utils/api';

// Define constants based on your schema
const SEMESTER_OPTIONS = ["Regular 1", "Regular 2", "Summer", "Extension 1", "Extension 2"];
const PROGRAM_OPTIONS = ["Regular", "Common", "Extension", "Summer"];

const ReportDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    byYear: {},
    byProgram: {}
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    semester: '',
    program: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      // Convert filters object to query params
      const queryParams = new URLSearchParams();
      
      // Only add year if it's a valid number
      if (filters.year && !isNaN(filters.year)) {
        queryParams.append('year', filters.year);
      }
      
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.program) queryParams.append('program', filters.program);
      
      const response = await api.get(`/reports?${queryParams.toString()}`);
      setReports(response.data);
      
      // Calculate stats
      const totalReports = response.data.length;
      
      // Group by year
      const byYear = response.data.reduce((acc, report) => {
        acc[report.year] = (acc[report.year] || 0) + 1;
        return acc;
      }, {});
      
      // Group by program
      const byProgram = response.data.reduce((acc, report) => {
        const program = report.program || 'All Programs';
        acc[program] = (acc[program] || 0) + 1;
        return acc;
      }, {});
      
      setStats({ totalReports, byYear, byProgram });
      setInitialLoad(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    // Only allow numbers or empty string
    if (value === '' || /^\d+$/.test(value)) {
      setFilters(prev => ({
        ...prev,
        year: value
      }));
    }
  };

  const handleSearch = () => {
    // Only search if at least one filter is set
    if (filters.year || filters.semester || filters.program) {
      fetchReports();
    }
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      semester: '',
      program: ''
    });
    setSearchTerm('');
  };

  const filteredReports = reports.filter(report => 
    searchTerm === '' || 
    (report.note && report.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (report.year && report.year.toString().includes(searchTerm)) ||
    (report.program && report.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (report.semester && report.semester.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique values for filter dropdowns from existing reports
  const uniqueYears = [...new Set(reports.map(report => report.year))].sort();
  const uniqueSemesters = [...new Set(reports.map(report => report.semester))].filter(Boolean);
  const uniquePrograms = [...new Set(reports.map(report => report.program))].filter(Boolean);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="h-full overflow-y-auto">
      <motion.div 
        className="max-w-6xl mx-auto pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={28} />
              Assignment Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage assignment reports for all academic years, programs, and semesters
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Filter className="mr-1 h-4 w-4" />
              <span>Filters</span>
            </button>
            <Link to="/reports/create">
              <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition shadow-sm">
                <PlusCircle className="mr-2" size={18} />
                Create New Report
              </button>
            </Link>
          </div>
        </motion.div>

        {showFilters && (
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={filters.year}
                  onChange={handleYearChange}
                  placeholder="e.g. 2023"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Semesters</option>
                  {SEMESTER_OPTIONS.map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program
                </label>
                <select
                  id="program"
                  name="program"
                  value={filters.program}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Programs</option>
                  {PROGRAM_OPTIONS.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between">
              {(filters.year || filters.semester || filters.program) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear filters
                </button>
              )}
              
              <button
                onClick={handleSearch}
                disabled={loading || !filters.year} // Disable if year is not provided
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search Reports'}
              </button>
            </div>
            {!filters.year && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Please enter an academic year to search
              </p>
            )}
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-6">
          {!initialLoad && (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-none placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  placeholder="Search within results by year, program, semester or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-6"
              >
                <div className="flex items-center mb-4">
                  <BarChart2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Report Statistics</h2>
                </div>
                <ReportStats stats={stats} />
              </motion.div>
            </>
          )}

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {initialLoad ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>Set your filters and click "Search Reports" to view reports</p>
              </div>
            ) : (
              <ReportList 
                reports={filteredReports} 
                loading={loading} 
                error={error} 
                onDeleteSuccess={(id) => {
                  setReports(reports.filter(report => report._id !== id));
                  setStats({
                    ...stats,
                    totalReports: stats.totalReports - 1
                  });
                }}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReportDashboard;