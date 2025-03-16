import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Check, 
  AlertCircle, 
  Loader, 
  ChevronDown, 
  BookOpen,
  Users,
  Award
} from "lucide-react";

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

  const fetchCourses = async () => {
    try {
      const { data } = await api.get(`/courses/${user.chair}`);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
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
          // If checking, add default values
          updated[instructorId][courseId] = { section: "A", labDivision: "No" };
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
      alert("Please select at least one instructor and course for assignment.");
      return;
    }

    setLoading(true);
    try {
      const bulkAssignments = [];

      Object.entries(selectedAssignments).forEach(([instructorId, courses]) => {
        Object.entries(courses).forEach(([courseId, { section, labDivision }]) => {
          bulkAssignments.push({ instructorId, courseId, section, labDivision });
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
    } catch (error) {
      console.error("Error assigning courses:", error);
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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Course Assignment Dashboard</h2>
          <p className="text-gray-600 mt-1">
            {filters.semester} Semester, {filters.year}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Users size={20} className="text-blue-600" />
            <span className="text-blue-700 font-medium">
              {instructors.length} Instructors
            </span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
            <BookOpen size={20} className="text-green-600" />
            <span className="text-green-700 font-medium">
              {courses.length} Courses
            </span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg mb-4">
          <Loader className="animate-spin mr-2 text-blue-600" size={20} />
          <span className="text-blue-700">Processing assignments...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center p-4 bg-red-50 rounded-lg mb-4">
          <AlertCircle className="text-red-600 mr-2" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {preferences.map((pref) => (
          <div key={pref.instructorId._id} className="border rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
              onClick={() => setExpandedInstructor(
                expandedInstructor === pref.instructorId._id ? null : pref.instructorId._id
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">
                    {pref.instructorId.fullName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {pref.instructorId.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getAssignmentStatus(pref.instructorId._id)} courses assigned
                  </p>
                </div>
              </div>
              <ChevronDown 
                className={`transition-transform ${
                  expandedInstructor === pref.instructorId._id ? 'rotate-180' : ''
                }`}
              />
            </div>

            {expandedInstructor === pref.instructorId._id && (
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {sortCoursesByPreference(courses, pref.instructorId._id).map((course) => (
                    <div 
                      key={course._id} 
                      className={`p-4 rounded-lg border ${
                        selectedAssignments[pref.instructorId._id]?.[course._id]
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded"
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
                          <span className="font-medium">{course.code}</span>
                        </label>
                        <div className={`px-2 py-1 rounded text-xs ${
                          getPreferenceRank(pref.instructorId, course) !== Infinity
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {getPreferenceLabel(getPreferenceRank(pref.instructorId, course))}
                        </div>
                      </div>

                      {selectedAssignments[pref.instructorId._id]?.[course._id] && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            className="w-full p-2 border rounded"
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
                          <select
                            className="w-full p-2 border rounded"
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
            flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 transform transition-transform hover:scale-105'
            }
          `}
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} />
              <span>Assigning...</span>
            </>
          ) : (
            <>
              <Check size={20} />
              <span>Confirm Assignments</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ManualAssignment;