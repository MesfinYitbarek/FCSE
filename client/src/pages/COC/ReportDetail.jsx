import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { 
  Edit, 
  ArrowLeft, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Info,
  Calendar,
  BookOpen,
  User,
  Clock,
  FileText,
  Layers,
  Download,
  ChevronDown,
  CheckCircle,
  Users,
  BarChart2,
  Bell,
  PlusCircle,
  School,
  Menu
} from 'lucide-react';

const ReportDetailCOC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reports/${id}`);
        setReport(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching report details');
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);
  
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/reports/${id}`);
      navigate('/reports', { state: { message: 'Report deleted successfully' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };
  
  // Group assignments by instructor
  const assignmentsByInstructor = report?.assignments?.reduce((acc, assignment) => {
    assignment.assignments.forEach(assign => {
      const instructorId = assign.instructorId._id;
      if (!acc[instructorId]) {
        acc[instructorId] = {
          instructor: assign.instructorId,
          assignments: []
        };
      }
      acc[instructorId].assignments.push({
        ...assign,
        course: assign.courseId,
        assignment: assignment
      });
    });
    return acc;
  }, {}) || {};

  // Prepare all assignments (flat list) for the "All Assignments" tab
  const allAssignments = report?.assignments?.flatMap(assignment => 
    assignment.assignments.map(assign => ({
      ...assign,
      course: assign.courseId,
      assignment: assignment,
      instructorName: assign.instructorId.name
    }))
  ) || [];

  // Calculate total workload
  const totalWorkload = allAssignments.reduce((total, a) => total + a.workload, 0);
  
  // Calculate unique courses
  const uniqueCourses = new Set(allAssignments.map(a => a.course?.code)).size;
  
  // Count total instructors
  const totalInstructors = Object.keys(assignmentsByInstructor).length;

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" size={40} />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading report details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
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
  
  if (!report) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-700 p-5 rounded-lg shadow">
            <div className="flex items-center">
              <Info className="text-yellow-500 dark:text-yellow-400 mr-3" size={24} />
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">Report not found</p>
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
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <Link to="/reports" className="mr-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="text-indigo-600 dark:text-indigo-400" />
                      Report for {report.year}
                      {report.semester && <span> • {report.semester}</span>}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created {new Date(report.createdAt).toLocaleDateString()} by {report.generatedBy || 'System'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Desktop actions */}
              <div className="hidden md:flex md:items-center md:space-x-3">
                <Link to={`/reports/${id}/edit`}>
                  <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition shadow-sm">
                    <Edit className="mr-2" size={16} />
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:outline-none transition"
                >
                  <Trash2 className="mr-2" size={16} />
                  Delete
                </button>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Mobile actions dropdown */}
            {mobileMenuOpen && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 absolute right-4 z-10 mt-2 w-48">
                <div className="py-1">
                  <Link to={`/reports/${id}/edit`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex items-center">
                      <Edit className="mr-2" size={16} />
                      Edit Report
                    </div>
                  </Link>
                  <button 
                    onClick={() => {
                      setConfirmDelete(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <Trash2 className="mr-2" size={16} />
                      Delete Report
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Delete confirmation dialog */}
            {confirmDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                  <div className="flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                    <AlertCircle size={48} />
                  </div>
                  <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">Delete Report</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                    Are you sure you want to delete this report? This action cannot be undone.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition flex items-center"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2" size={16} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tabs navigation */}
            <div className="mt-5 border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('instructors')}
                  className={`${
                    activeTab === 'instructors'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Users className="mr-2 h-5 w-5" />
                  By Instructor
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`${
                    activeTab === 'assignments'
                      ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Layers className="mr-2 h-5 w-5" />
                  All Assignments
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-md p-3">
                        <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Instructors</p>
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">{totalInstructors}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 rounded-md p-3">
                        <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Courses</p>
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">{uniqueCourses}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 rounded-md p-3">
                        <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workload</p>
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">{totalWorkload}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Report details */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Report Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Details and metadata about this report.
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Year</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {report.year}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Semester</dt>
                      <dd className="mt-1 text-sm flex items-center">
                        <School className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {report.semester ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                            {report.semester}
                          </span>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">All Semesters</span>
                        )}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</dt>
                      <dd className="mt-1 text-sm flex items-center">
                        <Layers className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {report.program ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            {report.program}
                          </span>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">All Programs</span>
                        )}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {report.generatedBy || 'System'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created On</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {new Date(report.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                        {new Date(report.updatedAt || report.createdAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Notes section */}
              {report.note && (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                      <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Notes
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{report.note}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Instructors Tab */}
          {activeTab === 'instructors' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {Object.keys(assignmentsByInstructor).length === 0 ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg flex items-center border border-indigo-100 dark:border-indigo-800">
                  <Info className="text-indigo-600 dark:text-indigo-400 mr-3" size={20} />
                  <p className="text-indigo-700 dark:text-indigo-300">No instructor assignments found in this report</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.values(assignmentsByInstructor).map(({ instructor, assignments }, index) => (
                    <div 
                      key={instructor._id} 
                      className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/30 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium text-lg">
                                {instructor.fullName?.charAt(0) || 'U'}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                {instructor.fullName || 'Unknown Instructor'}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {instructor.email || 'No email available'}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 rounded-lg px-3 py-1 shadow-sm border border-gray-200 dark:border-gray-600">
                            Total Workload: <span className="font-semibold text-gray-700 dark:text-gray-300">{assignments.reduce((total, a) => total + a.workload, 0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile view */}
                      <div className="md:hidden px-4 py-4 space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
                        {assignments.map((assignment, idx) => (
                          <div key={idx} className="pt-4 first:pt-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                  {assignment.course?.name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{assignment.course?.code}</p>
                              </div>
                              <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full px-2.5 py-0.5">
                                Workload: {assignment.workload}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Section:</span>
                                <span className="ml-1.5 text-gray-700 dark:text-gray-300 font-medium">{assignment.section || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Lab:</span>
                                <span className="ml-1.5 text-gray-700 dark:text-gray-300 font-medium">{assignment.labDivision || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                                <span className="ml-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                    {assignment.assignment.semester}
                                  </span>
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Program:</span>
                                <span className="ml-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    {assignment.assignment.program}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Desktop view */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lab</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Program</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Workload</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {assignments.map((assignment, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center">
                                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.course?.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.course?.code}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.section || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{assignment.labDivision || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                    {assignment.assignment.program}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                    {assignment.assignment.semester}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{assignment.workload}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          
          {/* All Assignments Tab */}
          {activeTab === 'assignments' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {allAssignments.length === 0 ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg flex items-center border border-indigo-100 dark:border-indigo-800">
                  <Info className="text-indigo-600 dark:text-indigo-400 mr-3" size={20} />
                  <p className="text-indigo-700 dark:text-indigo-300">No assignments found in this report</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        All Assignments
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        Total assignments: <span className="font-semibold">{allAssignments.length}</span>
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile view */}
                  <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                    {allAssignments.map((assignment, idx) => (
                      <div key={idx} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{assignment.course?.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{assignment.course?.code}</p>
                          </div>
                          <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full px-2.5 py-0.5">
                            WL: {assignment.workload}
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                          {assignment.instructorId.fullName}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Section:</span>
                            <span className="ml-1.5 text-gray-700 dark:text-gray-300">{assignment.section || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Lab:</span>
                            <span className="ml-1.5 text-gray-700 dark:text-gray-300">{assignment.labDivision || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Semester:</span>
                            <span className="ml-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                {assignment.assignment.semester}
                              </span>
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Program:</span>
                            <span className="ml-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                {assignment.assignment.program}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Total Workload:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{totalWorkload}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop view */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section/Lab</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Program</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Workload</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {allAssignments.map((assignment, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.course?.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.course?.code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {assignment.instructorId.fullName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{assignment.instructorId.fullName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">Section: {assignment.section || 'N/A'}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Lab: {assignment.labDivision || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                {assignment.assignment.program}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                {assignment.assignment.semester}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{assignment.workload}</td>
                          </tr>
                        ))}
                        
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                            Total Workload:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                            {totalWorkload}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailCOC;