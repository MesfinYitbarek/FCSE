import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, BarChart2, Search } from 'lucide-react';
import ReportList from './ReportList';
import ReportStats from './ReportStats';
import api from '../../utils/api';

const ReportDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    byYear: {},
    byProgram: {}
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reports');
        setReports(response.data);
        
        // Calculate stats
        const totalReports = response.data.length;
        
        // Group by year
        const byYear = response.data.reduce((acc, report) => {
          acc[report.year] = (acc[report.year] || 0) + 1;
          return acc;
        }, {});
        
        // Group by program
        const byProgram = response.data.reduce((acc, report) => {
          const program = report.program || 'All Programs';
          acc[program] = (acc[program] || 0) + 1;
          return acc;
        }, {});
        
        setStats({ totalReports, byYear, byProgram });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => 
    searchTerm === '' || 
    (report.note && report.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (report.year && report.year.toString().includes(searchTerm)) ||
    (report.program && report.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (report.semester && report.semester.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container max-w-6xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Assignment Reports</h1>
            <p className="text-gray-600">
              View and manage assignment reports for all academic years, programs, and semesters
            </p>
          </div>
          <div>
            <Link to="/reports/create">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition shadow-sm">
                <PlusCircle className="mr-2" size={16} />
                Create New Report
              </button>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by year, program, semester or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="flex items-center mb-4">
              <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Report Statistics</h2>
            </div>
            <ReportStats stats={stats} />
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <ReportList 
              reports={filteredReports} 
              loading={loading} 
              error={error} 
              onDeleteSuccess={(id) => {
                setReports(reports.filter(report => report._id !== id));
                setStats({
                  ...stats,
                  totalReports: stats.totalReports - 1
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;