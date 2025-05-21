import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pencil, Trash2, Save, X, Loader2, AlertCircle, BookOpen, 
  Calendar, User, GraduationCap, BookText, Clock, FileBarChart
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const AssignedCourses = ({ fetchAssignments, assignments, currentFilters }) => {
  const [editingData, setEditingData] = useState({
    parentId: null,
    subId: null,
    data: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalInstructors: 0,
    totalWorkload: 0
  });

  // Filter assignments based on current filters
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      const filtered = assignments.filter(
        a => a.year == currentFilters.year && a.semester === currentFilters.semester
      );
      setFilteredAssignments(filtered);
      
      // Calculate stats
      const totalCourses = filtered.reduce((total, a) => total + a.assignments.length, 0);
      
      // Get unique instructors
      const instructors = new Set();
      filtered.forEach(a => {
        a.assignments.forEach(assign => {
          if (assign.instructorId?._id) {
            instructors.add(assign.instructorId._id);
          }
        });
      });
      
      // Calculate total workload
      const totalWorkload = filtered.reduce((total, a) => {
        return total + a.assignments.reduce((subtotal, assign) => subtotal + assign.workload, 0);
      }, 0).toFixed(2);
      
      setStats({
        totalCourses,
        totalInstructors: instructors.size,
        totalWorkload
      });
    }
  }, [assignments, currentFilters]);

  // Implementation of handleDelete function
  const handleDelete = async (parentId, subId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/assignments/sub/${parentId}/${subId}`);
      
      // Show success message
      setSuccess("Assignment deleted successfully");
      toast.success("Assignment deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh assignments
      await fetchAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError(err.response?.data?.message || "Failed to delete assignment");
      toast.error(err.response?.data?.message || "Failed to delete assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (parentAssignment, subAssignment) => {
    setEditingData({
      parentId: parentAssignment._id,
      subId: subAssignment._id,
      data: {
        instructorId: subAssignment.instructorId?._id || "",
        courseId: subAssignment.courseId?._id || "",
        section: subAssignment.section || "",
        NoOfSections: subAssignment.NoOfSections || 1,
        labDivision: subAssignment.labDivision || "No",
        workload: subAssignment.workload
      }
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setEditingData({
      ...editingData,
      data: {
        ...editingData.data,
        [name]: value
      }
    });
  };
  
  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { parentId, subId, data } = editingData;
      await api.put(`/assignments/sub/${parentId}/${subId}`, data);
      
      // Show success message
      setSuccess("Assignment updated successfully");
      toast.success("Assignment updated successfully");
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh assignments
      await fetchAssignments();
      
      // Clear editing state
      setEditingData({
        parentId: null,
        subId: null,
        data: {}
      });
    } catch (err) {
      console.error("Error updating assignment:", err);
      setError(err.response?.data?.message || "Failed to update assignment");
      toast.error(err.response?.data?.message || "Failed to update assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingData({
      parentId: null,
      subId: null,
      data: {}
    });
  };

  // Group assignments by program
  const assignmentsByProgram = {};
  filteredAssignments.forEach(assignment => {
    if (!assignmentsByProgram[assignment.program]) {
      assignmentsByProgram[assignment.program] = [];
    }
    assignmentsByProgram[assignment.program].push(assignment);
  });

  return (
    <div>
      {/* Header with current filters and stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-6 mb-4 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold mb-1 text-center sm:text-left">
              {currentFilters.semester} {currentFilters.year} Assignments
            </h2>
            <p className="opacity-80 text-xs sm:text-sm text-center sm:text-left">
              Showing all assigned courses for the selected academic period
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center">
              <div className="p-1.5 bg-white/20 rounded-lg mr-2 flex-shrink-0">
                <BookText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium opacity-80">Total Courses</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center">
              <div className="p-1.5 bg-white/20 rounded-lg mr-2 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium opacity-80">Instructors</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalInstructors}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center">
              <div className="p-1.5 bg-white/20 rounded-lg mr-2 flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium opacity-80">Total Workload</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalWorkload} hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-lg p-3 flex items-center"
        >
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mr-2 h-4 w-4" />
          <span className="text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm">Processing updates...</span>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3 flex items-center"
        >
          <AlertCircle className="text-red-600 dark:text-red-400 mr-2 h-4 w-4" />
          <span className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-3 flex items-center"
        >
          <BookOpen className="text-green-600 dark:text-green-400 mr-2 h-4 w-4" />
          <span className="text-green-700 dark:text-green-300 text-xs sm:text-sm">{success}</span>
        </motion.div>
      )}

      {filteredAssignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-12 text-center">
          <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3">
            <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-1">
            No Assignments Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-xs sm:text-sm">
            No courses have been assigned for {currentFilters.semester} {currentFilters.year}. 
            Use the Manual or Automatic assignment options to assign courses.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(assignmentsByProgram).map(program => (
            <div key={program} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 mr-1.5 flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">{program} Program</h3>
                </div>
              </div>
              
              {/* Table View for Tablet and Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Section
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Lab Division
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Credit Hour
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {assignmentsByProgram[program].flatMap(parentAssignment => 
                      parentAssignment.assignments.map((assignment, idx) => (
                        <tr key={`${parentAssignment._id}-${assignment._id}`} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {assignment.courseId?.code || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                                {assignment.courseId?.name || "Unknown Course"}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white truncate max-w-[180px]">
                              {assignment.instructorId?.fullName || "Unassigned"}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {editingData.parentId === parentAssignment._id && editingData.subId === assignment._id ? (
                              <input
                                type="text"
                                name="section"
                                value={editingData.data.section}
                                onChange={handleUpdateChange}
                                className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                              />
                            ) : (
                              assignment.section || "N/A"
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {editingData.parentId === parentAssignment._id && editingData.subId === assignment._id ? (
                              <select
                                name="labDivision"
                                value={editingData.data.labDivision}
                                onChange={handleUpdateChange}
                                className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                              >
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                assignment.labDivision === "Yes" 
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" 
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              }`}>
                                {assignment.labDivision || "No"}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {editingData.parentId === parentAssignment._id && editingData.subId === assignment._id ? (
                              <input
                                type="number"
                                name="workload"
                                step="0.01"
                                value={editingData.data.workload}
                                onChange={handleUpdateChange}
                                className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {assignment.workload} hrs
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                            {editingData.parentId === parentAssignment._id && editingData.subId === assignment._id ? (
                              <div className="flex justify-end space-x-1">
                                <button
                                  onClick={handleUpdate}
                                  className="text-white bg-green-600 hover:bg-green-700 px-1.5 py-0.5 rounded"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-white bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 px-1.5 py-0.5 rounded"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-1">
                                <button
                                  onClick={() => handleEditClick(parentAssignment, assignment)}
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(parentAssignment._id, assignment._id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Card View for Mobile */}
              <div className="sm:hidden p-3 space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {assignmentsByProgram[program].flatMap(parentAssignment => 
                    parentAssignment.assignments.map((assignment, idx) => (
                      <motion.div
                        key={`${parentAssignment._id}-${assignment._id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">
                                {assignment.courseId?.code || "N/A"}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                {assignment.courseId?.name || "Unknown Course"}
                              </p>
                            </div>
                            <div>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                {assignment.workload} hrs
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2 space-y-1.5">
                          <div className="flex items-center text-xs">
                            <User className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                              {assignment.instructorId?.fullName || "Unassigned"}
                            </span>
                          </div>
                          
                          {editingData.parentId === parentAssignment._id && editingData.subId === assignment._id ? (
                            <div className="pt-1.5 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Lab Division</label>
                                  <select
                                    name="labDivision"
                                    value={editingData.data.labDivision}
                                    onChange={handleUpdateChange}
                                    className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                                  >
                                    <option value="No">No Lab</option>
                                    <option value="Yes">With Lab</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Section</label>
                                  <input
                                    name="section"
                                    placeholder="Section"
                                    value={editingData.data.section}
                                    onChange={handleUpdateChange}
                                    className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Workload</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  name="workload"
                                  placeholder="Workload"
                                  value={editingData.data.workload}
                                  onChange={handleUpdateChange}
                                  className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-1.5 pt-1.5">
                                <button
                                  onClick={handleUpdate}
                                  className="flex items-center text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-1.5 py-0.5 rounded"
                                >
                                  <Save className="h-3 w-3 mr-0.5 flex-shrink-0" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center text-xs font-medium text-white bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 px-1.5 py-0.5 rounded"
                                >
                                  <X className="h-3 w-3 mr-0.5 flex-shrink-0" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-xs flex-wrap gap-y-0.5">
                                <div className="flex items-center">
                                  <FileBarChart className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">Section: {assignment.section || "N/A"}</span>
                                </div>
                                <div className="flex items-center">
                                  <BookOpen className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">Lab: {assignment.labDivision || "No"}</span>
                                </div>
                              </div>
                              
                              <div className="pt-1.5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                <button
                                  onClick={() => handleEditClick(parentAssignment, assignment)}
                                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                >
                                  <div className="flex items-center">
                                    <Pencil className="h-3 w-3 mr-0.5 flex-shrink-0" />
                                    Edit
                                  </div>
                                </button>
                                <button
                                  onClick={() => handleDelete(parentAssignment._id, assignment._id)}
                                  className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                >
                                  <div className="flex items-center">
                                    <Trash2 className="h-3 w-3 mr-0.5 flex-shrink-0" />
                                    Remove
                                  </div>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedCourses;