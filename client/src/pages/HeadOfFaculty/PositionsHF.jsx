import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  X,
  SortAsc,
  SortDesc,
  Filter,
  Briefcase,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const PositionsHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState({ name: "", exemption: 0 });
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [workloadRange, setWorkloadRange] = useState([0, 100]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [maxWorkload, setMaxWorkload] = useState(100);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/positions");
      setPositions(data);
      
      // Determine maximum workload for filter slider
      if (data.length > 0) {
        const maxExemption = Math.max(...data.map(p => p.exemption));
        setMaxWorkload(maxExemption > 0 ? maxExemption : 100);
        setWorkloadRange([0, maxExemption > 0 ? maxExemption : 100]);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast.error("Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "exemption") {
      setNewPosition({ ...newPosition, [e.target.name]: parseInt(e.target.value) || 0 });
    } else {
      setNewPosition({ ...newPosition, [e.target.name]: e.target.value });
    }
  };

  const resetForm = () => {
    setNewPosition({ name: "", exemption: 0 });
  };

  const handleAddPosition = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/positions", newPosition);
      resetForm();
      await fetchPositions();
      setOpenAddModal(false);
      toast.success("Position added successfully");
    } catch (error) {
      console.error("Error adding position:", error);
      toast.error("Failed to add position");
    }
    setLoading(false);
  };

  const handleEditPosition = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/positions/${selectedPosition._id}`, newPosition);
      resetForm();
      await fetchPositions();
      setOpenEditModal(false);
      toast.success("Position updated successfully");
    } catch (error) {
      console.error("Error updating position:", error);
      toast.error("Failed to update position");
    }
    setLoading(false);
  };

  const handleDeletePosition = async () => {
    setLoading(true);
    try {
      await api.delete(`/positions/${selectedPosition._id}`);
      await fetchPositions();
      setOpenDeleteModal(false);
      toast.success("Position deleted successfully");
    } catch (error) {
      console.error("Error deleting position:", error);
      toast.error("Failed to delete position");
    }
    setLoading(false);
  };

  const openEditPositionModal = (position) => {
    setSelectedPosition(position);
    setNewPosition({ name: position.name, exemption: position.exemption });
    setOpenEditModal(true);
  };

  const openDeletePositionModal = (position) => {
    setSelectedPosition(position);
    setOpenDeleteModal(true);
  };

  const handleWorkloadRangeChange = (e) => {
    setWorkloadRange([parseInt(e.target.min), parseInt(e.target.value)]);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setWorkloadRange([0, maxWorkload]);
    setSortConfig({ key: 'name', direction: 'asc' });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const toggleFiltersExpanded = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Memoized filtered and sorted positions
  const filteredPositions = useMemo(() => {
    let result = positions.filter((position) => {
      const matchesSearchTerm = position.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorkload = position.exemption >= workloadRange[0] && position.exemption <= workloadRange[1];
      return matchesSearchTerm && matchesWorkload;
    });

    // Sort based on current sort configuration
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [positions, searchTerm, workloadRange, sortConfig]);

  // Paginated positions
  const paginatedPositions = useMemo(() => {
    return filteredPositions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredPositions, page, rowsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPositions.length / rowsPerPage);

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Positions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage academic positions and workload exemptions
            </p>
          </div>
          <button
            onClick={() => setOpenAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:from-ind-700 hover:to-purple-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <Plus size={18} />
            <span>New Position</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h2>
          <button 
            onClick={toggleFiltersExpanded}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Filter size={16} />
            {filtersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by position name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
          
          {filtersExpanded && (
            <div className="pt-2">
              <label htmlFor="workload-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workload Exemption: {workloadRange[0]} - {workloadRange[1]} hours
              </label>
              <input
                id="workload-range"
                type="range"
                min="0"
                max={maxWorkload}
                value={workloadRange[1]}
                onChange={handleWorkloadRangeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={resetFilters}
              disabled={!searchTerm && workloadRange[0] === 0 && workloadRange[1] === maxWorkload}
              className={`flex items-center gap-1.5 text-sm py-1.5 px-3 rounded-lg ${
                !searchTerm && workloadRange[0] === 0 && workloadRange[1] === maxWorkload
                  ? "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
            >
              <RefreshCw size={14} />
              <span>Reset Filters</span>
            </button>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredPositions.length} of {positions.length} positions
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && positions.length === 0 && (
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
          <div className="h-72 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPositions.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mb-4">
            <Filter size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No positions found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No positions matching your search criteria. Try adjusting your filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw size={16} className="mr-2" />
            Reset Filters
          </button>
        </div>
      )}

      {/* Positions Table */}
      {!loading && filteredPositions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Position Name</span>
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' 
                          ? <SortAsc size={14} className="text-indigo-500" /> 
                          : <SortDesc size={14} className="text-indigo-500" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('exemption')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Workload Exemption</span>
                      {sortConfig.key === 'exemption' && (
                        sortConfig.direction === 'asc' 
                          ? <SortAsc size={14} className="text-indigo-500" /> 
                          : <SortDesc size={14} className="text-indigo-500" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPositions.map((position) => (
                  <tr key={position._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{position.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          position.exemption > 20 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          <Briefcase size={12} className="mr-1" />
                          {position.exemption} hours
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditPositionModal(position)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      >
                        <Edit2 size={16} />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => openDeletePositionModal(position)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to <span className="font-medium">
                      {Math.min((page + 1) * rowsPerPage, filteredPositions.length)}
                    </span> of <span className="font-medium">{filteredPositions.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handleChangePage(page - 1)}
                      disabled={page === 0}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                        page === 0
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleChangePage(index)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                          page === index
                            ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-200'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handleChangePage(page + 1)}
                      disabled={page >= totalPages - 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                        page >= totalPages - 1
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
              
              <div className="flex sm:hidden">
                <button
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    page === 0
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Previous
                </button>
                <div className="mx-2 text-sm text-gray-700 dark:text-gray-400">
                  Page {page + 1} of {totalPages}
                </div>
                <button
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className={`ml-auto relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    page >= totalPages - 1
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Position Modal */}
      {openAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 transition-opacity" style={{ zIndex: 40 }} aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ zIndex: 50 }}>
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Add New Position
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Position Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={newPosition.name}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter position name"
                        />
                      </div>
                      <div>
                        <label htmlFor="exemption" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Workload Exemption (hours)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            name="exemption"
                            id="exemption"
                            value={newPosition.exemption}
                            onChange={handleChange}
                            min="0"
                            className="block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">hours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddPosition}
                  disabled={loading || !newPosition.name || newPosition.exemption < 0}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading || !newPosition.name || newPosition.exemption < 0
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {loading ? "Adding..." : "Add Position"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {openEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 transition-opacity" style={{ zIndex: 40 }} aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ zIndex: 50 }}>
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Edit Position
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Position Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="edit-name"
                          value={newPosition.name}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter position name"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-exemption" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Workload Exemption (hours)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            name="exemption"
                            id="edit-exemption"
                            value={newPosition.exemption}
                            onChange={handleChange}
                            min="0"
                            className="block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">hours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditPosition}
                  disabled={loading || !newPosition.name || newPosition.exemption < 0}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading || !newPosition.name || newPosition.exemption < 0
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Updating..." : "Update Position"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenEditModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 transition-opacity" style={{ zIndex: 40 }} aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ zIndex: 50 }}>
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Delete Position
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete the position "{selectedPosition?.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeletePosition}
                  disabled={loading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PositionsHF;