import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, BarChart2, Search, FileText } from 'lucide-react';
import ReportList from './ReportList';
import ReportStats from './ReportStats';
import api from '../../utils/api';

const ReportDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    byYear: {},
    byProgram: {}
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reports');
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
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => 
    searchTerm === '' || 
    (report.note && report.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (report.year && report.year.toString().includes(searchTerm)) ||
    (report.program && report.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (report.semester && report.semester.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <div>
            <Link to="/reports/create">
              <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition shadow-sm">
                <PlusCircle className="mr-2" size={18} />
                Create New Report
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm dark:shadow-none placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              placeholder="Search by year, program, semester or notes..."
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

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
          >
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
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReportDashboard;