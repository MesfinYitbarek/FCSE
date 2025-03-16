// src/pages/Instructor/InstructorDashboard.jsx
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [workload, setWorkload] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInstructorAssignments();
    fetchAnnouncements();
  }, []);

  // Fetch assigned courses
  const fetchInstructorAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/assignments/get/${user._id}`);
      setAssignments(data);
      const totalHours = data.reduce((sum, assignment) => sum + assignment.workload, 0);
      setWorkload(totalHours);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
    setLoading(false);
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements");
      setAnnouncements(data.slice(0, 3)); // Show latest 3 announcements
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Instructor Dashboard</h1>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Workload</h2>
          <p className="text-xl font-bold">{workload} Hours</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Assigned Courses</h2>
          <p className="text-xl font-bold">{assignments.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Pending Complaints</h2>
          <Link to="/complaints" className="text-blue-600 underline">
            View Complaints
          </Link>
        </div>
      </div>

      {/* Assigned Courses */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">My Assigned Courses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : assignments.length === 0 ? (
          <p>No assigned courses.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Course</th>
                <th className="border border-gray-300 p-2">Year</th>
                <th className="border border-gray-300 p-2">Program</th>
                <th className="border border-gray-300 p-2">Section</th>
                <th className="border border-gray-300 p-2">Workload</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a._id} className="text-center">
                  <td className="border border-gray-300 p-2">{a.courseId?.name}</td>
                  <td className="border border-gray-300 p-2">{a.year}</td>
                  <td className="border border-gray-300 p-2">{a.program}</td>
                  <td className="border border-gray-300 p-2">{a.section}</td>
                  <td className="border border-gray-300 p-2">{a.workload} Hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Announcements */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Latest Announcements</h2>
        {announcements.length === 0 ? (
          <p>No announcements available.</p>
        ) : (
          <ul>
            {announcements.map((a) => (
              <li key={a._id} className="border-b border-gray-300 py-2">
                <h3 className="text-lg font-bold">{a.title}</h3>
                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-gray-500">Posted on: {new Date(a.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
        <Link to="/announcements" className="text-blue-600 underline">
          View All Announcements
        </Link>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/preferences" className="bg-blue-500 text-white p-4 rounded text-center">
          Submit Preferences
        </Link>
        <Link to="/complaints" className="bg-red-500 text-white p-4 rounded text-center">
          Submit Complaint
        </Link>
        <Link to="/assignments" className="bg-green-500 text-white p-4 rounded text-center">
          View Assignments
        </Link>
      </div>
    </div>
  );
};

export default InstructorDashboard;
