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
  Info,
  ScrollText,
  Book,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from "lucide-react";

const RulesHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ ruleName: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentTab, setCurrentTab] = useState(0);
  const [expandedRule, setExpandedRule] = useState(null);

  // Fetch all rules
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rules");
      setRules(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
      toast.error("Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert value field to number if it's the value field
    if (name === "value") {
      setNewRule({ 
        ...newRule, 
        [name]: value === "" ? "" : Number(value) 
      });
    } else {
      setNewRule({ ...newRule, [name]: value });
    }
  };

  const resetForm = () => {
    setNewRule({ ruleName: "", description: "" });
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/rules", newRule);
      resetForm();
      await fetchRules();
      setOpenAddModal(false);
      toast.success("Rule added successfully");
    } catch (error) {
      console.error("Error adding rule:", error);
      toast.error("Failed to add rule");
    }
    setLoading(false);
  };

  const handleEditRule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/rules/${selectedRule._id}`, newRule);
      resetForm();
      await fetchRules();
      setOpenEditModal(false);
      toast.success("Rule updated successfully");
    } catch (error) {
      console.error("Error updating rule:", error);
      toast.error("Failed to update rule");
    }
    setLoading(false);
  };

  const handleDeleteRule = async () => {
    setLoading(true);
    try {
      await api.delete(`/rules/${selectedRule._id}`);
      await fetchRules();
      setOpenDeleteModal(false);
      toast.success("Rule deleted successfully");
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error("Failed to delete rule");
    }
    setLoading(false);
  };

  const openEditRuleModal = (rule) => {
    setSelectedRule(rule);
    setNewRule({ 
      ruleName: rule.ruleName, 
      description: rule.description || "",
      value: rule.value !== undefined ? rule.value : "" 
    });
    setOpenEditModal(true);
  };

  const openDeleteRuleModal = (rule) => {
    setSelectedRule(rule);
    setOpenDeleteModal(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const toggleExpandRule = (ruleId) => {
    if (expandedRule === ruleId) {
      setExpandedRule(null);
    } else {
      setExpandedRule(ruleId);
    }
  };

  const switchTab = (tabIndex) => {
    setCurrentTab(tabIndex);
  };

  // Memoized filtered and sorted rules
  const filteredRules = useMemo(() => {
    let result = rules.filter((rule) => {
      const matchesSearchTerm =
        rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearchTerm;
    });

    // Sort by ruleName
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.ruleName.localeCompare(b.ruleName);
      } else {
        return b.ruleName.localeCompare(a.ruleName);
      }
    });

    return result;
  }, [rules, searchTerm, sortOrder]);

  // Check if it's a small screen based on client-side rendering
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Assignment Rules</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage rules and guidelines for course assignments
            </p>
          </div>
          <button
            onClick={() => setOpenAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus size={18} />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-9">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title or description..."
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
          <div className="md:col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            {filteredRules.length} rules found
          </div>
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={toggleSortOrder}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-6">
        <div className="flex">
          <button
            onClick={() => switchTab(0)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentTab === 0
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <ScrollText size={18} />
            <span>Rules List</span>
          </button>
          <button
            onClick={() => switchTab(1)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentTab === 1
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Info size={18} />
            <span>About Rules</span>
          </button>
        </div>
      </div>

      {/* Rules List Tab */}
      {currentTab === 0 && (
        <>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {filteredRules.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                  <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mb-4">
                    <Filter size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No rules found</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    No rules matching your search criteria. Try adjusting your search terms.
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRules.map((rule) => (
                    <motion.div
                      key={rule._id}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all p-4"
                    >
                      <div className="flex flex-wrap md:flex-nowrap items-start justify-between">
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 mr-3 flex-shrink-0">
                              <Book size={20} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                {rule.ruleName}
                              </h3>
                              
                              {rule.value !== undefined && rule.value !== null && rule.value !== "" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mt-1">
                                  Value: {rule.value}
                                </span>
                              )}
                              
                              {isMobile && expandedRule !== rule._id ? (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {rule.description}
                                </p>
                              ) : (
                                <div className={`mt-2 ${expandedRule === rule._id ? 'block' : isMobile ? 'hidden' : 'block'}`}>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {rule.description}
                                  </p>
                                </div>
                              )}
                              
                              {isMobile && (
                                <button
                                  onClick={() => toggleExpandRule(rule._id)}
                                  className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                                >
                                  {expandedRule === rule._id ? (
                                    <>
                                      <ChevronUp size={16} className="mr-1" />
                                      <span>Show Less</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={16} className="mr-1" />
                                      <span>Read More</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 mt-3 md:mt-0">
                          <button
                            onClick={() => openEditRuleModal(rule)}
                            className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Edit rule"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteRuleModal(rule)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Delete rule"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* About Rules Tab */}
      {currentTab === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 mr-4">
              <Info size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              About Assignment Rules
            </h2>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Assignment rules help ensure consistency and fairness in course assignments.
              These rules define how courses are assigned to instructors based on various factors like
              expertise, workload, and scheduling preferences.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Rules can specify constraints such as maximum teaching hours, preferred teaching times,
              course expertise requirements, and other important assignment criteria.
            </p>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border-l-4 border-indigo-500 mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Best Practices for Creating Rules:
              </h3>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Keep rule titles concise and descriptive</li>
                <li>Provide detailed explanations in the description</li>
                <li>Ensure rules are objective and measurable</li>
                <li>Update rules as policies change</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {openAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Add New Rule
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="ruleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Rule Title
                        </label>
                        <input
                          type="text"
                          name="ruleName"
                          id="ruleName"
                          onChange={handleChange}
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter rule title"
                        />
                      </div>
                      <div>
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Value (Number)
                        </label>
                        <input
                          type="number"
                          name="value"
                          id="value"
                          onChange={handleChange}
                          step="any"
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter a numeric value (optional)"
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Rule Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={6}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Provide a detailed description of the rule and its application..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddRule}
                  disabled={loading || !newRule.ruleName || !newRule.description}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading || !newRule.ruleName || !newRule.description
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {loading ? "Adding..." : "Add Rule"}
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

      {/* Edit Rule Modal */}
      {openEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Edit Rule
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="edit-ruleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Rule Title
                        </label>
                        <input
                          type="text"
                          name="ruleName"
                          id="edit-ruleName"
                          onChange={handleChange}
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter rule title"
                          defaultValue={selectedRule?.ruleName}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Value (Number)
                        </label>
                        <input
                          type="number"
                          name="value"
                          id="edit-value"
                          onChange={handleChange}
                          step="any"
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter a numeric value (optional)"
                          defaultValue={selectedRule?.value}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Rule Description
                        </label>
                        <textarea
                          id="edit-description"
                          name="description"
                          rows={6}
                          onChange={handleChange}
                          className="mt-1 block w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Provide a detailed description of the rule and its application..."
                          defaultValue={selectedRule?.description}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditRule}
                  disabled={loading || !newRule.ruleName || !newRule.description}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading || !newRule.ruleName || !newRule.description
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Updating..." : "Update Rule"}
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Delete Rule
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-red-500 dark:text-red-400 font-medium mb-2">
                        This action cannot be undone.
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete the rule "{selectedRule?.ruleName}"?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteRule}
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

export default RulesHF;