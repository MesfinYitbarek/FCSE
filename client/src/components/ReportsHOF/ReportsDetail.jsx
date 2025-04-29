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
  Clock,
  Layers,
  User,
  Bookmark,
  FileBarChart2,
  FileCheck2,
  Search,
  Info
} from 'lucide-react';
import api from '@/utils/api';

const ReportsDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);

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

  useEffect(() => {
    if (report && report.assignments) {
      const filtered = report.assignments.map(group => ({
        ...group,
        assignments: group.assignments.filter(assignment => 
          assignment.instructorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(group => group.assignments.length > 0);
      
      setFilteredAssignments(filtered);
    }
  }, [searchTerm, report]);

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
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 dark:text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Report</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/reports')}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <ChevronLeft size={18} className="mr-2" />
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="max-w-md text-center">
          <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Report Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The report you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/reports')}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <ChevronLeft size={18} className="mr-2" />
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back to Reports
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileBarChart2 className="text-indigo-600 dark:text-indigo-400" size={28} />
              {report.program ? `${report.program} Workload Report` : 'Academic Workload Report'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {report.semester} {report.year} • Created on {format(new Date(report.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          
          <CSVLink 
            data={getAssignmentsCsvData()} 
            filename={`${report.program || 'workload'}-report-${report.semester}-${report.year}.csv`}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Download size={18} className="mr-2" />
            Export as CSV
          </CSVLink>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                <User size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructors</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{countUniqueInstructors()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                <Bookmark size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Courses</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{countUniqueCourses()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                <FileCheck2 size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignments</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {report.assignments?.reduce((total, group) => total + group.assignments.length, 0) || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                <Layers size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workload</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{calculateTotalWorkload()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note (if exists) */}
        {report.note && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-8 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start">
              <Info className="flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5 mr-3" size={18} />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Administrator Note</h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">{report.note}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Assignments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Summary */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <Calendar className="text-gray-500 dark:text-gray-400 mr-3" size={18} />
                      <span className="text-gray-700 dark:text-gray-300">Academic Year</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{report.year}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <BookOpen className="text-gray-500 dark:text-gray-400 mr-3" size={18} />
                      <span className="text-gray-700 dark:text-gray-300">Semester</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{report.semester || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <Layers className="text-gray-500 dark:text-gray-400 mr-3" size={18} />
                      <span className="text-gray-700 dark:text-gray-300">Program</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{report.program || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="text-gray-500 dark:text-gray-400 mr-3" size={18} />
                      <span className="text-gray-700 dark:text-gray-300">Generated On</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Groups */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment Groups</h3>
                {report.assignments && report.assignments.length > 0 ? (
                  <ul className="space-y-3">
                    {report.assignments.map((group, index) => (
                      <li key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center">
                          <FileSpreadsheet className="text-indigo-500 dark:text-indigo-400 mr-3" size={16} />
                          <span className="text-gray-700 dark:text-gray-300">Group {index + 1}</span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">
                          {group.assignments.length} assignments
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-400 dark:text-gray-500 mb-3" size={24} />
                    <p className="text-gray-500 dark:text-gray-400">No assignment groups found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search by instructor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <span className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                        Clear
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {filteredAssignments && filteredAssignments.length > 0 ? (
                <div className="space-y-6">
                  {filteredAssignments.map((assignmentGroup, groupIndex) => (
                    <div key={assignmentGroup._id || groupIndex} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Assignment Group {groupIndex + 1}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Assigned by {assignmentGroup.assignedBy} • {format(new Date(assignmentGroup.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructor</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Section Details</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workload</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {assignmentGroup.assignments.map((assignment, assignmentIndex) => (
                              <tr key={assignmentIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900 dark:text-white">{assignment.instructorId?.fullName || 'N/A'}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.instructorId?.email || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900 dark:text-white">{assignment.courseId?.name || 'N/A'}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{assignment.courseId?.code || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-gray-900 dark:text-white">
                                    <span className="font-medium">Section:</span> {assignment.section || 'N/A'}
                                  </div>
                                  {assignment.NoOfSections && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      <span className="font-medium">Number of Sections:</span> {assignment.NoOfSections}
                                    </div>
                                  )}
                                  {assignment.labDivision && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      <span className="font-medium">Lab Division:</span> {assignment.labDivision}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
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
                <div className="bg-white dark:bg-gray-800 p-12 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {searchTerm ? 'No matching assignments found' : 'No assignments found'}
                  </h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {searchTerm 
                      ? 'Try a different search term' 
                      : 'This report doesn\'t contain any assignment data.'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsDetail;