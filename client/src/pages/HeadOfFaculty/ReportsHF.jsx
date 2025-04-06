import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { toast } from 'react-hot-toast';
import ReportsFilter from '@/components/ReportsHOF/ReportsFilter';
import ReportsList from '@/components/ReportsHOF/ReportsList';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const ReportsHF = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    semester: '',
    program: '',
  });
  const [stats, setStats] = useState({
    totalReports: 0,
    totalAssignments: 0,
    programs: 0,
  });
  
  const navigate = useNavigate();

  // Fetch reports data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.semester) queryParams.append('semester', filters.semester);
        if (filters.program) queryParams.append('program', filters.program);
        
        const response = await api.get(`/reports?${queryParams.toString()}`);
        setReports(response.data);
        setFilteredReports(response.data);
        
        // Calculate stats
        if (response.data.length > 0) {
          const totalAssignments = response.data.reduce(
            (sum, report) => sum + (report.assignments?.length || 0), 0
          );
          const uniquePrograms = new Set(response.data.map(report => report.program).filter(Boolean)).size;
          
          setStats({
            totalReports: response.data.length,
            totalAssignments,
            programs: uniquePrograms
          });
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch reports. Please try again later.');
        toast.error('Error fetching reports');
        console.error('Error fetching reports:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle view report detail
  const handleViewReport = (reportId) => {
    navigate(user.role === "HeadOfFaculty" ? `/reports/${reportId}` : `/reportsCH/${reportId}`);
  };

  // Prepare CSV data
  const getCsvData = () => {
    return filteredReports.map(report => {
      return {
        'Report ID': report._id,
        'Year': report.year,
        'Semester': report.semester,
        'Program': report.program,
        'Created By': report.generatedBy?.name || 'N/A',
        'Date Created': new Date(report.createdAt).toLocaleDateString(),
        'Assignments Count': report.assignments?.length || 0,
        'Note': report.note || 'N/A'
      };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Academic Reports Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Programs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.programs}</p>
              </div>
            </div>
          </div>
        </div>
        
        <ReportsFilter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Reports {filteredReports.length > 0 && `(${filteredReports.length})`}
          </h2>
          
          <div className="flex space-x-3">
            {filteredReports.length > 0 && (
              <CSVLink 
                data={getCsvData()} 
                filename={`academic-reports-${new Date().toISOString().split('T')[0]}.csv`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </CSVLink>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
            <p className="text-gray-500 text-sm">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium mb-1">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <ReportsList reports={filteredReports} onViewReport={handleViewReport} />
        )}
      </div>
    </div>
  );
};

export default ReportsHF;