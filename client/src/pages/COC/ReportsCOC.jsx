import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from "../../utils/api";
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';

const CreateReport = () => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    semester: '',
    program: '',
    note: ''
  });
  
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        setLoading(true);
        const response = await api.get('/assignments');
        const years = [...new Set(response.data.map(a => a.year))].sort((a, b) => b - a);
        setAvailableYears(years);
        if (years.length > 0) {
          setFormData(prev => ({ ...prev, year: years[0] }));
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch available academic years');
        setLoading(false);
      }
    };
    fetchAvailableYears();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await api.post('/reports', formData);
      navigate(`/reports/${response.data.reportId}`, { 
        state: { message: 'Report created successfully!' } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-medium">Loading available academic years...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <Link to="/reports" className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2" size={16} />
          Back to Reports
        </Link>
        
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-800">Create Assignment Report</h4>
            <p className="text-gray-500 mt-1">
              Generate a new report for assignment workloads
            </p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableYears.length === 0 ? (
                      <option value="">No academic years available</option>
                    ) : (
                      availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))
                    )}
                  </select>
                  {availableYears.length === 0 && (
                    <p className="mt-1 text-sm text-red-500">
                      No academic years found. Please create assignments first.
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                    Program (Optional)
                  </label>
                  <select
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Programs</option>
                    <option value="Regular">Regular</option>
                    <option value="Common">Common</option>
                    <option value="Extension">Extension</option>
                    <option value="Summer">Summer</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to include all programs in the report
                  </p>
                </div>
                
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                    Semester (Optional)
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Semesters</option>
                    <option value="Regular 1">Regular 1</option>
                    <option value="Regular 2">Regular 2</option>
                    <option value="Summer">Summer</option>
                    <option value="Extension 1">Extension 1</option>
                    <option value="Extension 2">Extension 2</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to include all semesters in the report
                  </p>
                </div>
                
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add any additional notes or context for this report"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/reports')}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || availableYears.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Create Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReport;