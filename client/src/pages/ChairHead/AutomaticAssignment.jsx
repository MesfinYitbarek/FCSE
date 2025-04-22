import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Loader2, AlertCircle, Check, RefreshCw, Download, 
  BookOpen, User, Mail, Hash, Layers, Divide, Clock,
  ChevronRight, ChevronDown
} from "lucide-react";
import { toast } from "react-hot-toast";

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
  const [expandedRows, setExpandedRows] = useState({});

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
      toast.success("Automatic assignment completed successfully!");
      
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (error) {
      setError(error.response?.data?.message || "Error in automatic assignment. Please try again.");
      toast.error(error.response?.data?.message || "Error in automatic assignment. Please try again.");
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
    
    toast.success("CSV file exported successfully");
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows({
      ...expandedRows,
      [index]: !expandedRows[index]
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Automatic Course Assignment</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Generate optimal course assignments based on preferences and workload
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={fetchAutomaticAssignments}
            disabled={loading}
            className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {assignedCourses.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </button>
          )}
          
          <button
            onClick={handleAutoAssign}
            disabled={generating}
            className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-indigo-400 dark:disabled:bg-indigo-700/50 transition-colors text-sm"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                <span>Run Assignment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {generating && (
        <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800/30 text-sm">
          <Loader2 className="w-5 h-5 mr-2.5 animate-spin flex-shrink-0" />
          <div>
            <p className="font-medium">Generating optimal assignments</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-300">This may take a few moments depending on the complexity of preferences</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg border border-green-200 dark:border-green-800/30 text-sm">
          <Check className="w-5 h-5 mr-2.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800/30 text-sm">
          <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {assignedCourses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center text-indigo-700 dark:text-indigo-400">
              <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-lg font-bold">{stats.totalCourses}</span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 mt-1">Total Courses</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800/30">
            <div className="flex items-center text-green-700 dark:text-green-400">
              <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-lg font-bold">{stats.assignedCourses}</span>
            </div>
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-300 mt-1">Assigned Courses</p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-100 dark:border-yellow-800/30">
            <div className="flex items-center text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-lg font-bold">{stats.unassignedCourses}</span>
            </div>
            <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-300 mt-1">Unassigned</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center text-purple-700 dark:text-purple-400">
              <User className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-lg font-bold">{stats.instructors}</span>
            </div>
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-300 mt-1">Instructors</p>
          </div>
        </div>
      )}

      {/* Assignment Table - Desktop View (Hidden on mobile) */}
      {assignedCourses.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300 divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-2 py-2 font-medium">
                      <div className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">Instructor</span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      <div className="flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">Email</span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      <div className="flex items-center">
                        <BookOpen className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">Course</span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      <div className="flex items-center">
                        <Hash className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">Code</span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      <div className="flex items-center">
                        <Layers className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">Section</span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium hidden md:table-cell">
                      <div className="flex items-center">
                        <Divide className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">Lab Division</span>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">Workload</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {assignedCourses.map((assignment, index) => (
                    <tr 
                      key={index} 
                      className={`${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                      } ${
                        assignment.instructorName === 'Unassigned' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      } hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                    >
                      <td className="px-2 py-2 font-medium">
                        {assignment.instructorName === 'Unassigned' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                            Unassigned
                          </span>
                        ) : (
                          <span className="truncate block max-w-[120px] xl:max-w-full">{assignment.instructorName}</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-gray-600 dark:text-gray-400">
                        <span className="truncate block max-w-[120px] xl:max-w-full">{assignment.instructorEmail}</span>
                      </td>
                      <td className="px-2 py-2">
                        <span className="truncate block max-w-[120px] xl:max-w-full">{assignment.courseName}</span>
                      </td>
                      <td className="px-2 py-2 font-medium">
                        {assignment.courseCode}
                      </td>
                      <td className="px-2 py-2">
                        {assignment.section}
                      </td>
                      <td className="px-2 py-2 hidden md:table-cell">
                        {assignment.labDivision !== 'No' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                            {assignment.labDivision}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-2 py-2 font-medium whitespace-nowrap">
                        {assignment.workload} hrs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Mobile Table View (Cards) */}
          <div className="sm:hidden space-y-2">
            {assignedCourses.map((assignment, index) => (
              <div 
                key={index} 
                className={`border rounded-lg overflow-hidden ${
                  assignment.instructorName === 'Unassigned' 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div 
                  className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 cursor-pointer"
                  onClick={() => toggleRowExpansion(index)}
                >
                  <div className="flex items-center">
                    <span className="font-medium text-xs truncate max-w-[200px] text-gray-800 dark:text-gray-200">
                      {assignment.courseName} ({assignment.courseCode})
                    </span>
                  </div>
                  {expandedRows[index] ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                
                <div className={`px-3 py-2 text-xs space-y-1 ${expandedRows[index] ? 'block' : 'hidden'}`}>
                  <div className="grid grid-cols-3">
                    <div className="col-span-1 text-gray-500 dark:text-gray-400 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Instructor
                    </div>
                    <div className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                      {assignment.instructorName === 'Unassigned' ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                          Unassigned
                        </span>
                      ) : assignment.instructorName}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3">
                    <div className="col-span-1 text-gray-500 dark:text-gray-400 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </div>
                    <div className="col-span-2 truncate text-gray-700 dark:text-gray-300">
                      {assignment.instructorEmail}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3">
                    <div className="col-span-1 text-gray-500 dark:text-gray-400 flex items-center">
                      <Layers className="w-3 h-3 mr-1" />
                      Section
                    </div>
                    <div className="col-span-2 text-gray-700 dark:text-gray-300">
                      {assignment.section}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3">
                    <div className="col-span-1 text-gray-500 dark:text-gray-400 flex items-center">
                      <Divide className="w-3 h-3 mr-1" />
                      Lab Division
                    </div>
                    <div className="col-span-2 text-gray-700 dark:text-gray-300">
                      {assignment.labDivision !== 'No' ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                          {assignment.labDivision}
                        </span>
                      ) : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3">
                    <div className="col-span-1 text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Workload
                    </div>
                    <div className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                      {assignment.workload} hrs
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <Loader2 className="w-10 h-10 text-indigo-500 dark:text-indigo-400 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading assignments...</p>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-10 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <BookOpen className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No assignments available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate automatic assignments to see results here
          </p>
        </div>
      )}
    </div>
  );
};

export default AutomaticAssignment;