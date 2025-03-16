import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { saveAs } from "file-saver";
import { FiDownload, FiFilter, FiBarChart2, FiSearch } from "react-icons/fi";

const ReportsHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    program: "All",
    sortBy: "instructor",
    sortOrder: "asc",
    minHours: "",
    maxHours: ""
  });
  const [stats, setStats] = useState({ 
    totalInstructors: 0,
    averageHours: 0,
    maxHours: 0
  });

  // Fetch instructor workload data
  useEffect(() => {
    fetchWorkload();
  }, []);

  const fetchWorkload = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reports/workload");
      setWorkload(data);
      
      // Calculate statistics
      const totalHours = data.reduce((sum, item) => sum + item.totalHours, 0);
      const maxHours = Math.max(...data.map(item => item.totalHours));
      
      setStats({
        totalInstructors: data.length,
        averageHours: data.length ? (totalHours / data.length).toFixed(1) : 0,
        maxHours
      });
    } catch (error) {
      console.error("Error fetching workload:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Toggle sort order
  const toggleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
    }));
  };

  // Filtered and sorted workload data
  const filteredWorkload = useMemo(() => {
    return workload
      .filter(w => {
        // Filter by program
        if (filters.program !== "All" && w.program !== filters.program) return false;
        
        // Filter by search term
        if (search && !w.instructor.toLowerCase().includes(search.toLowerCase())) return false;
        
        // Filter by hours range
        if (filters.minHours && w.totalHours < parseInt(filters.minHours)) return false;
        if (filters.maxHours && w.totalHours > parseInt(filters.maxHours)) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Sort based on selected field
        const aValue = a[filters.sortBy];
        const bValue = b[filters.sortBy];
        
        if (typeof aValue === 'string') {
          return filters.sortOrder === "asc" 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        } else {
          return filters.sortOrder === "asc" 
            ? aValue - bValue 
            : bValue - aValue;
        }
      });
  }, [workload, filters, search]);

  // Export data as CSV
  const exportCSV = () => {
    const csvData = filteredWorkload
      .map((w) => `${w.instructor},${w.program},${w.totalCourses},${w.totalHours}`)
      .join("\n");

    const blob = new Blob([`Instructor,Program,Total Courses,Total Hours\n${csvData}`], {
      type: "text/csv;charset=utf-8;"
    });

    saveAs(blob, `workload_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Faculty Workload Reports</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm uppercase">Total Instructors</p>
            <p className="text-3xl font-bold">{stats.totalInstructors}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm uppercase">Average Hours</p>
            <p className="text-3xl font-bold">{stats.averageHours}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm uppercase">Maximum Hours</p>
            <p className="text-3xl font-bold">{stats.maxHours}</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <FiFilter className="text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select
                name="program"
                value={filters.program}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="All">All Programs</option>
                <option value="Regular">Regular</option>
                <option value="Common">Common</option>
                <option value="Extension">Extension</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Hours</label>
              <input
                type="number"
                name="minHours"
                value={filters.minHours}
                onChange={handleFilterChange}
                placeholder="Min Hours"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours</label>
              <input
                type="number"
                name="maxHours"
                value={filters.maxHours}
                onChange={handleFilterChange}
                placeholder="Max Hours"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search instructors..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredWorkload.length} of {workload.length} records
            </p>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              <FiDownload /> Export as CSV
            </button>
          </div>
        </div>

        {/* Workload Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <FiBarChart2 className="text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Instructor Workload</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading workload data...</p>
            </div>
          ) : filteredWorkload.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No workload data found matching your filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort("instructor")}
                    >
                      <div className="flex items-center">
                        Instructor
                        {filters.sortBy === "instructor" && (
                          <span className="ml-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort("program")}
                    >
                      <div className="flex items-center">
                        Program
                        {filters.sortBy === "program" && (
                          <span className="ml-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort("totalCourses")}
                    >
                      <div className="flex items-center">
                        Total Courses
                        {filters.sortBy === "totalCourses" && (
                          <span className="ml-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort("totalHours")}
                    >
                      <div className="flex items-center">
                        Total Hours
                        {filters.sortBy === "totalHours" && (
                          <span className="ml-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorkload.map((w, index) => (
                    <tr 
                      key={index} 
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{w.instructor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          w.program === "Regular" ? "bg-blue-100 text-blue-800" :
                          w.program === "Common" ? "bg-green-100 text-green-800" :
                          w.program === "Extension" ? "bg-purple-100 text-purple-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {w.program}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{w.totalCourses}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{w.totalHours}</span>
                          <div className="w-24 h-2 bg-gray-200 rounded">
                            <div 
                              className={`h-full rounded ${
                                w.totalHours > 15 ? "bg-red-500" :
                                w.totalHours > 12 ? "bg-yellow-500" :
                                "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(100, (w.totalHours / stats.maxHours) * 100)}%` }}
                            ></div>
                          </div>
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
  );
};

export default ReportsHF;