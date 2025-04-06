// src/components/Reports/ReportsDashboard.jsx
import  { useState, useEffect } from 'react';
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
    navigate(user.role == "HeadOfFaculty"? `/reports/${reportId}`: `/reportsCH/${reportId}`);
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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Academic Reports Dashboard</h1>
        
        <ReportsFilter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Reports</h2>
          
          <div className="flex space-x-3">
            {filteredReports.length > 0 && (
              <CSVLink 
                data={getCsvData()} 
                filename={`academic-reports-${new Date().toISOString().split('T')[0]}.csv`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <ReportsList reports={filteredReports} onViewReport={handleViewReport} />
        )}
      </div>
    </div>
  );
};

export default ReportsHF;