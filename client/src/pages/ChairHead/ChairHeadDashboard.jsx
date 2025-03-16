import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ChairHeadDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
    fetchAssignments();
    fetchComplaints();
  }, []);

  // Fetch courses under this Chair Head's department
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/chair/${user._id}`);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    setLoading(false);
  };

  // Fetch instructors under this Chair Head
  const fetchInstructors = async () => {
    try {
      const { data } = await api.get(`/users?role=Instructor&chairId=${user._id}`);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  // Fetch assignments under this Chair Head
  const fetchAssignments = async () => {
    try {
      const { data } = await api.get(`/assignments/chair/${user._id}`);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Fetch pending complaints
  const fetchComplaints = async () => {
    try {
      const { data } = await api.get(`/complaints`);
      setComplaints(data.filter((c) => c.status === "Pending")); // Show only pending complaints
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Chair Head Dashboard</h1>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Courses</h2>
          <p className="text-xl font-bold">{courses.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Instructors</h2>
          <p className="text-xl font-bold">{instructors.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Assigned Courses</h2>
          <p className="text-xl font-bold">{assignments.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Pending Complaints</h2>
          <Link to="/complaints" className="text-blue-600 underline">
            View Complaints ({complaints.length})
          </Link>
        </div>
      </div>

      {/* Course Management */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Courses Under Your Chair</h2>
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p>No courses assigned to this chair.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Course Name</th>
                <th className="border border-gray-300 p-2">Course Code</th>
                <th className="border border-gray-300 p-2">Year</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="text-center">
                  <td className="border border-gray-300 p-2">{course.name}</td>
                  <td className="border border-gray-300 p-2">{course.code}</td>
                  <td className="border border-gray-300 p-2">{course.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Instructor Workload */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Instructor Workload</h2>
        {instructors.length === 0 ? (
          <p>No instructors found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Instructor Name</th>
                <th className="border border-gray-300 p-2">Assigned Courses</th>
                <th className="border border-gray-300 p-2">Total Workload</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((instructor) => {
                const instructorAssignments = assignments.filter(
                  (a) => a.instructorId?._id === instructor._id
                );
                const totalWorkload = instructorAssignments.reduce(
                  (sum, a) => sum + a.workload, 0
                );

                return (
                  <tr key={instructor._id} className="text-center">
                    <td className="border border-gray-300 p-2">{instructor.name}</td>
                    <td className="border border-gray-300 p-2">{instructorAssignments.length}</td>
                    <td className="border border-gray-300 p-2">{totalWorkload} Hours</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/assignments" className="bg-blue-500 text-white p-4 rounded text-center">
          Manage Assignments
        </Link>
        <Link to="/preferences" className="bg-yellow-500 text-white p-4 rounded text-center">
          Manage Preferences
        </Link>
        <Link to="/complaints" className="bg-red-500 text-white p-4 rounded text-center">
          View Complaints
        </Link>
      </div>
    </div>
  );
};

export default ChairHeadDashboard;
