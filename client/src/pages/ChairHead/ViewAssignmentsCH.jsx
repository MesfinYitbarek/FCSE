
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";

const ViewAssignmentsCH = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ instructorId: "", courseId: "", year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchInstructors();
    fetchCourses();
  }, []);

  // Fetch assignments under this Chair Head
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/assignments/chair/${user.chair}`);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
    setLoading(false);
  };

  // Fetch instructors under this Chair Head
  const fetchInstructors = async () => {
    try {
      const { data } = await api.get(`/instructors?chairId=${user.chair}`);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  // Fetch courses under this Chair Head
  const fetchCourses = async () => {
    try {
      const { data } = await api.get(`/courses/chair/${user.chair}`);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply filters
  const filteredAssignments = assignments.filter((assignment) => {
    return (
      (!filters.instructorId || assignment.instructorId?._id === filters.instructorId) &&
      (!filters.courseId || assignment.courseId?._id === filters.courseId) &&
      (!filters.year || assignment.year === parseInt(filters.year))
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Assigned Courses</h1>

      {/* Filter Section */}
      <div className="mt-4 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="instructorId" value={filters.instructorId} onChange={handleFilterChange} className="p-2 border rounded">
            <option value="">All Instructors</option>
            {instructors.map((inst) => (
              <option key={inst._id} value={inst._id}>{inst.userId?.name}</option>
            ))}
          </select>
          <select name="courseId" value={filters.courseId} onChange={handleFilterChange} className="p-2 border rounded">
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          <input type="number" name="year" value={filters.year} onChange={handleFilterChange} className="p-2 border rounded" placeholder="Year" />
        </div>
      </div>

      {/* Assignments List */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Assignments</h2>
        {filteredAssignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Instructor</th>
                <th className="border border-gray-300 p-2">Course</th>
                <th className="border border-gray-300 p-2">Year</th>
                <th className="border border-gray-300 p-2">Section</th>
                <th className="border border-gray-300 p-2">Workload</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment._id} className="text-center">
                  <td className="border border-gray-300 p-2">{assignment.instructorId?.userId?.name}</td>
                  <td className="border border-gray-300 p-2">{assignment.courseId?.name}</td>
                  <td className="border border-gray-300 p-2">{assignment.year}</td>
                  <td className="border border-gray-300 p-2">{assignment.section}</td>
                  <td className="border border-gray-300 p-2">{assignment.workload} Hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewAssignmentsCH;
