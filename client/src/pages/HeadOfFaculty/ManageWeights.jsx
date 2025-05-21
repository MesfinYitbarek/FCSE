import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import { Edit2, X, AlertTriangle, Save } from "lucide-react";

const ManageWeights = () => {
  const [preferenceWeights, setPreferenceWeights] = useState([]);
  const [courseExperienceWeights, setCourseExperienceWeights] = useState([]);
  const [form, setForm] = useState({ maxWeight: "", interval: "", type: "preference" });
  const [editingId, setEditingId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    setLoading(true);
    try {
      const prefRes = await api.get("/preference-weights");
      const expRes = await api.get("/course-experience-weights");
      setPreferenceWeights(prefRes.data);
      setCourseExperienceWeights(expRes.data);
    } catch (error) {
      console.error("Error fetching weights", error);
      toast.error("Failed to fetch weights");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { maxWeight, interval, type } = form;
    const url = type === "preference" ? "/preference-weights" : "/course-experience-weights";

    try {
      await api.put(`${url}/${editingId}`, { maxWeight, interval });
      toast.success("Weight updated successfully");
      fetchWeights();
      setForm({ maxWeight: "", interval: "", type: "preference" });
      setEditingId(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating weight", error);
      toast.error("Failed to update weight");
    }
  };

  const handleEdit = (weight, type) => {
    setForm({ maxWeight: weight.maxWeight, interval: weight.interval, type });
    setEditingId(weight._id);
    setIsEditModalOpen(true);
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Weights</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and edit preference and course experience weights
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preference Weights */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Preference Weights
            </h2>
            <div className="space-y-4">
              {preferenceWeights.map((weight) => (
                <motion.div
                  key={weight._id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Max Weight: {weight.maxWeight}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Interval: {weight.interval}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(weight, "preference")}
                      className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Edit weight"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Course Experience Weights */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Course Experience Weights
            </h2>
            <div className="space-y-4">
              {courseExperienceWeights.map((weight) => (
                <motion.div
                  key={weight._id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Max Weight: {weight.maxWeight}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Interval: {weight.interval}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(weight, "course")}
                      className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Edit weight"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Weight Modal */}
      {isEditModalOpen && (
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
                      Edit Weight
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="maxWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Max Weight
                        </label>
                        <input
                          type="number"
                          name="maxWeight"
                          id="maxWeight"
                          value={form.maxWeight}
                          onChange={(e) => setForm({ ...form, maxWeight: e.target.value })}
                          required
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter max weight"
                        />
                      </div>
                      <div>
                        <label htmlFor="interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Interval
                        </label>
                        <input
                          type="number"
                          name="interval"
                          id="interval"
                          value={form.interval}
                          onChange={(e) => setForm({ ...form, interval: e.target.value })}
                          required
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter interval"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Type: {form.type === "preference" ? "Preference Weight" : "Course Experience Weight"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Save size={16} className="mr-2" />
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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

export default ManageWeights;