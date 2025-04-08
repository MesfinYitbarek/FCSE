import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import Spinner from "../../components/Spinner";
import { 
  Search, FileText, Calendar, CheckCircle, AlertCircle, 
  Edit, Send, Info, Lock, Award, Filter, BookOpen, Code, 
  Layers, ClipboardList
} from "lucide-react";

const PreferencesInst = () => {
  const { user } = useSelector((state) => state.auth);
  const [preferenceForm, setPreferenceForm] = useState(null);
  const [courses, setCourses] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submissionAllowed, setSubmissionAllowed] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState("Regular 1");
  const [isEligible, setIsEligible] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChair, setFilterChair] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    if (user?.role === "Instructor") {
      fetchPreferences();
      fetchPreferenceForm();
    }
  }, [user, year, semester]);

  const fetchPreferenceForm = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      // Get active preference form for the instructor's chair
      const { data } = await api.get(`/preference-forms/active?year=${year}&semester=${semester}&chair=${user.chair}`);
      if (data) {
        setPreferenceForm(data);

        // Extract courses from the preference form
        // Each course item in the array has course (populated), section, NoOfSections, labDivision
        const extractedCourses = data.courses.map(courseItem => ({
          ...courseItem.course,
          courseItemId: courseItem._id, // Store the reference ID for this specific course item
          section: courseItem.section,
          NoOfSections: courseItem.NoOfSections,
          labDivision: courseItem.labDivision
        }));
        
        setCourses(extractedCourses);

        const currentDate = new Date();
        const start = new Date(data.submissionStart);
        const end = new Date(data.submissionEnd);
        setSubmissionAllowed(currentDate >= start && currentDate <= end);

        // Check if the instructor is eligible for this form
        const isInstructorEligible = data.allInstructors || 
          (data.instructors && data.instructors.some(
            instructor => instructor._id === user._id
          ));
        setIsEligible(isInstructorEligible);
      } else {
        setPreferenceForm(null);
        setCourses([]);
        setIsEligible(false);
        setSubmissionAllowed(false);
        setErrorMessage("No active preference form found for the selected period");
      }
    } catch (error) {
      console.error("Error fetching preference form:", error);
      setPreferenceForm(null);
      setCourses([]);
      setIsEligible(false);
      setSubmissionAllowed(false);
      setErrorMessage("Failed to fetch preference form. Please try again.");
    }
    setLoading(false);
  };

  const fetchPreferences = async () => {
    try {
      const { data } = await api.get(`/preferences/${user._id}`, {
        params: {
          year: year,
          semester: semester,
          chair: user.chair,
        },
      });

      if (data.preferences && data.preferences.length > 0) {
        setPreferences(data.preferences);
        setHasSubmitted(true);
      } else {
        setPreferences([]);
        setHasSubmitted(false);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setPreferences([]);
      setHasSubmitted(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPreferenceForm();
    fetchPreferences();
  };

  const handlePreferenceChange = (courseId, rank) => {
    let updatedPreferences = preferences.filter((p) => p.courseId !== courseId);

    // Check if any other course already has this rank
    const existingCourseWithRank = preferences.find(p => p.rank === rank && p.courseId !== courseId);

    if (rank > 0) {
      if (existingCourseWithRank) {
        // Swap the ranks
        updatedPreferences = updatedPreferences.map(p =>
          p.courseId === existingCourseWithRank.courseId ? { ...p, rank: 0 } : p
        );
      }
      updatedPreferences.push({ courseId, rank });
      updatedPreferences.sort((a, b) => a.rank - b.rank);
    }
    setPreferences(updatedPreferences);
  };

  const handleUpdate = () => {
    setIsUpdating(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (preferences.length === 0) {
      setErrorMessage("Please select at least one course preference.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      // Use isUpdating or hasSubmitted to determine the method
      const method = isUpdating || hasSubmitted ? "put" : "post";
      
      await api({
        method: method,
        url: "/preferences", // Same endpoint for both
        data: {
          instructorId: user._id,
          preferenceFormId: preferenceForm._id,
          preferences,
        }
      });
      
      setHasSubmitted(true);
      setIsUpdating(false); // Reset update mode after successful submission
      setSubmitSuccess(true);
      
      // Refresh preferences to ensure we display the correct data
      await fetchPreferences();
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting preferences:", error);
      setErrorMessage(isUpdating || hasSubmitted 
        ? "Failed to update preferences. Please try again."
        : "Failed to submit preferences. Please try again."
      );
    }
    setLoading(false);
  };

  // Filter courses based on search query and chair
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChair = filterChair ? course.chair === filterChair : true;
    return matchesSearch && matchesChair;
  });

  // Get unique chairs for filter dropdown
  const chairs = [...new Set(courses.filter(course => course.chair).map(course => course.chair))];

  // Format date for better display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get readable lab division text
  const getLabDivisionText = (labDivision) => {
    return labDivision === "Yes" ? "Has Lab Sections" : "No Lab Sections";
  };

  if (user?.role !== "Instructor") {
    return (
      <div className="p-4 md:p-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-red-500">
            <AlertCircle size={36} className="mb-2 md:mb-0" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Access Denied</h1>
              <p className="text-gray-600">Only instructors can access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 border-b pb-4 flex items-center">
            <FileText className="h-7 w-7 mr-3 text-blue-600" />
            Course Preferences
          </h1>

          {submitSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>Preferences submitted successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 md:p-6 rounded-lg mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-4 flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Search Preference Form
            </h2>

            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="Regular 1">Regular 1</option>
                  <option value="Regular 2">Regular 2</option>
                  <option value="Summer">Summer</option>
                  <option value="Extension">Extension</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 md:px-6 rounded-md hover:bg-blue-700 transition shadow-md flex items-center justify-center space-x-2 disabled:bg-slate-400"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : preferenceForm ? (
            isEligible ? (
              submissionAllowed ? (
                <div className="bg-white rounded-lg transition-all">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h2 className="text-lg font-semibold flex items-center">
                        <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{preferenceForm.semester} - {preferenceForm.year} Preference Form</span>
                      </h2>
                      <p className="text-sm mt-1 text-blue-100">Chair: {preferenceForm.chair}</p>
                    </div>
                    <div className="text-sm bg-blue-800 px-3 py-1.5 rounded-full shadow-sm">
                      Max Preferences: {preferenceForm.maxPreferences}
                    </div>
                  </div>

                  <div className="p-4 md:p-6 border-b">
                    <div className="flex items-center text-sm text-slate-600 mb-6 bg-blue-50 p-3 rounded-md">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                      <span>
                        Submission Period: {formatDate(preferenceForm.submissionStart)} - {formatDate(preferenceForm.submissionEnd)}
                      </span>
                    </div>

                    {/* Search and Filter Bar */}
                    {(!hasSubmitted || isUpdating) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-4 h-4 text-gray-500" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full p-3 pl-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Filter className="w-4 h-4 text-gray-500" />
                          </div>
                          <select
                            value={filterChair}
                            onChange={(e) => setFilterChair(e.target.value)}
                            className="block w-full p-3 pl-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          >
                            <option value="">All Chairs</option>
                            {chairs.map(chair => (
                              <option key={chair} value={chair}>{chair}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {(hasSubmitted && !isUpdating) ? (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                          Your Submitted Preferences
                        </h3>
                        
                        {/* Desktop view */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Rank</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Course</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Code</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Section</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Chair</th>
                              </tr>
                            </thead>
                            <tbody>
                              {preferences.length > 0 ? (
                                preferences
                                .sort((a, b) => a.rank - b.rank)
                                .map((pref) => {
                                  const course = courses.find(c => c._id === pref.courseId || c._id === pref.courseId._id);
                                  return course ? (
                                    <tr key={pref.courseId} className="hover:bg-slate-50">
                                      <td className="p-3 border-b border-slate-200">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                          {pref.rank}
                                        </span>
                                      </td>
                                      <td className="p-3 border-b border-slate-200">
                                        {pref.courseId.name || course.name}
                                      </td>
                                      <td className="p-3 border-b border-slate-200">
                                        <span className="text-slate-500 flex items-center">
                                          <Code className="h-4 w-4 mr-1 text-slate-400" />
                                          {pref.courseId.code || course.code}
                                        </span>
                                      </td>
                                      <td className="p-3 border-b border-slate-200">
                                        {course.section}
                                        {course.NoOfSections > 1 && 
                                          <span className="ml-1 text-xs bg-slate-100 px-1 rounded">
                                            ({course.NoOfSections} sections)
                                          </span>
                                        }
                                      </td>
                                      <td className="p-3 border-b border-slate-200">
                                        <span className="text-slate-500">{pref.courseId.chair || course.chair}</span>
                                      </td>
                                    </tr>
                                  ) : null;
                                })
                              ) : (
                                <tr>
                                  <td colSpan="5" className="p-4 text-center text-slate-500">No preferences found</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Mobile view - cards */}
                        <div className="md:hidden space-y-3">
                          {preferences.length > 0 ? (
                            preferences
                            .sort((a, b) => a.rank - b.rank)
                            .map((pref) => {
                              const course = courses.find(c => c._id === pref.courseId || c._id === pref.courseId._id);
                              return course ? (
                                <div 
                                  key={pref.courseId} 
                                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                      Rank {pref.rank}
                                    </span>
                                    <span className="text-sm text-slate-500">{pref.courseId.chair || course.chair}</span>
                                  </div>
                                  <h4 className="font-medium mb-1">{pref.courseId.name || course.name}</h4>
                                  <div className="flex items-center text-slate-500 text-sm mb-1">
                                    <Code className="h-4 w-4 mr-1 text-slate-400" />
                                    {pref.courseId.code || course.code}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    Section {course.section}
                                    {course.NoOfSections > 1 && 
                                      <span className="ml-1 text-xs bg-slate-100 px-1 rounded">
                                        ({course.NoOfSections} sections)
                                      </span>
                                    }
                                  </div>
                                </div>
                              ) : null;
                            })
                          ) : (
                            <div className="p-4 text-center text-slate-500 border border-slate-200 rounded-lg">
                              No preferences found
                            </div>
                          )}
                        </div>
                        
                        {submissionAllowed && (
                          <button
                            onClick={handleUpdate}
                            className="mt-6 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-md"
                          >
                            <Edit className="h-5 w-5 mr-2" />
                            Update Preferences
                          </button>
                        )}
                        {!submissionAllowed && (
                          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 flex items-start space-x-3">
                            <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Submission period is closed</p>
                              <p className="text-sm mt-1">You cannot update your preferences at this time.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        {/* Course selection table/cards */}
                        
                        {/* Desktop view */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Course</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Code</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Section</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Chair</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Details</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Preference Rank</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredCourses.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="p-4 text-center text-slate-500">No courses match your search criteria</td>
                                </tr>
                              ) : (
                                filteredCourses.map((course) => (
                                  <tr key={course._id} className="hover:bg-slate-50">
                                    <td className="p-3 border-b border-slate-200">{course.name}</td>
                                    <td className="p-3 border-b border-slate-200 text-slate-500">
                                      <div className="flex items-center">
                                        <Code className="h-4 w-4 mr-1 text-slate-400" />
                                        {course.code}
                                      </div>
                                    </td>
                                    <td className="p-3 border-b border-slate-200">
                                      {course.section}
                                      {course.NoOfSections > 1 && 
                                        <span className="ml-1 text-xs bg-slate-100 px-1 rounded">
                                          ({course.NoOfSections} sections)
                                        </span>
                                      }
                                    </td>
                                    <td className="p-3 border-b border-slate-200 text-slate-500">{course.chair}</td>
                                    <td className="p-3 border-b border-slate-200 text-slate-500">
                                      <div className="flex items-center text-xs">
                                        <Layers className="h-4 w-4 mr-1" />
                                        {getLabDivisionText(course.labDivision)}
                                      </div>
                                    </td>
                                    <td className="p-3 border-b border-slate-200">
                                      <select
                                        value={preferences.find((p) => p.courseId === course._id)?.rank || 0}
                                        onChange={(e) => handlePreferenceChange(course._id, parseInt(e.target.value))}
                                        className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                      >
                                        <option value="0">Not Selected</option>
                                        {[...Array(preferenceForm.maxPreferences).keys()].map((i) => (
                                          <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Mobile view - cards */}
                        <div className="md:hidden space-y-3">
                          {filteredCourses.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 border border-slate-200 rounded-lg">
                              No courses match your search criteria
                            </div>
                          ) : (
                            filteredCourses.map((course) => (
                              <div 
                                key={course._id} 
                                className="border border-slate-200 rounded-lg overflow-hidden"
                              >
                                <div 
                                  className="p-4 flex justify-between cursor-pointer hover:bg-slate-50"
                                  onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                                >
                                  <div>
                                    <h4 className="font-medium">{course.name}</h4>
                                    <div className="flex items-center text-slate-500 text-sm mt-1">
                                      <Code className="h-4 w-4 mr-1 text-slate-400" />
                                      {course.code}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                      Section {course.section}
                                      {course.NoOfSections > 1 && 
                                        <span className="ml-1 text-xs bg-slate-100 px-1 rounded">
                                          ({course.NoOfSections} sections)
                                        </span>
                                      }
                                    </div>
                                  </div>
                                  <div className="min-w-fit">
                                    <select
                                      value={preferences.find((p) => p.courseId === course._id)?.rank || 0}
                                      onChange={(e) => handlePreferenceChange(course._id, parseInt(e.target.value))}
                                      className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <option value="0">Not Selected</option>
                                      {[...Array(preferenceForm.maxPreferences).keys()].map((i) => (
                                        <option key={i + 1} value={i + 1}>
                                          {i + 1}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                
                                {expandedCourse === course._id && (
                                  <div className="p-4 pt-0 bg-slate-50 text-sm">
                                    <div className="pt-3 border-t mt-3">
                                      <p><span className="font-medium">Chair:</span> {course.chair}</p>
                                      <p className="mt-1 flex items-start">
                                        <Layers className="h-4 w-4 mr-1 mt-0.5 text-slate-400" />
                                        <span>{getLabDivisionText(course.labDivision)}</span>
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        
                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                          <div className="text-sm flex items-center bg-blue-50 px-3 py-2 rounded-md text-slate-700">
                            <Award className="h-4 w-4 mr-2 text-blue-600" />
                            <span>Selected preferences: <span className="font-semibold">{preferences.length}/{preferenceForm.maxPreferences}</span></span>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition shadow-md disabled:bg-slate-400"
                          >
                            {loading ? <Spinner /> : (
                              <>
                                <Send className="h-5 w-5 mr-2" />
                                {isUpdating ? "Update Preferences" : "Submit Preferences"}
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-orange-100 text-orange-800 p-4 md:p-6 rounded-lg flex flex-col md:flex-row md:items-start md:space-x-4">
                  <AlertCircle className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Submission Period Closed</h3>
                    <p>The submission period for this preference form is not currently active.</p>
                    <p className="text-sm mt-2">
                      Submission period: {formatDate(preferenceForm.submissionStart)} - {formatDate(preferenceForm.submissionEnd)}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-red-100 text-red-800 p-4 md:p-6 rounded-lg flex flex-col md:flex-row md:items-start md:space-x-4">
                <AlertCircle className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Not Eligible</h3>
                  <p>You are not eligible to submit preferences for this form.</p>
                  <p className="mt-2 text-sm">This form is only available to selected instructors in the {preferenceForm.chair} department.</p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-slate-100 text-slate-700 p-4 md:p-6 rounded-lg flex flex-col md:flex-row md:items-start md:space-x-4">
              <Info className="h-6 w-6 mb-2 md:mb-0 md:mt-0.5 flex-shrink-0" />
              <div>
                <p>Please search for a preference form using the fields above.</p>
                <p className="mt-2 text-sm">Your department's chair creates preference forms for each semester. If you can't find a form, please contact your department chair.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreferencesInst;