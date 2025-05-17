import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";

const CourseAssignment = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [program, setProgram] = useState("Regular");
  const [section, setSection] = useState("A");
  const [workload, setWorkload] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
    fetchAssignments();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get(`/courses/chair/${user._id}`);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const { data } = await api.get(`/users?role=Instructor&chairId=${user._id}`);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get(`/assignments/chair/${user._id}`);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Handle manual assignment
  const handleAssign = async () => {
    if (!selectedCourse || !selectedInstructor) return;
    setLoading(true);
    try {
      await api.post("/assignments", {
        instructorId: selectedInstructor,
        courseId: selectedCourse,
        year,
        program,
        section,
        workload,
        assignedBy: "ChairHead",
      });
      fetchAssignments();
    } catch (error) {
      console.error("Error assigning course:", error);
    }
    setLoading(false);
  };

  // Trigger automatic assignment
  const handleAutoAssign = async () => {
    setLoading(true);
    try {
      await api.post("/assignments/auto", { chairId: user._id });
      fetchAssignments();
    } catch (error) {
      console.error("Error in automatic assignment:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Course Assignment Management</h1>

      {/* Manual Assignment */}
      <div className="mt-4 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Manual Course Assignment</h2>
        <select
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          className="w-full p-2 border rounded mb-2"
          onChange={(e) => setSelectedInstructor(e.target.value)}
        >
          <option value="">Select Instructor</option>
          {instructors.map((i) => (
            <option key={i._id} value={i._id}>{i.name}</option>
          ))}
        </select>

        <input
          type="number"
          className="w-full p-2 border rounded mb-2"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
        />

        <select className="w-full p-2 border rounded mb-2" value={program} onChange={(e) => setProgram(e.target.value)}>
          <option value="Regular">Regular</option>
          <option value="Extension">Extension</option>
          <option value="Summer">Summer</option>
        </select>

        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="Section"
        />

        <input
          type="number"
          className="w-full p-2 border rounded mb-2"
          value={workload}
          onChange={(e) => setWorkload(e.target.value)}
          placeholder="Workload Hours"
        />

        <button onClick={handleAssign} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Assigning..." : "Assign Manually"}
        </button>
      </div>

      {/* Automatic Assignment */}
      <div className="mt-6">
        <button onClick={handleAutoAssign} className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Assigning Automatically..." : "Trigger Automatic Assignment"}
        </button>
      </div>

      {/* Assigned Courses */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Assigned Courses</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Course</th>
              <th className="border border-gray-300 p-2">Instructor</th>
              <th className="border border-gray-300 p-2">Program</th>
              <th className="border border-gray-300 p-2">Year</th>
              <th className="border border-gray-300 p-2">Section</th>
              <th className="border border-gray-300 p-2">Workload</th>
              <th className="border border-gray-300 p-2">Assigned By</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a._id} className="text-center">
                <td className="border border-gray-300 p-2">{a.courseId?.name}</td>
                <td className="border border-gray-300 p-2">{a.instructorId?.name}</td>
                <td className="border border-gray-300 p-2">{a.program}</td>
                <td className="border border-gray-300 p-2">{a.year}</td>
                <td className="border border-gray-300 p-2">{a.section}</td>
                <td className="border border-gray-300 p-2">{a.workload}</td>
                <td className="border border-gray-300 p-2">{a.assignedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseAssignment;
