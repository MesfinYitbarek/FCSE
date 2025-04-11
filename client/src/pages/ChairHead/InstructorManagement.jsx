import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { 
  Users, Plus, Search, Trash2, Filter, User, 
  ArrowUpDown, ChevronDown, X, AlertCircle, Loader2 
} from "lucide-react";
import { toast } from "react-hot-toast";

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
  const [activeFilters, setActiveFilters] = useState([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

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
      toast.success("Instructor added successfully!");
    } catch (error) {
      console.error("Error creating instructor:", error);
      toast.error(error.response?.data?.message || "Failed to add instructor");
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
      toast.success("Instructor removed successfully!");
    } catch (error) {
      console.error("Error deleting instructor:", error);
      toast.error(error.response?.data?.message || "Failed to delete instructor");
    } finally {
      setActionLoading(false);
    }
  };

  // Add filter tag
  const addFilter = (type, value) => {
    if (!activeFilters.some(f => f.type === type && f.value === value)) {
      setActiveFilters([...activeFilters, { type, value }]);
    }
    setIsFilterDropdownOpen(false);
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
        }
        return 0;
      });
    }

    return filtered;
  }, [instructors, searchTerm, sortConfig]);

  // Eligible users for adding as instructors (not already instructors)
  const eligibleUsers = useMemo(() => {
    const instructorUserIds = instructors.map(inst => inst.userId._id);
    return users.filter(user => !instructorUserIds.includes(user._id));
  }, [users, instructors]);

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Instructor Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage instructors for {user.chair} department
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60"
          disabled={eligibleUsers.length === 0}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Instructor
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="m-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
          <button 
            className="ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" 
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search and filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-base"
            />
          </div>
        </div>
        
        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div key={index} className="inline-flex items-center bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-1 text-sm text-indigo-700 dark:text-indigo-300">
                {filter.type === 'workload' && (
                  <>
                    {filter.value === 'has-workload' ? 'Has workload' : 'No workload'}
                  </>
                )}
                <button 
                  className="ml-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  onClick={() => removeFilter(index)}
                  aria-label="Remove filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            <button 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 underline"
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
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading instructors...</p>
        </div>
      ) : (
        <>
          {/* Instructors Table - Visible on medium screens and larger */}
          {filteredInstructors.length > 0 ? (
            <>
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => requestSort('name')}
                      >
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Instructor
                          <ArrowUpDown className={`w-4 h-4 ml-1 ${sortConfig.key === 'name' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`} />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredInstructors.map((inst) => (
                      <tr key={inst._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-800 dark:text-indigo-300 font-medium">
                              {inst.userId.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{inst.userId.fullName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{inst.userId.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {deleteConfirmId === inst._id ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm"
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
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                              title="Remove instructor"
                              aria-label="Remove instructor"
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

              {/* Mobile view - Cards for small screens */}
              <div className="md:hidden space-y-4 p-4">
                {filteredInstructors.map((inst) => (
                  <div key={inst._id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-800 dark:text-indigo-300 font-medium">
                          {inst.userId.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{inst.userId.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{inst.userId.email}</div>
                        </div>
                      </div>
                      
                      {deleteConfirmId === inst._id ? (
                        <div className="flex flex-col items-end gap-2 mt-2">
                          <button
                            onClick={() => handleDeleteInstructor(inst._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md text-xs flex items-center"
                            disabled={actionLoading}
                          >
                            {actionLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(inst._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                          title="Remove instructor"
                          aria-label="Remove instructor"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8 text-center py-12 bg-gray-50 dark:bg-slate-800/50">
              <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No instructors found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || activeFilters.length > 0 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding a new instructor"}
              </p>
              {(searchTerm || activeFilters.length > 0) && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilters([]);
                  }}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add instructor modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Instructor</h3>
            </div>
            
            <div className="p-6">
              {eligibleUsers.length > 0 ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select User
                  </label>
                  <select 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)} 
                    className="w-full text-base px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 dark:text-gray-200"
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
                  <p className="text-gray-500 dark:text-gray-400">All eligible users are already instructors.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 flex flex-col sm:flex-row-reverse gap-2">
              <button
                onClick={handleCreateInstructor}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center disabled:opacity-60"
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
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement;