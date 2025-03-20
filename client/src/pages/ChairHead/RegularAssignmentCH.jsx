import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Calendar, FileText, Search, Loader2, User, BookOpen, Filter,
  AlertCircle, ArrowRight
} from "lucide-react";

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
      // Update API call to include filter parameters
      const queryParams = new URLSearchParams({
        year: filters.year,
        semester: filters.semester,
        chair: filters.chair
      }).toString();
      
      const { data } = await api.get(`/assignments?${queryParams}`);
      setAssignments(data.filter((a) => a.assignedBy === user.chair));
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
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setError("Failed to delete assignment. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="p-3 sm:p-6 w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Regular Course Assignment</h1>
          <p className="text-gray-500 text-sm mt-1">
            Assign regular courses to instructors based on preferences and workload
          </p>
        </div>

        {/* Search (Filtering Mechanism) */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Academic Year</span>
                </div>
              </label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Semester</span>
                </div>
              </label>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="Regular 1">Regular 1</option>
                <option value="Regular 2">Regular 2</option>
                <option value="Summer">Summer</option>
                <option value="Extension">Extension</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Department Chair</span>
                </div>
              </label>
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-sm">
                {user?.chair || 'Loading chair information...'}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-sm w-full sm:w-auto"
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
          <div className="mt-6 bg-red-50 text-red-700 p-3 sm:p-4 rounded-lg border border-red-200 flex items-start sm:items-center flex-wrap">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {/* Preferences summary */}
        {preferences && preferences.preferences && preferences.preferences.length > 0 && (
          <div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center text-blue-700 flex-wrap">
              <BookOpen className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Found {preferences.preferences.length} instructor preference submissions for {filters.semester} {filters.year}</span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-blue-600">
              You can now proceed to assign courses manually or automatically
            </p>
          </div>
        )}
      </div>

      {showOptions && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6 overflow-x-auto">
            <nav className="flex -mb-px space-x-4 sm:space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab("manual")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === "manual"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1 sm:mr-2" />
                  <span>Manual Assignment</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("automatic")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === "automatic"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-1 sm:mr-2" />
                  <span>Automatic Assignment</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("assigned")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === "assigned"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                  <span>Assigned Courses</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
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
      )}
    </div>
  );
};

export default RegularAssignmentCH;