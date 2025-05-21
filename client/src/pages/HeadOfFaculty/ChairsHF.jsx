import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import ReactDOM from 'react-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  Filter,
} from "lucide-react";

// Modal component using React Portal for more reliable rendering
const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  
  // Using portal to render modal at the document root level
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay - using modern Tailwind opacity syntax */}
        <div 
          className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 transition-opacity" 
          style={{ zIndex: 40 }}
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal content */}
        <div 
          className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          style={{ zIndex: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  {title}
                </h3>
                <div className="mt-4">
                  {children}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {footer}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ChairsHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [chairs, setChairs] = useState([]);
  const [chairHeads, setChairHeads] = useState([]);
  const [newChair, setNewChair] = useState({ name: "", head: "" });
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedChair, setSelectedChair] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHead, setFilterHead] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchChairs(), fetchChairHeads()]);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchChairs = async () => {
    try {
      const { data } = await api.get("/chairs");
      setChairs(data);
      return data;
    } catch (error) {
      console.error("Error fetching chairs:", error);
      throw error;
    }
  };

  const fetchChairHeads = async () => {
    try {
      const { data } = await api.get(`/users/role/${"ChairHead"}`);
      setChairHeads(data);
      return data;
    } catch (error) {
      console.error("Error fetching Chair Heads:", error);
      throw error;
    }
  };

  const handleChange = (e) => {
    setNewChair({ ...newChair, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setNewChair({ name: "", head: "" });
  };

  const handleAddChair = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/chairs/create", newChair);
      resetForm();
      await fetchChairs();
      setOpenAddModal(false);
      toast.success("Chair added successfully");
    } catch (error) {
      console.error("Error adding chair:", error);
      toast.error("Failed to add chair");
    }
    setLoading(false);
  };

  const handleEditChair = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/chairs/${selectedChair._id}`, newChair);
      resetForm();
      await fetchChairs();
      setOpenEditModal(false);
      toast.success("Chair updated successfully");
    } catch (error) {
      console.error("Error updating chair:", error);
      toast.error("Failed to update chair");
    }
    setLoading(false);
  };

  const handleDeleteChair = async () => {
    setLoading(true);
    try {
      await api.delete(`/chairs/${selectedChair._id}`);
      await fetchChairs();
      setOpenDeleteModal(false);
      toast.success("Chair deleted successfully");
    } catch (error) {
      console.error("Error deleting chair:", error);
      toast.error("Failed to delete chair");
    }
    setLoading(false);
  };

  const openEditChairModal = (chair) => {
    setSelectedChair(chair);
    setNewChair({ name: chair.name, head: chair.head?._id || "" });
    setOpenEditModal(true);
  };

  const openDeleteChairModal = (chair) => {
    setSelectedChair(chair);
    setOpenDeleteModal(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterHead("");
  };

  const toggleRowExpand = (chairId) => {
    setExpandedRow(expandedRow === chairId ? null : chairId);
  };

  // Memoized filtered and sorted chairs
  const filteredChairs = useMemo(() => {
    let result = chairs.filter((chair) => {
      const matchesSearchTerm = chair.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHead = filterHead ? chair.head?._id === filterHead : true;
      return matchesSearchTerm && matchesHead;
    });

    // Sort by name
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    return result;
  }, [chairs, searchTerm, filterHead, sortOrder]);

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Chair Departments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage academic chair departments and their heads
            </p>
          </div>
          <button
            onClick={() => setOpenAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus size={18} />
            <span>New Chair</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by chair name..."
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
          </div>
          <div>
            <select
              value={filterHead}
              onChange={(e) => setFilterHead(e.target.value)}
              className="block w-full py-2.5 px-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Chair Heads</option>
              {chairHeads.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={resetFilters}
            disabled={!searchTerm && !filterHead}
            className={`flex items-center gap-1.5 text-sm py-1.5 px-3 rounded-lg ${
              !searchTerm && !filterHead
                ? "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
          >
            <RefreshCw size={14} />
            <span>Reset Filters</span>
          </button>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredChairs.length} of {chairs.length} chairs
            </p>
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-1 text-sm py-1.5 px-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && chairs.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Chair Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Chair Head
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredChairs.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mb-4">
            <Filter size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No chairs found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No chairs matching your search criteria. Try adjusting your filters.
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

      {/* Chairs Table */}
      {!loading && filteredChairs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Chair Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Chair Head
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredChairs.map((chair) => (
                  <>
                    <tr 
                      key={chair._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => toggleRowExpand(chair._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {chair.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {chair.head ? (
                            <>
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                  {chair.head.fullName.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {chair.head.fullName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {chair.head.email}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                              Not assigned
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditChairModal(chair);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteChairModal(chair);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpand(chair._id);
                            }}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
                          >
                            {expandedRow === chair._id ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === chair._id && (
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td colSpan="3" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Chair Details
                              </h4>
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  <span className="font-medium">Created:</span> {new Date(chair.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {chair.head && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                  Chair Head Information
                                </h4>
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Email:</span> {chair.head.email}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Phone:</span> {chair.head.phone || 'Not provided'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Chair Modal using Portal */}
      <Modal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        title="Add New Chair"
        footer={
          <>
            <button
              type="button"
              onClick={handleAddChair}
              disabled={loading || !newChair.name}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                loading || !newChair.name
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Adding..." : "Add Chair"}
            </button>
            <button
              type="button"
              onClick={() => setOpenAddModal(false)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chair Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={newChair.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter chair name"
            />
          </div>
          <div>
            <label htmlFor="head" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chair Head
            </label>
            <select
              id="head"
              name="head"
              value={newChair.head}
              onChange={handleChange}
              className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Chair Head</option>
              {chairHeads.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Chair Modal using Portal */}
      <Modal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Chair"
        footer={
          <>
            <button
              type="button"
              onClick={handleEditChair}
              disabled={loading || !newChair.name}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                loading || !newChair.name
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Updating..." : "Update Chair"}
            </button>
            <button
              type="button"
              onClick={() => setOpenEditModal(false)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chair Name
            </label>
            <input
              type="text"
              name="name"
              id="edit-name"
              value={newChair.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter chair name"
            />
          </div>
          <div>
            <label htmlFor="edit-head" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chair Head
            </label>
            <select
              id="edit-head"
              name="head"
              value={newChair.head}
              onChange={handleChange}
              className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Chair Head</option>
              {chairHeads.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal using Portal */}
      <Modal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title="Delete Chair"
        footer={
          <>
            <button
              type="button"
              onClick={handleDeleteChair}
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
          </>
        }
      >
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete the chair "{selectedChair?.name}"? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChairsHF;