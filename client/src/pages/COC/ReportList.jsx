import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Loader2, 
  PlusCircle, 
  Calendar,
  FileText,
  Layers,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';

const ReportList = ({ reports = [], loading, error, onDeleteSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Calculate available years and programs from reports
  const years = [...new Set(reports.map(report => report.year))].sort((a, b) => b - a);
  const programs = [...new Set(reports.map(report => report.program).filter(Boolean))];
  
  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      (report.note && report.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.year && report.year.toString().includes(searchTerm));
      
    const matchesYear = selectedYear === '' || report.year.toString() === selectedYear;
    const matchesProgram = selectedProgram === '' || report.program === selectedProgram;
    
    return matchesSearch && matchesYear && matchesProgram;
  });
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        setDeleteLoading(id);
        await api.delete(`/reports/${id}`);
        onDeleteSuccess(id);
      } catch (error) {
        alert('Failed to delete report: ' + (error.response?.data?.message || error.message));
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.05
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 mx-auto text-indigo-600 dark:text-indigo-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-5 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }
  
  if (reports.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" size={64} />
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No reports found</p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first report to get started</p>
        <Link to="/reports/create">
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors shadow-sm">
            <PlusCircle className="mr-2" size={16} />
            Create New Report
          </button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col md:flex-row gap-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 sm:text-sm flex-1"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="block py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 sm:text-sm flex-1"
          >
            <option value="">All Programs</option>
            {programs.map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400">No reports match your filters</p>
          </div>
        ) : (
          <div>
            {/* Mobile view */}
            <div className="p-4 space-y-4 md:hidden">
              <AnimatePresence>
                {filteredReports.map(report => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                            <span>{report.year}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {report.program ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                                {report.program}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                                All Programs
                              </span>
                            )}
                            
                            {report.semester ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                                {report.semester}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                                All Semesters
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock size={14} />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User size={14} className="mr-1" />
                        <span>{report.generatedBy || 'Unknown'}</span>
                      </div>
                      
                      <div className="mt-4 flex justify-between">
                        <Link to={`/reportsCOC/${report._id}`}>
                          <button className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-md inline-flex items-center text-sm">
                            <Eye size={14} className="mr-1" />
                            View
                          </button>
                        </Link>
                        
                        <div className="flex gap-2">
                          <Link to={`/reports/${report._id}/edit`}>
                            <button className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              <Edit size={16} />
                            </button>
                          </Link>
                          
                          <button
                            className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300"
                            onClick={() => handleDelete(report._id)}
                            disabled={deleteLoading === report._id}
                          >
                            {deleteLoading === report._id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Desktop view */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Academic Year</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Program</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <AnimatePresence>
                    {filteredReports.map((report, index) => (
                      <motion.tr 
                        key={report._id} 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{report.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.program ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                              {report.program}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                              All Programs
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.semester ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                              {report.semester}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                              All Semesters
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{report.generatedBy || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(report.createdAt).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link to={`/reportsCOC/${report._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                              <button className="p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition">
                                <Eye size={18} />
                              </button>
                            </Link>
                            <Link to={`/reports/${report._id}/edit`} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                              <button className="p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <Edit size={18} />
                              </button>
                            </Link>
                            <button
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition relative"
                              onClick={() => handleDelete(report._id)}
                              disabled={deleteLoading === report._id}
                            >
                              {deleteLoading === report._id ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReportList;