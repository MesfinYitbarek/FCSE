import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";

const Preferences = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [preferenceForm, setPreferenceForm] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch active preference form, courses, and previous preferences
  useEffect(() => {
    fetchPreferenceForm();
  }, []);

  const fetchPreferenceForm = async () => {
    try {
      const { data } = await api.get(`/preference-forms/active`);
      setPreferenceForm(data);
      fetchCourses();
      fetchPreferences(data._id);
    } catch (error) {
      console.error("Error fetching preference form:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

const fetchPreferences = async (formId) => {
  try {
    const { year, semester, chair } = preferenceForm;
    const { data } = await api.get(
      `/preferences/${user._id}?formId=${formId}&year=${year}&semester=${semester}&chair=${chair}`
    );

    if (data) {
      setPreferences(data.preferences);
      setSubmitted(true);
    }
  } catch (error) {
    console.error("Error fetching preferences:", error);
  }
};

  // Handle preference selection
  const handleSelect = (courseId, rank) => {
    let updatedPreferences = [...preferences];
    const index = updatedPreferences.findIndex((p) => p.rank === rank);

    if (index !== -1) {
      updatedPreferences[index] = { courseId, rank };
    } else {
      updatedPreferences.push({ courseId, rank });
    }

    setPreferences(updatedPreferences);
  };

  // Handle submitting preferences
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/preferences", {
        instructorId: user._id,
        preferenceFormId: preferenceForm._id,
        preferences,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting preferences:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Course Preferences</h1>

      {submitted ? (
        <p className="mt-4 text-green-600">Your preferences have been submitted!</p>
      ) : (
        preferenceForm ? (
          <form onSubmit={handleSubmit} className="mt-4 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Select Course Preferences (Max: {preferenceForm.maxPreferences})</h2>
            {courses.slice(0, preferenceForm.maxPreferences).map((course, index) => (
              <div key={course._id} className="mb-2">
                <label className="mr-2">{index + 1}.</label>
                <select
                  className="p-2 border rounded"
                  onChange={(e) => handleSelect(e.target.value, index + 1)}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
              {loading ? "Submitting..." : "Submit Preferences"}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-red-600">No active preference form available.</p>
        )
      )}
    </div>
  );
};

export default Preferences;
