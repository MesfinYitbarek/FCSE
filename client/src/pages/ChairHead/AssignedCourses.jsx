import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pencil, Trash2, Save, X, Loader, AlertCircle, BookOpen, 
  Calendar, User, GraduationCap, BookText, Clock, FileBarChart
} from 'lucide-react';

const AssignedCourses = ({ fetchAssignments, assignments, handleDelete, currentFilters }) => {
  const [editingId, setEditingId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      }, 0);
      
      setStats({
        totalCourses,
        totalInstructors: instructors.size,
        totalWorkload
      });
    }
  }, [assignments, currentFilters]);

  const handleEditClick = (assignment) => {
    setEditingId(assignment._id);
    setUpdatedData({
      year: assignment.year,
      semester: assignment.semester,
      program: assignment.program,
      assignments: assignment.assignments.map(a => ({
        instructorId: a.instructorId?._id || "",
        courseId: a.courseId?._id || "",
        section: a.section || "",
        labDivision: a.labDivision || "No",
        workload: a.workload
      }))
    });
  };

  const handleUpdateChange = (e, field, assignmentIndex) => {
    if (assignmentIndex !== undefined) {
      const newAssignments = [...updatedData.assignments];
      newAssignments[assignmentIndex] = {
        ...newAssignments[assignmentIndex],
        [field]: e.target.value
      };
      setUpdatedData({ ...updatedData, assignments: newAssignments });
    } else {
      setUpdatedData({ ...updatedData, [field]: e.target.value });
    }
  };
  
  // Placeholder for the update function
  const handleUpdate = async (assignmentId) => {
    // Implement your update logic here
    console.log("Updating assignment", assignmentId, updatedData);
    setEditingId(null);
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
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {currentFilters.semester} {currentFilters.year} Assignments
            </h2>
            <p className="opacity-80">
              Showing all assigned courses for the selected academic period
            </p>
          </div>
          <button 
            onClick={fetchAssignments} 
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Refresh Data
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <BookText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-80">Total Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-80">Instructors</p>
                <p className="text-2xl font-bold">{stats.totalInstructors}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-80">Total Workload</p>
                <p className="text-2xl font-bold">{stats.totalWorkload} hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center"
        >
          <Loader className="animate-spin text-blue-600 mr-3" />
          <span className="text-blue-700">Processing updates...</span>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center"
        >
          <AlertCircle className="text-red-600 mr-3" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="inline-flex p-4 bg-blue-50 rounded-full mb-4">
            <Calendar className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Assignments Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No courses have been assigned for {currentFilters.semester} {currentFilters.year}. 
            Use the Manual or Automatic assignment options to assign courses.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(assignmentsByProgram).map(program => (
            <div key={program} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">{program}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {assignmentsByProgram[program].flatMap(assignment => 
                    assignment.assignments.map((assign, idx) => (
                      <motion.div
                        key={`${assignment._id}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {assign.courseId?.code}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {assign.courseId?.name}
                              </p>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                assign.workload >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {assign.workload} hrs
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-gray-700 font-medium">
                              {assign.instructorId?.fullName || "No instructor"}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <FileBarChart className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-700">Section: {assign.section}</span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-700">Lab: {assign.labDivision}</span>
                            </div>
                          </div>
                          
                          {editingId === assignment._id ? (
                            <div className="pt-3 border-t border-gray-100 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={updatedData.assignments[idx].labDivision}
                                  onChange={(e) => handleUpdateChange(e, "labDivision", idx)}
                                  className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="No">No Lab</option>
                                  <option value="Yes">With Lab</option>
                                </select>
                                <input
                                  placeholder="Section"
                                  value={updatedData.assignments[idx].section}
                                  onChange={(e) => handleUpdateChange(e, "section", idx)}
                                  className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Workload"
                                value={updatedData.assignments[idx].workload}
                                onChange={(e) => handleUpdateChange(e, "workload", idx)}
                                className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ) : (
                            <div className="pt-3 border-t border-gray-100 flex justify-between">
                              <button
                                onClick={() => handleEditClick(assignment)}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800"
                              >
                                <div className="flex items-center">
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Edit
                                </div>
                              </button>
                              <button
                                onClick={() => handleDelete(assignment._id)}
                                className="text-xs font-medium text-red-600 hover:text-red-800"
                              >
                                <div className="flex items-center">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                {editingId && assignmentsByProgram[program].some(a => a._id === editingId) && (
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => handleUpdate(editingId)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Save size={16} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedCourses;