import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Loader2, AlertCircle, Check, RefreshCw, Download, 
  BookOpen, User, Mail, Hash, Layers, Divide, Clock
} from "lucide-react";

const AutomaticAssignment = ({ fetchAssignments, filters }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    assignedCourses: 0,
    unassignedCourses: 0,
    instructors: 0
  });

  useEffect(() => {
    if (filters) {
      fetchAutomaticAssignments();
    }
  }, [filters]);

  const fetchAutomaticAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        year: filters.year,
        semester: filters.semester,
        program: "Regular",
        assignedBy: user.chair,
      }).toString();

      const { data } = await api.get(`/assignments/automatic?${queryParams}`);
      
      const formattedAssignments = data.assignments.flatMap((assignment) =>
        assignment.assignments.map((a) => ({
          instructorName: a.instructorId?.fullName || "Unassigned",
          instructorEmail: a.instructorId?.email || "N/A",
          courseName: a.courseId?.name || "Unknown Course",
          courseCode: a.courseId?.code || "N/A",
          section: a.section || "N/A",
          labDivision: a.labDivision || "No",
          workload: a.workload || 0,
        }))
      );

      setAssignedCourses(formattedAssignments);
      
      const instructorCount = new Set(formattedAssignments.map(a => a.instructorName)).size;
      const totalCourses = formattedAssignments.length;
      const unassignedCount = formattedAssignments.filter(a => a.instructorName === "Unassigned").length;
      
      setStats({
        totalCourses,
        assignedCourses: totalCourses - unassignedCount,
        unassignedCourses: unassignedCount,
        instructors: instructorCount
      });
      
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching automatic assignments.");
      console.error("Error fetching automatic assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    setGenerating(true);
    setSuccess(null);
    setError(null);
    
    try {
      await api.post("/assignments/automatic", {
        year: filters.year,
        semester: filters.semester,
        program: "Regular",
        assignedBy: user.chair,
      });
      
      await fetchAssignments();
      await fetchAutomaticAssignments();
      
      setSuccess("Automatic assignment completed successfully!");
      
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (error) {
      setError(error.response?.data?.message || "Error in automatic assignment. Please try again.");
      console.error("Error in automatic assignment:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Instructor", "Email", "Course", "Code", "Section", "Lab Division", "Workload"];
    const rows = assignedCourses.map(assignment => [
      assignment.instructorName,
      assignment.instructorEmail,
      assignment.courseName,
      assignment.courseCode,
      assignment.section,
      assignment.labDivision,
      assignment.workload
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `automatic-assignments-${filters.year}-${filters.semester}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Automatic Course Assignment</h2>
          <p className="text-gray-500 text-sm mt-1">
            Generate optimal course assignments based on preferences and workload
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchAutomaticAssignments}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {assignedCourses.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
          
          <button
            onClick={handleAutoAssign}
            disabled={generating}
            className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                <span>Run Automatic Assignment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {generating && (
        <div className="flex items-center bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-200">
          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          <div>
            <p className="font-medium">Generating optimal assignments</p>
            <p className="text-sm text-blue-600">This may take a few moments depending on the complexity of preferences</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          <Check className="w-5 h-5 mr-3" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {assignedCourses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center text-blue-700">
              <BookOpen className="w-5 h-5 mr-2" />
              <span className="text-lg font-bold">{stats.totalCourses}</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">Total Courses</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center text-green-700">
              <Check className="w-5 h-5 mr-2" />
              <span className="text-lg font-bold">{stats.assignedCourses}</span>
            </div>
            <p className="text-sm text-green-600 mt-1">Assigned Courses</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <div className="flex items-center text-yellow-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-lg font-bold">{stats.unassignedCourses}</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">Unassigned Courses</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center text-purple-700">
              <User className="w-5 h-5 mr-2" />
              <span className="text-lg font-bold">{stats.instructors}</span>
            </div>
            <p className="text-sm text-purple-600 mt-1">Instructors</p>
          </div>
        </div>
      )}

      {/* Assignment Table */}
      {assignedCourses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 shadow-sm rounded-lg overflow-hidden">
            <thead className="text-xs uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Instructor
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Course
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    Code
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <div className="flex items-center">
                    <Layers className="w-4 h-4 mr-1" />
                    Section
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <div className="flex items-center">
                    <Divide className="w-4 h-4 mr-1" />
                    Lab Division
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Workload
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {assignedCourses.map((assignment, index) => (
                <tr 
                  key={index} 
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${
                    assignment.instructorName === 'Unassigned' ? 'bg-yellow-50' : ''
                  } border-b hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-4 py-4 font-medium">
                    {assignment.instructorName === 'Unassigned' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Unassigned
                      </span>
                    ) : (
                      assignment.instructorName
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {assignment.instructorEmail}
                  </td>
                  <td className="px-4 py-4">
                    {assignment.courseName}
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {assignment.courseCode}
                  </td>
                  <td className="px-4 py-4">
                    {assignment.section}
                  </td>
                  <td className="px-4 py-4">
                    {assignment.labDivision !== 'No' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {assignment.labDivision}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {assignment.workload} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate automatic assignments to see results here
          </p>
        </div>
      )}
    </div>
  );
};

export default AutomaticAssignment;