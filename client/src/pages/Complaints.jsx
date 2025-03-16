
import  { useEffect, useState } from "react";
import api from "../utils/api";
import { useSelector } from "react-redux";

const Complaints = () => {
  const { user } = useSelector((state) => state.auth);
  const [complaints, setComplaints] = useState([]);
  const [assignments, setAssignments] = useState([]); // For instructors to link complaints to assignments
  const [newComplaint, setNewComplaint] = useState({ assignmentId: "", reason: "" });
  const [loading, setLoading] = useState(false);

  // Fetch complaints (Instructors see their own, others see all)
  useEffect(() => {
    fetchComplaints();
    if (user.role === "Instructor") fetchAssignments();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get(user.role === "Instructor" ? `/complaints/${user._id}` : "/complaints");
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get(`/assignments`);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Handle input change for new complaint
  const handleChange = (e) => {
    setNewComplaint({ ...newComplaint, [e.target.name]: e.target.value });
  };

  // Handle submitting a new complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/complaints", {
        ...newComplaint,
        instructorId: user._id,
        status: "Pending",
      });
      setNewComplaint({ assignmentId: "", reason: "" });
      fetchComplaints(); // Refresh complaints list
    } catch (error) {
      console.error("Error submitting complaint:", error);
    }
    setLoading(false);
  };

  // Handle updating complaint status (For Chair Heads & COC)
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}`, {
        status,
        resolvedBy: user._id,
        resolvedAt: new Date(),
      });
      fetchComplaints();
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Complaint Management</h1>

      {/* Submit New Complaint (For Instructors Only) */}
      {user.role === "Instructor" && (
        <form onSubmit={handleSubmitComplaint} className="mt-4 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Submit a Complaint</h2>
          <select
            name="assignmentId"
            value={newComplaint.assignmentId}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          >
            <option value="">Select Assignment</option>
            {assignments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.courseName} (Year: {a.year})
              </option>
            ))}
          </select>
          <textarea
            name="reason"
            placeholder="Complaint Reason"
            value={newComplaint.reason}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      )}

      {/* Complaint List */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Submitted Complaints</h2>
        {complaints.length === 0 ? (
          <p>No complaints available.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Course</th>
                <th className="border border-gray-300 p-2">Reason</th>
                <th className="border border-gray-300 p-2">Status</th>
                <th className="border border-gray-300 p-2">Submitted At</th>
                {(user.role === "ChairHead" || user.role === "COC") && (
                  <th className="border border-gray-300 p-2">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className="text-center">
                  <td className="border border-gray-300 p-2">{c.assignmentId?.courseName || "Unknown"}</td>
                  <td className="border border-gray-300 p-2">{c.reason}</td>
                  <td className="border border-gray-300 p-2">{c.status}</td>
                  <td className="border border-gray-300 p-2">
                    {new Date(c.submittedAt).toLocaleString()}
                  </td>
                  {(user.role === "ChairHead" || user.role === "COC") && (
                    <td className="border border-gray-300 p-2">
                      {c.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(c._id, "Resolved")}
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(c._id, "Rejected")}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {c.status !== "Pending" && (
                        <p className="text-sm text-gray-500">
                          {c.status} by {c.resolvedBy?.name || "Unknown"} at{" "}
                          {c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : "N/A"}
                        </p>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Complaints;
