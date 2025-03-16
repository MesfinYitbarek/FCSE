import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const COCDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchComplaints();
    fetchWorkload();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/assignments/coc");
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
    setLoading(false);
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get(`/complaints`);
      setComplaints(data.filter((c) => c.status === "Pending"));
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchWorkload = async () => {
    try {
      const { data } = await api.get(`/reports/workload`);
      setWorkload(data);
    } catch (error) {
      console.error("Error fetching workload:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">COC Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-lg font-semibold text-gray-700">Total Assignments</h2>
          <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-lg font-semibold text-gray-700">Pending Complaints</h2>
          <Link to="/complaints" className="text-red-600 font-semibold hover:underline">
            View Complaints ({complaints.length})
          </Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-lg font-semibold text-gray-700">Instructor Workload</h2>
          <Link to="/reports" className="text-green-600 font-semibold hover:underline">
            View Workload Report
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Courses</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : assignments.length === 0 ? (
          <p className="text-gray-500">No assigned courses.</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="p-3">Course</th>
                <th className="p-3">Instructor</th>
                <th className="p-3">Program</th>
                <th className="p-3">Year</th>
                <th className="p-3">Workload</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a._id} className="text-center border-b">
                  <td className="p-3">{a.courseId?.name}</td>
                  <td className="p-3">{a.instructorId?.name}</td>
                  <td className="p-3">{a.program}</td>
                  <td className="p-3">{a.year}</td>
                  <td className="p-3">{a.workload} Hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Instructor Workload Distribution</h2>
        {workload.length === 0 ? (
          <p className="text-gray-500">No workload data available.</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="p-3">Instructor Name</th>
                <th className="p-3">Total Courses</th>
                <th className="p-3">Total Workload</th>
              </tr>
            </thead>
            <tbody>
              {workload.map((instructor) => (
                <tr key={instructor._id} className="text-center border-b">
                  <td className="p-3">{instructor.name}</td>
                  <td className="p-3">{instructor.totalCourses}</td>
                  <td className="p-3">{instructor.totalHours} Hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/assignments" className="bg-blue-600 text-white p-4 rounded-xl text-center font-semibold shadow-lg hover:bg-blue-700">Manage Assignments</Link>
        <Link to="/complaints" className="bg-red-600 text-white p-4 rounded-xl text-center font-semibold shadow-lg hover:bg-red-700">Resolve Complaints</Link>
        <Link to="/reports" className="bg-green-600 text-white p-4 rounded-xl text-center font-semibold shadow-lg hover:bg-green-700">View Reports</Link>
      </div>
    </div>
  );
};

export default COCDashboard;
