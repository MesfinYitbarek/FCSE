import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import Spinner from "../../components/Spinner";

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

  useEffect(() => {
    if (user?.role === "Instructor") {
      fetchPreferences();
      fetchPreferenceForm();
    }
  }, [user]);

  const fetchPreferenceForm = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      // Get active preference form for the instructor's chair
      const { data } = await api.get(`/preference-forms/active?year=${year}&semester=${semester}&chair=${user.chair}`);
      if (data) {
        setPreferenceForm(data);

        // Now we use the courses array directly from the preference form
        setCourses(data.courses);

        const currentDate = new Date();
        const start = new Date(data.submissionStart);
        const end = new Date(data.submissionEnd);
        setSubmissionAllowed(currentDate >= start && currentDate <= end);

        // Check if the instructor is eligible for this form
        const isInstructorEligible = data.instructors.some(
          (instructor) => instructor._id === user._id
        );
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
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    fetchPreferenceForm();
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

// Add a new state variable to track whether we're in update mode
const [isUpdating, setIsUpdating] = useState(false);

// Modify your handleUpdate function
const handleUpdate = () => {
  setIsUpdating(true); // Set to update mode instead of changing hasSubmitted
};

// Update your handleSubmit function to use the correct HTTP method
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
      url: "/preferences", // Simplified - same endpoint for both
      data: {
        instructorId: user._id,
        preferenceFormId: preferenceForm._id,
        preferences,
      }
    });
    
    setHasSubmitted(true);
    setIsUpdating(false); // Reset update mode after successful submission
    setSubmitSuccess(true);
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
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChair = filterChair ? course.chair === filterChair : true;
    return matchesSearch && matchesChair;
  });

  // Get unique chairs for filter dropdown
  const chairs = [...new Set(courses.map(course => course.chair))];

  if (user?.role !== "Instructor") {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h1 className="text-2xl font-bold">Access Denied</h1>
              <p className="text-gray-600">Only instructors can access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Course Preferences
          </h1>

          {submitSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Preferences submitted successfully!
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMessage}
            </div>
          )}

          <div className="bg-slate-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Preference Form
            </h2>

            <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-6">
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
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition shadow-md flex items-center justify-center space-x-2 disabled:bg-slate-400"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
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
                <div className="bg-white rounded-lg">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {preferenceForm.semester} - {preferenceForm.year} Preference Form
                    </h2>
                    <div className="text-sm">
                      <span className="bg-blue-800 px-2 py-1 rounded">Max Preferences: {preferenceForm.maxPreferences}</span>
                    </div>
                  </div>

                  <div className="p-6 border-b">
                    <div className="flex items-center text-sm text-slate-600 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        Submission Period: {new Date(preferenceForm.submissionStart).toLocaleDateString()} - {new Date(preferenceForm.submissionEnd).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Search and Filter Bar */}
                    {!hasSubmitted && (
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full p-3 pl-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                        <select
                          value={filterChair}
                          onChange={(e) => setFilterChair(e.target.value)}
                          className="p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                          <option value="">All Chairs</option>
                          {chairs.map(chair => (
                            <option key={chair} value={chair}>{chair}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(hasSubmitted && !isUpdating)  ? (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Your Submitted Preferences
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Rank</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Course</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Code</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Chair</th>
                              </tr>
                            </thead>
                            <tbody>
                              {preferences
                                .sort((a, b) => a.rank - b.rank)
                                .map((pref) => (
                                  <tr key={pref.courseId._id} className="hover:bg-slate-50">
                                    <td className="p-3 border-b border-slate-200">
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                        {pref.rank}
                                      </span>
                                    </td>
                                    <td className="p-3 border-b border-slate-200">{pref.courseId.name}</td>
                                    <td className="p-3 border-b border-slate-200">
                                      <span className="text-slate-500">{pref.courseId.code}</span>
                                    </td>
                                    <td className="p-3 border-b border-slate-200">
                                      <span className="text-slate-500">{pref.courseId.chair}</span>
                                    </td>
                                  </tr>
                                ))}

                            </tbody>
                          </table>
                        </div>
                        {submissionAllowed && (
                          <button
                            onClick={handleUpdate}
                            className="mt-6 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-md"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Update Preferences
                          </button>
                        )}
                        {!submissionAllowed && (
                          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Submission period is closed. You cannot update your preferences at this time.
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Course</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Code</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Chair</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Year/Sem</th>
                                <th className="p-3 text-left font-semibold text-slate-700 border-b">Preference Rank</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredCourses.length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="p-4 text-center text-slate-500">No courses match your search criteria</td>
                                </tr>
                              ) : (
                                filteredCourses.map((course) => (
                                  <tr key={course._id} className="hover:bg-slate-50">
                                    <td className="p-3 border-b border-slate-200">{course.name}</td>
                                    <td className="p-3 border-b border-slate-200 text-slate-500">{course.code}</td>
                                    <td className="p-3 border-b border-slate-200 text-slate-500">{course.chair}</td>
                                    <td className="p-3 border-b border-slate-200 text-slate-500">
                                      Year {course.year}, Sem {course.semester}
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
                        <div className="mt-6 flex justify-between items-center">
                          <div className="text-sm text-slate-600">
                            Selected preferences: {preferences.length}/{preferenceForm.maxPreferences}
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition shadow-md disabled:bg-slate-400"
                          >
                            {loading ? <Spinner /> : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
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
                <div className="bg-orange-100 text-orange-800 p-6 rounded-lg flex items-start space-x-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">Submission Period Closed</h3>
                    <p>The submission period for this preference form is not currently active.</p>
                    <p className="text-sm mt-2">
                      Submission period: {new Date(preferenceForm.submissionStart).toLocaleDateString()} - {new Date(preferenceForm.submissionEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-red-100 text-red-800 p-6 rounded-lg flex items-start space-x-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Not Eligible</h3>
                  <p>You are not eligible to submit preferences for this form.</p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-slate-100 text-slate-700 p-6 rounded-lg flex items-start space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p>Please search for a preference form using the fields above.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreferencesInst;