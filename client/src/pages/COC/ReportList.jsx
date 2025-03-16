import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Search, Eye, Edit, Trash2, Filter, Loader2 } from 'lucide-react';

const ReportList = ({ reports = [], loading, error, onDeleteSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Calculate available years and programs from reports
  const years = [...new Set(reports.map(report => report.year))].sort((a, b) => b - a);
  const programs = [...new Set(reports.map(report => report.program).filter(Boolean))];
  
  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      (report.note && report.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.year && report.year.toString().includes(searchTerm));
      
    const matchesYear = selectedYear === '' || report.year.toString() === selectedYear;
    const matchesProgram = selectedProgram === '' || report.program === selectedProgram;
    
    return matchesSearch && matchesYear && matchesProgram;
  });
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        setDeleteLoading(id);
        await api.delete(`/reports/${id}`);
        onDeleteSuccess(id);
      } catch (error) {
        alert('Failed to delete report: ' + (error.response?.data?.message || error.message));
      } finally {
        setDeleteLoading(null);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-md">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (reports.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p className="text-lg font-medium text-gray-600 mb-2">No reports found</p>
        <p className="text-gray-500 mb-6">Create your first report to get started</p>
        <Link to="/reports/create">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition shadow-sm">
            <PlusCircle className="mr-2" size={16} />
            Create New Report
          </button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex flex-col md:flex-row gap-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex-1"
          >
            <option value="">All Programs</option>
            {programs.map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500">No reports match your filters</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map(report => (
                <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.program ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.program}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        All Programs
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.semester ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {report.semester}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        All Semesters
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.generatedBy || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/reports/${report._id}`} className="text-blue-600 hover:text-blue-900">
                        <button className="p-1 rounded-full hover:bg-blue-50 transition">
                          <Eye size={18} />
                        </button>
                      </Link>
                      <Link to={`/reports/${report._id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        <button className="p-1 rounded-full hover:bg-indigo-50 transition">
                          <Edit size={18} />
                        </button>
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition relative"
                        onClick={() => handleDelete(report._id)}
                        disabled={deleteLoading === report._id}
                      >
                        {deleteLoading === report._id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ReportList;