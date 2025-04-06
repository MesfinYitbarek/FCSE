import  { useState, useEffect } from 'react';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12 text-red-500">{error}</div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">Report not found</div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/reports')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <CSVLink 
            data={getAssignmentsCsvData()} 
            filename={`report-${report._id}-assignments.csv`}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Assignments as CSV
          </CSVLink>
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Report Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Academic Year</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">{report.year}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Semester</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">{report.semester || 'N/A'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Program</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">{report.program || 'N/A'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Generated By</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">{report.generatedBy?.name || 'N/A'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Total Assignments</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {report.assignments?.reduce((total, group) => total + group.assignments.length, 0) || 0}
            </p>
          </div>
        </div>
        
        {report.note && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-8 border border-yellow-100">
            <h3 className="text-sm font-medium text-yellow-800">Notes</h3>
            <p className="mt-1 text-sm text-yellow-700">{report.note}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Assignments</h2>
        
        {report.assignments && report.assignments.length > 0 ? (
          <div className="space-y-8">
            {report.assignments.map((assignmentGroup, groupIndex) => (
              <div key={assignmentGroup._id || groupIndex} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Group {groupIndex + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <span className="text-sm text-gray-500">Assigned By:</span>
                      <span className="ml-2 text-sm font-medium">{assignmentGroup.assignedBy}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="ml-2 text-sm font-medium">
                        {assignmentGroup.createdAt ? format(new Date(assignmentGroup.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Instructor</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Course</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Section</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">No. of Sections</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Lab Division</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Workload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {assignmentGroup.assignments.map((assignment, assignmentIndex) => (
                        <tr key={assignmentIndex} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="font-medium text-gray-900">{assignment.instructorId?.fullName || 'N/A'}</div>
                            <div className="text-gray-500">{assignment.instructorId?.email || 'N/A'}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="font-medium text-gray-900">{assignment.courseId?.name || 'N/A'}</div>
                            <div className="text-gray-500">{assignment.courseId?.code || 'N/A'}</div>
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
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-sm text-gray-500">This report doesn't have any assignments attached.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDetail;