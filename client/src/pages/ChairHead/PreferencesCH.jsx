import { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Calendar, User } from 'lucide-react';
import api from '../../utils/api';
import { useSelector } from 'react-redux';

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

  // Update chair filter when user data changes
  useEffect(() => {
    if (user?.chair) {
      setFilters(prev => ({
        ...prev,
        chair: user.chair
      }));
    }
  }, [user]);

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

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Teaching Preferences</h1>
        <p className="text-gray-500">View instructor course preferences by semester</p>
      </div>
      
      <div className="bg-gray-50 p-4 sm:p-5 rounded-xl mb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Academic Year</span>
                </div>
              </label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                min={currentYear - 5}
                max={currentYear + 5}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Semester</span>
                </div>
              </label>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
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
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Department Chair</span>
                </div>
              </label>
              <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700">
                {user?.chair || 'Loading chair information...'}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-sm"
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

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 flex flex-col sm:flex-row items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          <div>
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {preferences && preferences.preferences && preferences.preferences.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Preferences for {filters.semester} {filters.year}
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
              {preferences.preferences.length} instructor{preferences.preferences.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Desktop table view */}
          <div className="hidden md:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preferences (Ranked)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preferences.preferences.map((pref, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pref.instructorId.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <ul className="space-y-2">
                          {pref.preferences
                            .sort((a, b) => a.rank - b.rank)
                            .map((p, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-2">
                                  {idx + 1}
                                </span>
                                <span>{p.courseId.code} - {p.courseId.name}</span>
                              </li>
                            ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pref.submittedAt).toLocaleDateString(undefined, {
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
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
              <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="mb-3 pb-2 border-b border-gray-100">
                  <div className="font-medium text-gray-900">{pref.instructorId.fullName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Submitted: {new Date(pref.submittedAt).toLocaleDateString(undefined, {
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Preferences (Ranked)</h4>
                  <ul className="space-y-2">
                    {pref.preferences
                      .sort((a, b) => a.rank - b.rank)
                      .map((p, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-2">
                            {idx + 1}
                          </span>
                          <span className="text-sm">{p.courseId.code} - {p.courseId.name}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : preferences && !loading && (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No preferences found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No instructors have submitted preferences for {filters.semester} {filters.year}.
          </p>
        </div>
      )}
    </div>
  );
};

export default PreferenceCH;