import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
  Edit, 
  ArrowLeft, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Info,
  Calendar,
  Bookmark,
  User,
  Clock
} from 'lucide-react';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('instructor');
  
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
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        setDeleting(true);
        await api.delete(`/reports/${id}`);
        navigate('/reports', { state: { message: 'Report deleted successfully' } });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete report');
        setDeleting(false);
      }
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-medium">Loading report details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-md shadow">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={24} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <div className="mt-4">
            <Link to="/reports" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              <ArrowLeft className="mr-2" size={16} />
              Back to Reports
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-md shadow">
          <div className="flex items-center">
            <Info className="text-yellow-500 mr-3" size={24} />
            <p className="text-yellow-700 font-medium">Report not found</p>
          </div>
          <div className="mt-4">
            <Link to="/reports" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              <ArrowLeft className="mr-2" size={16} />
              Back to Reports
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container max-w-6xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Assignment Report</h1>
            <p className="text-gray-600">
              {report.program ? `${report.program} Program` : 'All Programs'} • 
              {report.semester ? ` ${report.semester} Semester` : ' All Semesters'} • 
              {` Year ${report.year}`}
            </p>
          </div>
          <div className="flex gap-2 self-end md:self-auto">
            <Link to={`/reports/${id}/edit`}>
              <button className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition shadow-sm">
                <Edit className="mr-2" size={16} />
                Edit Report
              </button>
            </Link>
            <Link to="/reports">
              <button className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition shadow-sm">
                <ArrowLeft className="mr-2" size={16} />
                Back to Reports
              </button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Report Information</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Calendar className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium">{report.year}</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Bookmark className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="font-medium">
                    {report.program ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {report.program}
                      </span>
                    ) : (
                      <span className="text-gray-700">All Programs</span>
                    )}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Bookmark className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-medium">
                    {report.semester ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {report.semester}
                      </span>
                    ) : (
                      <span className="text-gray-700">All Semesters</span>
                    )}
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Additional Information</h2>
            
            <div className="mb-5">
              <h3 className="text-sm text-gray-500 mb-2">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                {report.note ? (
                  <p className="text-gray-700">{report.note}</p>
                ) : (
                  <p className="text-gray-500 italic">No additional notes provided</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-md text-center">
                <p className="text-3xl font-bold text-blue-700">{report.assignments?.length || 0}</p>
                <p className="text-sm text-blue-700">Assignments</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md text-center">
                <p className="text-3xl font-bold text-green-700">{Object.keys(assignmentsByInstructor).length}</p>
                <p className="text-sm text-green-700">Instructors</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-start space-x-3 border-t pt-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">{report.generatedBy || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button 
                className={`py-3 px-6 font-medium flex-shrink-0 ${activeTab === 'instructor' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('instructor')}
              >
                Grouped by Instructor
              </button>
              <button 
                className={`py-3 px-6 font-medium flex-shrink-0 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('all')}
              >
                All Assignments
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {activeTab === 'instructor' ? (
              <>
                {Object.keys(assignmentsByInstructor).length === 0 ? (
                  <div className="bg-blue-50 p-4 rounded-md flex items-center">
                    <Info className="text-blue-500 mr-3" size={20} />
                    <p className="text-blue-700">No assignments found in this report</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.values(assignmentsByInstructor).map(({ instructor, assignments }) => (
                      <div key={instructor._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4">
                          <h3 className="text-lg font-semibold">{instructor.fullName || 'Unknown Instructor'}</h3>
                          <p className="text-gray-500 text-sm">{instructor.email}</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab Division</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workload</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {assignments.map((assignment, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {assignment.course?.code} - {assignment.course?.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.section || 'N/A'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.labDivision || 'N/A'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.workload}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {assignment.assignment.semester}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {assignment.assignment.program}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50">
                                <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">Total Workload:</td>
                                <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                  {assignments.reduce((total, a) => total + a.workload, 0)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="overflow-x-auto">
                {allAssignments.length === 0 ? (
                  <div className="bg-blue-50 p-4 rounded-md flex items-center">
                    <Info className="text-blue-500 mr-3" size={20} />
                    <p className="text-blue-700">No assignments found in this report</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab Division</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workload</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allAssignments.map((assignment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{assignment.instructorId.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {assignment.course?.code} - {assignment.course?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.section || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.labDivision || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.workload}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {assignment.assignment.semester}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {assignment.assignment.program}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">Total Workload:</td>
                        <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                          {allAssignments.reduce((total, a) => total + a.workload, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2" size={16} />
                Delete Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;