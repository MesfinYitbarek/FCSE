import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Check, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  BookOpen,
  Users,
  Layers
} from "lucide-react";
import { toast } from "react-hot-toast";

const ManualAssignment = ({ fetchAssignments, filters }) => {
  const { user } = useSelector((state) => state.auth);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedInstructor, setExpandedInstructor] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/preferences/search-preferences?${queryParams}`);
      setPreferences(response.data.preferences || []);
      fetchInstructors();
      fetchCourses();
    } catch (error) {
      setError(error.message);
      toast.error("Error fetching data: " + error.message);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const { data } = await api.get(`/users/users/${user.chair}`);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

    // Fetch available  courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/courses/assigned/${user.chair}`);

      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data && Array.isArray(data.courses)) {
        // In case the API returns the courses in a nested property
        setCourses(data.courses);
      } else {
        setCourses([]);
        console.warn("Courses data is not in expected format:", data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSelection = (instructorId, courseId, field, value) => {
    setSelectedAssignments((prev) => {
      const updated = { ...prev };

      if (!updated[instructorId]) updated[instructorId] = {};

      if (field === "selected") {
        if (!value) {
          // If unchecking, remove the course assignment completely
          const { [courseId]: removed, ...rest } = updated[instructorId];
          updated[instructorId] = rest;
        } else {
          // If checking, add default values with empty assignment reason and NoOfSections = 1
          updated[instructorId][courseId] = { 
            section: "A", 
            labDivision: "No", 
            NoOfSections: 1,
            assignmentReason: "" 
          };
        }
      } else {
        // Update existing field
        updated[instructorId][courseId] = {
          ...updated[instructorId][courseId],
          [field]: value
        };
      }

      return updated;
    });
  };

  const handleBulkAssign = async () => {
    if (Object.keys(selectedAssignments).length === 0) {
      toast.error("Please select at least one instructor and course for assignment.");
      return;
    }

    setLoading(true);
    try {
      const bulkAssignments = [];

      Object.entries(selectedAssignments).forEach(([instructorId, courses]) => {
        Object.entries(courses).forEach(([courseId, { section, NoOfSections, labDivision, assignmentReason }]) => {
          bulkAssignments.push({ 
            instructorId, 
            courseId, 
            section,
            NoOfSections: parseInt(NoOfSections) || 1,
            labDivision,
            assignmentReason 
          });
        });
      });

      await api.post("/assignments/manual", {
        assignments: bulkAssignments,
        year: filters.year,
        semester: filters.semester,
        program: "Regular",
        assignedBy: user.chair,
      });

      fetchAssignments();
      setSelectedAssignments({});
      toast.success("Courses assigned successfully!");
    } catch (error) {
      console.error("Error assigning courses:", error);
      toast.error("Failed to assign courses: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const getPreferenceRank = (instructor, course) => {
    const preference = preferences
      .find(p => p.instructorId._id === instructor._id)
      ?.preferences.find(p => p.courseId._id === course._id);
    
    return preference?.rank || Infinity;
  };

  const sortCoursesByPreference = (courses, instructorId) => {
    return [...courses].sort((a, b) => {
      const rankA = getPreferenceRank({ _id: instructorId }, a);
      const rankB = getPreferenceRank({ _id: instructorId }, b);
      return rankA - rankB;
    });
  };

  const getPreferenceLabel = (rank) => {
    if (rank === Infinity) return "Not Preferred";
    return `Preference Rank ${rank}`;
  };

  const getAssignmentStatus = (instructorId) => {
    if (!selectedAssignments[instructorId]) return 0;
    return Object.keys(selectedAssignments[instructorId]).length;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Course Assignment Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            {filters.semester} Semester, {filters.year}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm">
            <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">
              {instructors.length} Instructors
            </span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm">
            <BookOpen size={18} className="text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              {courses.length} Courses
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-4 text-sm">
          <Loader2 className="animate-spin mr-2 text-indigo-600 dark:text-indigo-400" size={18} />
          <span className="text-indigo-700 dark:text-indigo-300">Processing assignments...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4 text-sm">
          <AlertCircle className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0" size={18} />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {preferences.map((pref) => (
          <div key={pref.instructorId._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 cursor-pointer"
              onClick={() => setExpandedInstructor(
                expandedInstructor === pref.instructorId._id ? null : pref.instructorId._id
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {pref.instructorId.fullName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-base">
                    {pref.instructorId.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getAssignmentStatus(pref.instructorId._id)} courses assigned
                  </p>
                </div>
              </div>
              <ChevronDown 
                className={`transition-transform text-gray-500 dark:text-gray-400 ${
                  expandedInstructor === pref.instructorId._id ? 'rotate-180' : ''
                }`}
                size={20}
              />
            </div>

            {expandedInstructor === pref.instructorId._id && (
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortCoursesByPreference(courses, pref.instructorId._id).map((course) => (
                    <div 
                      key={course._id} 
                      className={`p-4 rounded-lg border ${
                        selectedAssignments[pref.instructorId._id]?.[course._id]
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-slate-800"
                            checked={!!selectedAssignments[pref.instructorId._id]?.[course._id]}
                            onChange={(e) =>
                              handleAssignmentSelection(
                                pref.instructorId._id,
                                course._id,
                                "selected",
                                e.target.checked
                              )
                            }
                          />
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{course.code}-{course.name}</span>
                        </label>
                        <div className={`px-2 py-1 rounded text-xs ${
                          getPreferenceRank(pref.instructorId, course) !== Infinity
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {getPreferenceLabel(getPreferenceRank(pref.instructorId, course))}
                        </div>
                      </div>

                      {selectedAssignments[pref.instructorId._id]?.[course._id] && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Section"
                              value={selectedAssignments[pref.instructorId._id][course._id].section}
                              onChange={(e) =>
                                handleAssignmentSelection(
                                  pref.instructorId._id,
                                  course._id,
                                  "section",
                                  e.target.value
                                )
                              }
                            />
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Sections"
                                value={selectedAssignments[pref.instructorId._id][course._id].NoOfSections}
                                onChange={(e) =>
                                  handleAssignmentSelection(
                                    pref.instructorId._id,
                                    course._id,
                                    "NoOfSections",
                                    e.target.value
                                  )
                                }
                              />
                              <Layers className="h-4 w-4 text-gray-400 dark:text-gray-500 absolute top-1/2 transform -translate-y-1/2 left-2" />
                            </div>
                          </div>
                          <select
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            value={selectedAssignments[pref.instructorId._id][course._id].labDivision}
                            onChange={(e) =>
                              handleAssignmentSelection(
                                pref.instructorId._id,
                                course._id,
                                "labDivision",
                                e.target.value
                              )
                            }
                          >
                            <option value="No">No Lab Division</option>
                            <option value="Yes">With Lab Division</option>
                          </select>
                          
                          {/* Assignment Reason Field */}
                          <textarea
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Assignment Reason (optional)"
                            value={selectedAssignments[pref.instructorId._id][course._id].assignmentReason || ""}
                            onChange={(e) =>
                              handleAssignmentSelection(
                                pref.instructorId._id,
                                course._id,
                                "assignmentReason",
                                e.target.value
                              )
                            }
                            rows="2"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleBulkAssign}
          disabled={loading}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium
            ${loading 
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 transition-all hover:shadow-md'
            }
            w-full sm:w-auto
          `}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Assigning...</span>
            </>
          ) : (
            <>
              <Check size={18} />
              <span>Confirm Assignments</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ManualAssignment;