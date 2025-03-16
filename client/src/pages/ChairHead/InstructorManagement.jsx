import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Users, Plus, Search, Trash2, Filter, User, Clock, 
  ArrowUpDown, ChevronDown, X, AlertCircle, Loader2 
} from "lucide-react";

const InstructorManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [instructors, setInstructors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Filtering and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filterWorkload, setFilterWorkload] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    fetchInstructors();
    fetchUsers();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/instructors/chair/${user.chair}`);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError("Failed to load instructors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`/users/users/${user.chair}`);
      setUsers(data.filter(user => user.role === "Instructor")); 
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateInstructor = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setActionLoading(true);
      await api.post("/instructors", { userId: selectedUser });
      await fetchInstructors();
      setSelectedUser("");
      setIsAddModalOpen(false);
      // Show success message
      const successMessage = document.getElementById("success-message");
      successMessage.classList.remove("hidden");
      setTimeout(() => successMessage.classList.add("hidden"), 3000);
    } catch (error) {
      console.error("Error creating instructor:", error);
      setError(error.response?.data?.message || "Failed to add instructor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInstructor = async (id) => {
    try {
      setActionLoading(true);
      await api.delete(`/instructors/${id}`);
      await fetchInstructors();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting instructor:", error);
      setError(error.response?.data?.message || "Failed to delete instructor");
    } finally {
      setActionLoading(false);
    }
  };

  // Add filter tag
  const addFilter = (type, value) => {
    if (!activeFilters.some(f => f.type === type && f.value === value)) {
      setActiveFilters([...activeFilters, { type, value }]);
    }
  };

  // Remove filter tag
  const removeFilter = (index) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index));
  };

  // Sorting handler
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtered and sorted instructors
  const filteredInstructors = useMemo(() => {
    let filtered = [...instructors];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(inst => 
        inst.userId.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filters
    activeFilters.forEach(filter => {
      if (filter.type === 'workload') {
        if (filter.value === 'has-workload') {
          filtered = filtered.filter(inst => inst.workload.length > 0);
        } else if (filter.value === 'no-workload') {
          filtered = filtered.filter(inst => inst.workload.length === 0);
        }
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'name') {
          let aValue = a.userId.fullName;
          let bValue = b.userId.fullName;
          if (sortConfig.direction === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        } else if (sortConfig.key === 'workload') {
          let aValue = a.workload.length;
          let bValue = b.workload.length;
          if (sortConfig.direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [instructors, searchTerm, activeFilters, sortConfig]);

  // Eligible users for adding as instructors (not already instructors)
  const eligibleUsers = useMemo(() => {
    const instructorUserIds = instructors.map(inst => inst.userId._id);
    return users.filter(user => !instructorUserIds.includes(user._id));
  }, [users, instructors]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Instructor Management</h1>
          <p className="text-gray-500 mt-1">
            Manage instructors for {user.chair} department
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          disabled={eligibleUsers.length === 0}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Instructor
        </button>
      </div>

      {/* Success message */}
      <div id="success-message" className="hidden mb-4 bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center">
        <div className="mr-3 bg-green-100 rounded-full p-1">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
          </svg>
        </div>
        <span>Instructor added successfully!</span>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <span>{error}</span>
          <button 
            className="ml-auto text-red-500 hover:text-red-700" 
            onClick={() => setError(null)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => document.getElementById('filter-dropdown').classList.toggle('hidden')}
            >
              <Filter className="w-5 h-5 mr-2 text-gray-600" />
              <span>Filters</span>
              <ChevronDown className="w-4 h-4 ml-2 text-gray-600" />
            </button>
            
            <div id="filter-dropdown" className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 hidden">
              <div className="p-2">
                <h3 className="font-medium text-gray-700 mb-2">Workload Status</h3>
                <div className="space-y-2">
                  <button 
                    className="flex items-center w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100"
                    onClick={() => {
                      addFilter('workload', 'has-workload');
                      document.getElementById('filter-dropdown').classList.add('hidden');
                    }}
                  >
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    Has workload
                  </button>
                  <button 
                    className="flex items-center w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100"
                    onClick={() => {
                      addFilter('workload', 'no-workload');
                      document.getElementById('filter-dropdown').classList.add('hidden');
                    }}
                  >
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    No workload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div key={index} className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm text-blue-700">
                {filter.type === 'workload' && (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    {filter.value === 'has-workload' ? 'Has workload' : 'No workload'}
                  </>
                )}
                <button 
                  className="ml-2 text-blue-500 hover:text-blue-700"
                  onClick={() => removeFilter(index)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            <button 
              className="text-sm text-gray-600 hover:text-gray-800 underline"
              onClick={() => setActiveFilters([])}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading instructors...</p>
        </div>
      ) : (
        <>
          {/* Instructors Table */}
          {filteredInstructors.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Instructor
                        <ArrowUpDown className={`w-4 h-4 ml-1 ${sortConfig.key === 'name' ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('workload')}
                    >
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Workload
                        <ArrowUpDown className={`w-4 h-4 ml-1 ${sortConfig.key === 'workload' ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInstructors.map((inst) => (
                    <tr key={inst._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                            {inst.userId.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{inst.userId.fullName}</div>
                            <div className="text-sm text-gray-500">{inst.userId.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {inst.workload.length === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            No workload
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {inst.workload.map((wl, index) => (
                              <div key={`${wl.year}-${wl.semester}-${wl.program}-${index}`} className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                  {wl.year} {wl.semester}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {wl.program}: <span className="font-medium">{wl.value} hrs</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {deleteConfirmId === inst._id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteInstructor(inst._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
                              disabled={actionLoading}
                            >
                              {actionLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                              Confirm
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(inst._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Remove instructor"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No instructors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || activeFilters.length > 0 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding a new instructor"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Add instructor modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Instructor</h3>
            </div>
            
            <div className="p-6">
              {eligibleUsers.length > 0 ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a User</option>
                    {eligibleUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.fullName} - {user.email}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">All eligible users are already instructors.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInstructor}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={!selectedUser || actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Instructor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement;