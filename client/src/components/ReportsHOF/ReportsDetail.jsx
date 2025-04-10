import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FileText,
  ChevronLeft,
  Download,
  Loader2,
  AlertTriangle,
  Calendar,
  FileSpreadsheet,
  BookOpen,
  User,
  Users,
  Clock,
  Info,
  Briefcase,
  Layers
} from 'lucide-react';
import api from '@/utils/api';

const ReportsDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/reports/${reportId}`);
        setReport(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch report details. Please try again later.');
        toast.error('Error fetching report details');
        console.error('Error fetching report details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  // Prepare CSV data for assignments
  const getAssignmentsCsvData = () => {
    if (!report || !report.assignments) return [];
    
    return report.assignments.flatMap(assignmentGroup => 
      assignmentGroup.assignments.map(assignment => ({
        'Instructor': assignment.instructorId?.fullName || 'N/A',
        'Instructor Email': assignment.instructorId?.email || 'N/A',
        'Course': assignment.courseId?.name || 'N/A',
        'Course Code': assignment.courseId?.code || 'N/A',
        'Section': assignment.section || 'N/A',
        'Number of Sections': assignment.NoOfSections || 'N/A',
        'Lab Division': assignment.labDivision || 'N/A',
        'Workload': assignment.workload || 'N/A',
        'Chair': assignment.instructorId?.chair || 'N/A',
      }))
    );
  };

  const calculateTotalWorkload = () => {
    if (!report || !report.assignments) return 0;
    
    return report.assignments.reduce((total, group) => {
      return total + group.assignments.reduce((groupTotal, assignment) => {
        return groupTotal + (parseFloat(assignment.workload) || 0);
      }, 0);
    }, 0).toFixed(2);
  };

  const countUniqueInstructors = () => {
    if (!report || !report.assignments) return 0;
    
    const instructorIds = new Set();
    report.assignments.forEach(group => {
      group.assignments.forEach(assignment => {
        if (assignment.instructorId?._id) {
          instructorIds.add(assignment.instructorId._id);
        }
      });
    });
    
    return instructorIds.size;
  };

  const countUniqueCourses = () => {
    if (!report || !report.assignments) return 0;
    
    const courseIds = new Set();
    report.assignments.forEach(group => {
      group.assignments.forEach(assignment => {
        if (assignment.courseId?._id) {
          courseIds.add(assignment.courseId._id);
        }
      });
    });
    
    return courseIds.size;
  };

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <Loader2 size={36} className="animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto pb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center items-center flex-col p-8">
              <AlertTriangle size={48} className="text-red-500 dark:text-red-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Report</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{error}</p>
              <button
                onClick={() => navigate('/reports')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ChevronLeft size={18} className="mr-2" />
                Back to Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto pb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center items-center flex-col p-8">
              <FileText size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Report Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">The report you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => navigate('/reports')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ChevronLeft size={18} className="mr-2" />
                Back to Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto pb-6">
        <motion.div 
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <ChevronLeft size={16} className="mr-2" />
              Back
            </button>

            <CSVLink 
              data={getAssignmentsCsvData()} 
              filename={`report-${report._id}-assignments.csv`}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Download size={16} className="mr-2" />
              Export as CSV
            </CSVLink>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
            {report.program ? `${report.program} Program Report` : 'Academic Report'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-md p-2.5 text-indigo-600 dark:text-indigo-400">
                  <Calendar size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Academic Year</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{report.year}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-md p-2.5 text-blue-600 dark:text-blue-400">
                  <BookOpen size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Semester</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{report.semester || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 rounded-md p-2.5 text-green-600 dark:text-green-400">
                  <Layers size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{report.program || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 rounded-md p-2.5 text-purple-600 dark:text-purple-400">
                  <Clock size={20} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created On</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {report.note && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-8 border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                <Info size={16} />
                Notes
              </h3>
              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">{report.note}</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex flex-wrap mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`mr-4 pb-2 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 border-b-2 border-transparent'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`mr-4 pb-2 text-sm font-medium ${
                  activeTab === 'assignments'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 border-b-2 border-transparent'
                }`}
              >
                Assignments
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`pb-2 text-sm font-medium ${
                  activeTab === 'metadata'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 border-b-2 border-transparent'
                }`}
              >
                Report Metadata
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Summary</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assignments</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                        {report.assignments?.reduce((total, group) => total + group.assignments.length, 0) || 0}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Instructors</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{countUniqueInstructors()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{countUniqueCourses()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workload</dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{calculateTotalWorkload()}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Generated By</h3>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium text-lg">
                      {report.generatedBy?.charAt(0) || '?'}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{report.generatedBy || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Created on {report.createdAt ? format(new Date(report.createdAt), 'MMMM d, yyyy') : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignment Groups</h3>
                  {report.assignments && report.assignments.length > 0 ? (
                    <ul className="space-y-3">
                      {report.assignments.map((group, index) => (
                        <li key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Group {index + 1}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                            {group.assignments.length} assignments
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No assignment groups found</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div>
                {report.assignments && report.assignments.length > 0 ? (
                  <div className="space-y-8">
                    {report.assignments.map((assignmentGroup, groupIndex) => (
                      <div key={assignmentGroup._id || groupIndex} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 border-b border-indigo-200 dark:border-indigo-800">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet size={18} className="text-indigo-600 dark:text-indigo-400" />
                            Assignment Group {groupIndex + 1}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Assigned By:</span>
                              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{assignmentGroup.assignedBy}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Date:</span>
                              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {assignmentGroup.createdAt ? format(new Date(assignmentGroup.createdAt), 'MMM d, yyyy') : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mobile view */}
                        <div className="md:hidden">
                          {assignmentGroup.assignments.map((assignment, assignmentIndex) => (
                            <div key={assignmentIndex} className="p-4 border-b border-gray-200 dark:border-gray-600 last:border-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{assignment.instructorId?.fullName || 'N/A'}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.instructorId?.email || 'N/A'}</p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                  WL: {assignment.workload || 0}
                                </span>
                              </div>
                              
                              <div className="mt-3 bg-gray-50 dark:bg-gray-600 p-3 rounded-lg">
                                <div className="mb-1">
                                  <span className="font-medium text-gray-900 dark:text-white">{assignment.courseId?.name || 'N/A'}</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{assignment.courseId?.code || 'N/A'}</div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                  <div>Section: {assignment.section || 'N/A'}</div>
                                  <div>No. of Sections: {assignment.NoOfSections || 'N/A'}</div>
                                  <div>Lab Division: {assignment.labDivision || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Desktop view */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-600">
                              <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Instructor</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Course</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Section</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">No. of Sections</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Lab Division</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Workload</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-700">
                              {assignmentGroup.assignments.map((assignment, assignmentIndex) => (
                                <tr key={assignmentIndex} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150">
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                    <div className="font-medium text-gray-900 dark:text-white">{assignment.instructorId?.fullName || 'N/A'}</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs">{assignment.instructorId?.email || 'N/A'}</div>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <div className="font-medium text-gray-900 dark:text-white">{assignment.courseId?.name || 'N/A'}</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs">{assignment.courseId?.code || 'N/A'}</div>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{assignment.section || 'N/A'}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{assignment.NoOfSections || 'N/A'}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{assignment.labDivision || 'N/A'}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                                      {assignment.workload || 0}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-700 p-12 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No assignments found</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">This report doesn't have any assignments attached.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Report Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Report ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-600 p-2 rounded">{report._id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{report.generatedBy|| 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created On</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {report.createdAt ? format(new Date(report.createdAt), 'MMMM d, yyyy h:mm a') : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated On</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {report.updatedAt ? format(new Date(report.updatedAt), 'MMMM d, yyyy h:mm a') : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assignment Groups</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{report.assignments?.length || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Individual Assignments</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {report.assignments?.reduce((total, group) => total + group.assignments.length, 0) || 0}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsDetail;