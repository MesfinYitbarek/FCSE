import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Save } from 'lucide-react';

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    note: ''
  });
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reports/${id}`);
        setReportData(response.data);
        setFormData({
          note: response.data.note || ''
        });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching report');
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      await api.patch(`/reports/${id}`, formData);
      setSuccess(true);
      
      // Navigate back to report view after 1.5 seconds
      setTimeout(() => {
        navigate(`/reports/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-medium">Loading report data...</p>
        </div>
      </div>
    );
  }
  
  if (error && !reportData) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-md shadow">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <div className="mt-4">
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                onClick={() => navigate('/reports')}
              >
                <ArrowLeft className="mr-2" size={16} />
                Back to Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <Link to={`/reports/${id}`} className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2" size={16} />
          Back to Report Details
        </Link>
        
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-xl font-semibold text-gray-800">Edit Report</h4>
          </div>
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="text-red-500 mr-3" size={20} />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={20} />
                  <p className="text-green-700">Report updated successfully! Redirecting...</p>
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <h5 className="text-lg font-medium text-gray-700 mb-4">Report Information</h5>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Academic Year</p>
                    <p className="font-medium">{reportData?.year || ''}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Program</p>
                    {reportData?.program ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {reportData.program}
                      </span>
                    ) : (
                      <span className="text-gray-700">All Programs</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Semester</p>
                    {reportData?.semester ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {reportData.semester}
                      </span>
                    ) : (
                      <span className="text-gray-700">All Semesters</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Add any additional notes or context for this report"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use this field to add any relevant information about this report or its contents.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(`/reports/${id}`)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Save Changes
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

export default EditReport;