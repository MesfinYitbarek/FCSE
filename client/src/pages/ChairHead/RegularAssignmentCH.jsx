import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Calendar, FileText, Search, Loader2, User, BookOpen, Filter,
  AlertCircle, ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

import AutomaticAssignment from "./AutomaticAssignment";
import AssignedCourses from "./AssignedCourses";
import ManualAssignment from "./ManualAsssignment";

const RegularAssignmentCH = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    semester: "Regular 1",
    chair: user?.chair || "",
  });
  const [showOptions, setShowOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("manual"); // "manual", "automatic", "assigned"

  // Fetch assignments when the component mounts or when filters change
  useEffect(() => {
    if (showOptions) {
      fetchAssignments();
    }
  }, [showOptions, filters]);

  // Fetch assignments from the API
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Update API call to include correct filter parameters
      const queryParams = new URLSearchParams({
        year: filters.year,
        semester: filters.semester,
        program: "Regular", // Ensure program is included if needed
        assignedBy: filters.chair // Ensure assignedBy matches backend expectations
      }).toString();
      
      const { data } = await api.get(`/assignments/automatic?${queryParams}`);
      setAssignments(data.assignments); // Adjust response handling
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to fetch assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle search button click
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch preferences based on filters
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/preferences/search-preferences?${queryParams}`);
      setPreferences(response.data);
      setShowOptions(true);
      // Fetch assignments with the same filters
      fetchAssignments();
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setError(error.response?.data?.message || "Failed to fetch preferences. Please try again.");
      toast.error(error.response?.data?.message || "Failed to fetch preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle assignment deletion
  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    setLoading(true);
    try {
      await api.delete(`/assignments/${assignmentId}`);
      fetchAssignments();
      toast.success("Assignment deleted successfully");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Regular Course Assignment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Assign regular courses to instructors based on preferences and workload
          </p>
        </div>

        {/* Search (Filtering Mechanism) */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Academic Year</span>
              </label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-base text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Semester</span>
              </label>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none text-base text-gray-900 dark:text-white"
              >
                <option value="Regular 1">Regular 1</option>
                <option value="Regular 2">Regular 2</option>
                <option value="Summer">Summer</option>
                <option value="Extension">Extension</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-indigo-500" />
                <span>Department Chair</span>
              </label>
              <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-base truncate">
                {user?.chair || 'Loading chair information...'}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-700/50 transition-colors shadow-sm w-full sm:w-auto text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              {loading ? "Searching..." : "Search Preferences"}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {/* Preferences summary */}
        {preferences && preferences.preferences && preferences.preferences.length > 0 && (
          <div className="mx-6 mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg">
            <div className="flex items-center text-indigo-700 dark:text-indigo-400 flex-wrap">
              <BookOpen className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium text-base">Found {preferences.preferences.length} instructor preference submissions for {filters.semester} {filters.year}</span>
            </div>
            <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-300">
              You can now proceed to assign courses manually or automatically
            </p>
          </div>
        )}
      </div>

      {showOptions && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Tabs - Scrollable on mobile */}
          <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            <div className="min-w-max px-6">
              <nav className="flex -mb-px space-x-8">
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "manual"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  style={{ minHeight: "44px" }} // Ensure minimum touch target size
                >
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Manual Assignment</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab("automatic")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "automatic"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  <div className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    <span>Automatic Assignment</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab("assigned")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "assigned"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <span>Assigned Courses</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "manual" && (
              <ManualAssignment fetchAssignments={fetchAssignments} filters={filters} />
            )}

            {activeTab === "automatic" && (
              <AutomaticAssignment fetchAssignments={fetchAssignments} filters={filters} />
            )}

            {activeTab === "assigned" && (
              <AssignedCourses
                fetchAssignments={fetchAssignments}
                assignments={assignments}
                handleDelete={handleDelete}
                currentFilters={filters}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegularAssignmentCH;