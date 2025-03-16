import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { Loader, AlertCircle, CheckCircle } from "lucide-react";

const ComplaintsInst = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ assignmentId: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchAssignments();
    fetchComplaints();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get(`/assignments`);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to load assignments.");
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get(`/complaints/${user._id}`);
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError("Failed to load complaints.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assignmentId || !form.reason) return alert("Please fill all fields.");
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/complaints", { instructorId: user._id, ...form });
      fetchComplaints();
      setForm({ assignmentId: "", reason: "" });
      setSuccess("Complaint submitted successfully!");
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError("Error submitting complaint.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Submit Complaint</h1>

      {error && (
        <div className="flex items-center p-3 bg-red-100 text-red-700 rounded-lg mb-4">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center p-3 bg-green-100 text-green-700 rounded-lg mb-4">
          <CheckCircle className="mr-2" size={20} />
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">File a Complaint</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="assignmentId"
            value={form.assignmentId}
            onChange={handleChange}
            className="p-3 border rounded-lg bg-gray-50"
            required
          >
            <option value="">Select Assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment._id} value={assignment._id}>
                {assignment.year} - {assignment.semester} ({assignment.program})
              </option>
            ))}
          </select>
          <textarea
            name="reason"
            placeholder="Reason for complaint"
            value={form.reason}
            onChange={handleChange}
            className="p-3 border rounded-lg bg-gray-50"
            required
          />
          <button
            type="submit"
            className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-all"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Complaints</h2>
        {loading ? (
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <Loader className="animate-spin mr-2 text-blue-600" size={20} />
            <span className="text-blue-700">Loading complaints...</span>
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-gray-600">No complaints submitted.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gradient-to-r from-red-500 to-red-700 text-white">
                  <th className="border border-gray-300 p-3">Year</th>
                  <th className="border border-gray-300 p-3">Semester</th>
                  <th className="border border-gray-300 p-3">Program</th>
                  <th className="border border-gray-300 p-3">Reason</th>
                  <th className="border border-gray-300 p-3">Status</th>
                  <th className="border border-gray-300 p-3">Resolved By</th>
                  <th className="border border-gray-300 p-3">Resolved At</th>
                  <th className="border border-gray-300 p-3">Resolve Note</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="text-center hover:bg-gray-100 transition-all">
                    <td className="border border-gray-300 p-3 font-semibold">{complaint.assignmentId?.year}</td>
                    <td className="border border-gray-300 p-3">{complaint.assignmentId?.semester}</td>
                    <td className="border border-gray-300 p-3">{complaint.assignmentId?.program}</td>
                    <td className="border border-gray-300 p-3">{complaint.reason}</td>
                    <td className="border border-gray-300 p-3">{complaint.status}</td>
                    <td className="border border-gray-300 p-3">{complaint.resolvedBy?.fullName || "N/A"}</td>
                    <td className="border border-gray-300 p-3">{complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : "N/A"}</td>
                    <td className="border border-gray-300 p-3">{complaint.resolveNote || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsInst;
