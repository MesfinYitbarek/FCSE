import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
        <p className="text-gray-600">Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center items-center flex-col p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Report</h2>
            <p className="text-gray-600 mb-6 text-center">{error}</p>
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center items-center flex-col p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Report Not Found</h2>
            <p className="text-gray-600 mb-6">The report you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/reports')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <CSVLink 
            data={getAssignmentsCsvData()} 
            filename={`report-${report._id}-assignments.csv`}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export as CSV
          </CSVLink>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {report.program ? `${report.program} Program Report` : 'Academic Report'}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Academic Year</p>
                <p className="text-lg font-semibold text-gray-900">{report.year}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Semester</p>
                <p className="text-lg font-semibold text-gray-900">{report.semester || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Program</p>
                <p className="text-lg font-semibold text-gray-900">{report.program || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Created On</p>
                <p className="text-lg font-semibold text-gray-900">
                  {report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {report.note && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-8 border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notes
            </h3>
            <p className="mt-2 text-sm text-yellow-700">{report.note}</p>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-wrap mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`mr-4 pb-2 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`mr-4 pb-2 text-sm font-medium ${
                activeTab === 'assignments'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`pb-2 text-sm font-medium ${
                activeTab === 'metadata'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }`}
            >
              Report Metadata
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Assignments</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {report.assignments?.reduce((total, group) => total + group.assignments.length, 0) || 0}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Instructors</dt>
                    <dd className="text-sm font-semibold text-gray-900">{countUniqueInstructors()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Courses</dt>
                    <dd className="text-sm font-semibold text-gray-900">{countUniqueCourses()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Workload</dt>
                    <dd className="text-sm font-semibold text-gray-900">{calculateTotalWorkload()}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generated By</h3>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-lg">
                    {report.generatedBy.charAt(0) || '?'}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{report.generatedBy || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{report.generatedBy || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created on {report.createdAt ? format(new Date(report.createdAt), 'MMMM d, yyyy') : 'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Groups</h3>
                {report.assignments && report.assignments.length > 0 ? (
                  <ul className="space-y-3">
                    {report.assignments.map((group, index) => (
                      <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Group {index + 1}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {group.assignments.length} assignments
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No assignment groups found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              {report.assignments && report.assignments.length > 0 ? (
                <div className="space-y-8">
                  {report.assignments.map((assignmentGroup, groupIndex) => (
                    <div key={assignmentGroup._id || groupIndex} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-indigo-50 p-4 border-b border-indigo-200">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Assignment Group {groupIndex + 1}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">Assigned By:</span>
                            <span className="ml-2 text-sm font-medium text-gray-700">{assignmentGroup.assignedBy}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">Date:</span>
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {assignmentGroup.createdAt ? format(new Date(assignmentGroup.createdAt), 'MMM d, yyyy') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-6">Instructor</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Course</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Section</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">No. of Sections</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Lab Division</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Workload</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {assignmentGroup.assignments.map((assignment, assignmentIndex) => (
                              <tr key={assignmentIndex} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                  <div className="font-medium text-gray-900">{assignment.instructorId?.fullName || 'N/A'}</div>
                                  <div className="text-gray-500 text-xs">{assignment.instructorId?.email || 'N/A'}</div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  <div className="font-medium text-gray-900">{assignment.courseId?.name || 'N/A'}</div>
                                  <div className="text-gray-500 text-xs">{assignment.courseId?.code || 'N/A'}</div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{assignment.section || 'N/A'}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{assignment.NoOfSections || 'N/A'}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{assignment.labDivision || 'N/A'}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                <div className="bg-white p-12 rounded-lg border border-gray-200 shadow-sm text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No assignments found</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">This report doesn't have any assignments attached.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Report Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Report ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">{report._id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created By</dt>
                    <dd className="mt-1 text-sm text-gray-900">{report.generatedBy|| 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created On</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.createdAt ? format(new Date(report.createdAt), 'MMMM d, yyyy h:mm a') : 'N/A'}
                    </dd>
                  </div>
                </dl>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Updated On</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.updatedAt ? format(new Date(report.updatedAt), 'MMMM d, yyyy h:mm a') : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Assignment Groups</dt>
                    <dd className="mt-1 text-sm text-gray-900">{report.assignments?.length || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Individual Assignments</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {report.assignments?.reduce((total, group) => total + group.assignments.length, 0) || 0}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsDetail;