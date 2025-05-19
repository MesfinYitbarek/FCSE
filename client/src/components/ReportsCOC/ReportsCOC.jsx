import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { 
  Loader2, 
  AlertCircle,
  BookOpen, 
  ArrowLeft, 
  Save,
  PlusCircle,
  Calendar,
  Layers,
  FileText,
  MessageSquare,
  Clock,
  Info,
  User
} from 'lucide-react';

const CreateReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    semester: '',
    program: '',
    note: ''
  });
  
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dataStats, setDataStats] = useState({
    totalAssignments: 0,
    totalInstructors: 0,
    availablePrograms: []
  });
  
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        setLoading(true);
        const response = await api.get('/assignments');
        
        // Get unique years and sort them
        const years = [...new Set(response.data.map(a => a.year))].sort((a, b) => b - a);
        setAvailableYears(years);
        
        // Get unique programs
        const programs = [...new Set(response.data.map(a => a.program).filter(Boolean))];
        
        // Get total assignments and instructors
        const totalAssignments = response.data.length;
        const uniqueInstructors = new Set(response.data.map(a => a.instructorId?._id).filter(Boolean)).size;
        
        setDataStats({
          totalAssignments,
          totalInstructors: uniqueInstructors,
          availablePrograms: programs
        });
        
        if (years.length > 0) {
          setFormData(prev => ({ ...prev, year: years[0] }));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch available academic years');
        setLoading(false);
      }
    };
    
    fetchAvailableYears();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await api.post('/reports', formData);
      // Navigate to the correct route for report details
      navigate(`/reportsCOC/${response.data.reportId}`, { 
        state: { message: 'Report created successfully!' } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
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
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading available academic years...</p>
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
                  <Link to="/reportsCOC" className="mr-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <PlusCircle className="text-indigo-600 dark:text-indigo-400" />
                      Create New Report
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Generate a new report for academic workload assignments
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
                    Report Configuration
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Define the parameters for your new report
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                  {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-4 rounded-md">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                        Academic Year <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
                      >
                        {availableYears.length === 0 ? (
                          <option value="">No academic years available</option>
                        ) : (
                          availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))
                        )}
                      </select>
                      {availableYears.length === 0 && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                          No academic years found. Please create assignments first.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                        <Layers size={16} className="text-gray-500 dark:text-gray-400" />
                        Program (Optional)
                      </label>
                      <select
                        id="program"
                        name="program"
                        value={formData.program}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
                      >
                        <option value="">All Programs</option>
                        {dataStats.availablePrograms.length > 0 ? (
                          dataStats.availablePrograms.map(program => (
                            <option key={program} value={program}>{program}</option>
                          ))
                        ) : (
                          <>
                            <option value="Regular">Regular</option>
                            <option value="Common">Common</option>
                            <option value="Extension">Extension</option>
                            <option value="Summer">Summer</option>
                          </>
                        )}
                      </select>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Leave empty to include all programs in the report
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                        <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                        Semester (Optional)
                      </label>
                      <select
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
                      >
                        <option value="">All Semesters</option>
                        <option value="Regular 1">Regular 1</option>
                        <option value="Regular 2">Regular 2</option>
                        <option value="Summer">Summer</option>
                        <option value="Extension 1">Extension 1</option>
                        <option value="Extension 2">Extension 2</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Leave empty to include all semesters in the report
                      </p>
                    </div>
                    
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
                        rows={4}
                        placeholder="Add any additional notes or context for this report"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Use this field to add any relevant information about this report or its contents.
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-5">
                      <Link to="/reports">
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
                        disabled={submitting || availableYears.length === 0}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="-ml-1 mr-2 h-4 w-4" />
                            Create Report
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
            
            {/* Right column - Info and Stats */}
            <div className="mt-5 md:mt-0 space-y-6">
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Available Data
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Years</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {availableYears.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {availableYears.map(year => (
                              <span key={year} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {year}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-red-500 dark:text-red-400">No years available</span>
                        )}
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assignments</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <BookOpen className="h-4 w-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                        {dataStats.totalAssignments}
                      </dd>
                    </div>
                    
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Instructors</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                        {dataStats.totalInstructors}
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
              
              
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateReport;