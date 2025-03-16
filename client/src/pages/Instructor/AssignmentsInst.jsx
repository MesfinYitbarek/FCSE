import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";

const AssignmentsInst = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ 
    year: new Date().getFullYear(),
    semester: "",
    program: "" 
  });
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalWorkload: 0,
    programDistribution: {}
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Fetch assignments for the logged-in instructor
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/assignments/get/${user._id}`);
      setAssignments(data);
      
      // Calculate stats
      const totalCourses = data.length;
      const totalWorkload = data.reduce((sum, a) => sum + (a.workload || 0), 0);
      
      // Program distribution
      const programDist = {};
      data.forEach(a => {
        if (!programDist[a.program]) programDist[a.program] = 0;
        programDist[a.program]++;
      });
      
      setStats({
        totalCourses,
        totalWorkload,
        programDistribution: programDist
      });
      
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
    setLoading(false);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filter assignments based on criteria
  const filteredAssignments = assignments.filter(
    (assignment) => 
      (!filters.year || assignment.year === parseInt(filters.year)) &&
      (!filters.semester || assignment.semester === filters.semester) &&
      (!filters.program || assignment.program === filters.program)
  );

  // Get unique values for filter dropdowns
  const uniquePrograms = [...new Set(assignments.map(a => a.program))];
  const uniqueSemesters = [...new Set(assignments.map(a => a.semester))];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            My Course Assignments
          </h1>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Total Courses</div>
                  <div className="text-2xl font-bold text-slate-800">{stats.totalCourses}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-600 text-white p-3 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Total Workload</div>
                  <div className="text-2xl font-bold text-slate-800">{stats.totalWorkload} Hours</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-600 text-white p-3 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Programs</div>
                  <div className="text-2xl font-bold text-slate-800">{Object.keys(stats.programDistribution).length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-slate-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Assignments
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                <input
                  type="number"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Year"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">All Semesters</option>
                  {uniqueSemesters.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                <select
                  name="program"
                  value={filters.program}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">All Programs</option>
                  {uniquePrograms.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assignments List */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <h2 className="text-lg font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Assigned Courses
              </h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center p-8 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No assignments found with the current filters.</p>
                <button 
                  onClick={() => setFilters({ year: new Date().getFullYear(), semester: "", program: "" })}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="p-3 text-left font-semibold text-slate-700 border-b">Course</th>
                      <th className="p-3 text-left font-semibold text-slate-700 border-b">Year</th>
                      <th className="p-3 text-left font-semibold text-slate-700 border-b">Semester</th>
                      <th className="p-3 text-left font-semibold text-slate-700 border-b">Program</th>
                      <th className="p-3 text-left font-semibold text-slate-700 border-b">Section</th>
                      <th className="p-3 text-left font-semibold text-slate-700 border-b">Workload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment._id} className="hover:bg-slate-50">
                        <td className="p-3 border-b border-slate-200">
                          <div className="font-medium">{assignment.courseId?.name}</div>
                          <div className="text-sm text-slate-500">{assignment.courseId?.code}</div>
                        </td>
                        <td className="p-3 border-b border-slate-200">{assignment.year}</td>
                        <td className="p-3 border-b border-slate-200">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {assignment.semester}
                          </span>
                        </td>
                        <td className="p-3 border-b border-slate-200">{assignment.program}</td>
                        <td className="p-3 border-b border-slate-200">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                            {assignment.section}
                          </span>
                        </td>
                        <td className="p-3 border-b border-slate-200">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{assignment.workload} Hours</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsInst;