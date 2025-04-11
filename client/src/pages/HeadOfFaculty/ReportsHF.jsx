import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  BarChart2, 
  Users, 
  Download, 
  Loader2, 
  AlertTriangle, 
  RefreshCw,
  Briefcase,
  Layers,
  Search
} from 'lucide-react';
import ReportsFilter from '@/components/ReportsHOF/ReportsFilter';
import ReportsList from '@/components/ReportsHOF/ReportsList';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const ReportsHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    semester: '',
    program: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalReports: 0,
    totalAssignments: 0,
    programs: 0,
  });
  
  const navigate = useNavigate();

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.semester) queryParams.append('semester', filters.semester);
        if (filters.program) queryParams.append('program', filters.program);
        
        const response = await api.get(`/reports?${queryParams.toString()}`);
        setReports(response.data);
        setFilteredReports(response.data);
        updateStats(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch reports. Please try again later.');
        toast.error('Error fetching reports');
        console.error('Error fetching reports:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filters]);

  // Update statistics based on reports data
  const updateStats = (reportsData) => {
    if (reportsData.length > 0) {
      const totalAssignments = reportsData.reduce(
        (sum, report) => sum + (report.assignments?.length || 0), 0
      );
      const uniquePrograms = new Set(reportsData.map(report => report.program).filter(Boolean)).size;
      
      setStats({
        totalReports: reportsData.length,
        totalAssignments,
        programs: uniquePrograms
      });
    } else {
      setStats({
        totalReports: 0,
        totalAssignments: 0,
        programs: 0
      });
    }
  };

  // Handle search functionality
  useEffect(() => {
    if (searchQuery) {
      const filtered = reports.filter(report => {
        return (
          report.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.semester?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.year?.toString().includes(searchQuery) ||
          report.generatedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredReports(filtered);
      updateStats(filtered);
    } else {
      setFilteredReports(reports);
      updateStats(reports);
    }
  }, [searchQuery, reports]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setSearchQuery(''); // Reset search when filters change
  };

  // Handle view report detail
  const handleViewReport = (reportId) => {
    navigate(user.role === "HeadOfFaculty" 
      ? `/reports/${reportId}` 
      : user.role === "Instructor" 
        ? `/reportInst/${reportId}`
        : `/reportsCH/${reportId}`
    );
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      year: '',
      semester: '',
      program: '',
    });
    setSearchQuery('');
  };

  // Prepare CSV data
  const getCsvData = () => {
    return filteredReports.map(report => {
      return {
        'Report ID': report._id,
        'Year': report.year,
        'Semester': report.semester,
        'Program': report.program,
        'Created By': report.generatedBy?.name || 'N/A',
        'Date Created': new Date(report.createdAt).toLocaleDateString(),
        'Assignments Count': report.assignments?.length || 0,
        'Note': report.note || 'N/A'
      };
    });
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto pb-6">
        {/* Main container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
            Academic Reports Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-md p-2.5 text-indigo-600 dark:text-indigo-400">
                  <FileText size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reports</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalReports}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 rounded-md p-2.5 text-green-600 dark:text-green-400">
                  <Briefcase size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assignments</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalAssignments}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 rounded-md p-2.5 text-purple-600 dark:text-purple-400">
                  <Layers size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Programs</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.programs}</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by program, semester, year or creator..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          <ReportsFilter 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart2 className="text-indigo-600 dark:text-indigo-400" size={20} />
              Reports {filteredReports.length > 0 && `(${filteredReports.length})`}
            </h2>
            
            <div className="flex gap-3">
              {filteredReports.length > 0 && (
                <CSVLink 
                  data={getCsvData()} 
                  filename={`academic-reports-${new Date().toISOString().split('T')[0]}.csv`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Download size={16} className="mr-2" />
                  Export CSV
                </CSVLink>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <Loader2 size={36} className="animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-2" />
              <p className="text-red-800 dark:text-red-300 font-medium mb-1">Error</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md transition-colors text-sm inline-flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          ) : (
            <ReportsList reports={filteredReports} onViewReport={handleViewReport} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsHF;