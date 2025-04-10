import { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Calendar, User, Trash2, AlertTriangle, X } from 'lucide-react';
import api from '../../utils/api';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const PreferenceCH = () => {
  const { user } = useSelector((state) => state.auth);
  const currentYear = new Date().getFullYear();
  
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: currentYear,
    semester: 'Regular 1',
    chair: user?.chair || '' 
  });
  
  // Delete functionality states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [preferenceToDelete, setPreferenceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Responsive width state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update chair filter when user data changes
  useEffect(() => {
    if (user?.chair) {
      setFilters(prev => ({
        ...prev,
        chair: user.chair
      }));
    }
  }, [user]);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/preferences/search-preferences?${queryParams}`);
      
      setPreferences(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPreferences();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const openDeleteModal = (preference) => {
    setPreferenceToDelete(preference);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPreferenceToDelete(null);
  };
  
  const handleDeletePreference = async () => {
    if (!preferenceToDelete?._id) return;
    
    try {
      setDeleteLoading(true);
      await api.delete(`/preferences/${preferenceToDelete._id}`);
      
      // Remove the deleted preference from state
      setPreferences(prev => {
        return {
          ...prev,
          preferences: prev.preferences.filter(p => p._id !== preferenceToDelete._id)
        };
      });
      
      toast.success('Preference deleted successfully');
      closeDeleteModal();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete preference');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
      {/* Page header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Teaching Preferences</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View instructor course preferences by semester</p>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-slate-800/50 p-6 border-b border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Academic Year</span>
              </label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleInputChange}
                className="w-full text-base px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                min={currentYear - 5}
                max={currentYear + 5}
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Semester</span>
              </label>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleInputChange}
                className="w-full text-base px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
              >
                <option value="Regular 1">Regular 1</option>
                <option value="Regular 2">Regular 2</option>
                <option value="Summer">Summer</option>
                <option value="Extension">Extension</option>
              </select>
            </div>
          </div>
          
          <div className="flex-none">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-indigo-500" />
                <span>Department Chair</span>
              </label>
              <div className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                {user?.chair || 'Loading chair information...'}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 sm:px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-700/50 transition-colors shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Searching...' : 'Search Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-6 mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800 flex flex-col sm:flex-row items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-500" />
        </div>
      )}

      {/* Results */}
      {preferences && preferences.preferences && preferences.preferences.length > 0 ? (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Preferences for {filters.semester} {filters.year}
            </h2>
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">
              {preferences.preferences.length} instructor{preferences.preferences.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Desktop table view */}
          <div className="hidden md:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-opacity-20 rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Preferences (Ranked)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {preferences.preferences.map((pref, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800/50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {pref.instructorId.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <ul className="space-y-2">
                          {pref.preferences
                            .sort((a, b) => a.rank - b.rank)
                            .map((p, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full mr-2">
                                  {idx + 1}
                                </span>
                                <span>{p.courseId.code} - {p.courseId.name}</span>
                              </li>
                            ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(pref.submittedAt).toLocaleDateString(undefined, {
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => openDeleteModal(pref)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 focus:outline-none"
                          title="Delete preference"
                          aria-label="Delete preference"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Mobile card view */}
          <div className="md:hidden space-y-4">
            {preferences.preferences.map((pref, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
                <div className="mb-3 pb-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{pref.instructorId.fullName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Submitted: {new Date(pref.submittedAt).toLocaleDateString(undefined, {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <button 
                    onClick={() => openDeleteModal(pref)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 focus:outline-none p-1"
                    title="Delete preference"
                    aria-label="Delete preference"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Preferences (Ranked)</h4>
                  <ul className="space-y-2">
                    {pref.preferences
                      .sort((a, b) => a.rank - b.rank)
                      .map((p, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium rounded-full mr-2">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{p.courseId.code} - {p.courseId.name}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : preferences && !loading && (
        <div className="p-6">
          <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No preferences found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No instructors have submitted preferences for {filters.semester} {filters.year}.
            </p>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
            </div>
            
            <div className="p-5">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete the preference submission from{' '}
                <span className="font-semibold">
                  {preferenceToDelete?.instructorId?.fullName}
                </span>?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                This action cannot be undone and will permanently remove the preference submission.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePreference}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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

export default PreferenceCH;