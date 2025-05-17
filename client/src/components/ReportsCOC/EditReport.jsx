import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../utils/api';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  Save, 
  Edit,
  Calendar,
  Layers,
  FileText,
  MessageSquare,
  Info,
  Clock
} from 'lucide-react';

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    note: ''
  });
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reports/${id}`);
        setReportData(response.data);
        setFormData({
          note: response.data.note || ''
        });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching report');
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      await api.patch(`/reports/${id}`, formData);
      setSuccess(true);
      
      // Navigate back to report view after 1.5 seconds
      setTimeout(() => {
        navigate(`/reports/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report');
      setSubmitting(false);
    }
  };
  
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
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" size={40} />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading report data...</p>
        </div>
      </div>
    );
  }
  
  if (error && !reportData) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-5 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 dark:text-red-400 mr-3" size={24} />
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
            <div className="mt-4">
              <Link to="/reports" className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg transition">
                <ArrowLeft className="mr-2" size={16} />
                Back to Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto">
      <motion.div 
        className="max-w-7xl mx-auto pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <Link to={`/reports/${id}`} className="mr-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <Edit className="text-indigo-600 dark:text-indigo-400" />
                      Edit Report
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Update information for this report
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            {/* Left column - Form */}
            <div className="md:col-span-2">
              <motion.div 
                variants={itemVariants} 
                className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Edit Report Details
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Update information for the selected report
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-4 rounded-md"
                      >
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                          <div className="ml-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-700 p-4 rounded-md"
                      >
                        <div className="flex">
                          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                          <div className="ml-3">
                            <p className="text-sm text-green-700 dark:text-green-300">Report updated successfully! Redirecting...</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                        <MessageSquare size={16} className="text-gray-500 dark:text-gray-400" />
                        Additional Notes
                      </label>
                      <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Add any additional notes or context for this report"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Update the notes and additional information for this report.
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-5">
                      <Link to={`/reports/${id}`}>
                        <button
                          type="button"
                          disabled={submitting}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          Cancel
                        </button>
                      </Link>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="-ml-1 mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
            
            {/* Right column - Report Info */}
            <div className="mt-5 md:mt-0 space-y-6">
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Report Information
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Year</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {reportData?.year}
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Semester</dt>
                      <dd className="mt-1 text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {reportData?.semester ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                            {reportData.semester}
                          </span>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">All Semesters</span>
                        )}
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</dt>
                      <dd className="mt-1 text-sm flex items-center">
                        <Layers className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {reportData?.program ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            {reportData.program}
                          </span>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">All Programs</span>
                        )}
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-1 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created On</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(reportData?.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {reportData?.generatedBy || 'Unknown'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-100 dark:border-yellow-800"
              >
                <h3 className="text-base font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5" />
                  Note About Editing Reports
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You can only edit the notes/description of an existing report. To change year, semester, or program criteria, you will need to create a new report.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditReport;