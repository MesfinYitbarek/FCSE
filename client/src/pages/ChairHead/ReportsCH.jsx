import { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { FiCalendar, FiDownload, FiFilter, FiList, FiEye, FiPrinter, FiShare2 } from "react-icons/fi";
import { saveAs } from "file-saver";

const ReportsCH = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    reportType: "",
    dateRange: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  // Available years and report types for filtering
  const [availableYears, setAvailableYears] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  // Extract unique years and report types for filters
  useEffect(() => {
    if (reports.length) {
      const years = [...new Set(reports.map(r => r.year.toString()))];
      const types = [...new Set(reports.map(r => r.reportType))];
      
      setAvailableYears(years);
      setAvailableTypes(types);
    }
  }, [reports]);

  // Fetch reports related to the Chair Head's department
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/chair/${user.chair}`);
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Toggle sort order
  const toggleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      year: new Date().getFullYear().toString(),
      reportType: "",
      dateRange: "all",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    setSearch("");
  };

  // Calculate date range for filter
  const getDateRange = () => {
    const now = new Date();
    switch (filters.dateRange) {
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return monthAgo;
      case "quarter":
        const quarterAgo = new Date();
        quarterAgo.setMonth(now.getMonth() - 3);
        return quarterAgo;
      default:
        return new Date(0); // Beginning of time
    }
  };

  // Filtered and sorted reports
  const filteredReports = useMemo(() => {
    const dateRange = getDateRange();
    
    return reports
      .filter(report => {
        // Filter by search term
        if (search && !report.reportType.toLowerCase().includes(search.toLowerCase()) &&
            !report.generatedBy.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        
        // Filter by year
        if (filters.year && report.year.toString() !== filters.year) return false;
        
        // Filter by report type
        if (filters.reportType && report.reportType !== filters.reportType) return false;
        
        // Filter by date range
        if (filters.dateRange !== "all" && new Date(report.createdAt) < dateRange) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Handle different sort fields
        if (filters.sortBy === "createdAt") {
          return filters.sortOrder === "asc" 
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        } else {
          const aValue = a[filters.sortBy];
          const bValue = b[filters.sortBy];
          
          if (typeof aValue === 'string') {
            return filters.sortOrder === "asc" 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          } else {
            return filters.sortOrder === "asc" 
              ? aValue - bValue 
              : bValue - aValue;
          }
        }
      });
  }, [reports, filters, search]);

  // View report details
  const viewReport = (report) => {
    setSelectedReport(report);
  };

  // Close report modal
  const closeReportModal = () => {
    setSelectedReport(null);
  };

  // Export report as CSV
  const exportReport = (report) => {
    // Convert report data to CSV format
    const csvRows = [];
    
    // Add headers based on first item keys
    if (report.data && report.data.length > 0) {
      csvRows.push(Object.keys(report.data[0]).join(','));
      
      // Add data rows
      report.data.forEach(item => {
        const values = Object.values(item).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        );
        csvRows.push(values.join(','));
      });
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${report.reportType.replace(/\s+/g, '_')}_${report.year}.csv`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Department Reports Dashboard
        </h1>
        
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <FiFilter className="text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filter Reports</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                name="reportType"
                value={filters.reportType}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">All Report Types</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by type or author..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <p className="text-sm text-gray-600">
              {filteredReports.length} of {reports.length} reports
            </p>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <FiList className="text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Generated Reports</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reports found matching your filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort("year")}
                    >
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" /> Year
                        {filters.sortBy === "year" && (
                          <span className="ml-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort("reportType")}
                    >
                      <div className="flex items-center">
                        Report Type
                        {filters.sortBy === "reportType" && (
                          <span className="ml-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort("generatedBy")}
                    >
                      <div className="flex items-center">
                        Generated By
                        {filters.sortBy === "generatedBy" && (
                          <span className="ml-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Created At
                        {filters.sortBy === "createdAt" && (
                          <span className="ml-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">{report.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.reportType.includes("Course") ? "bg-blue-100 text-blue-800" :
                          report.reportType.includes("Workload") ? "bg-green-100 text-green-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {report.reportType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{report.generatedBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewReport(report)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="View Report"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => exportReport(report)}
                          className="text-green-600 hover:text-green-900"
                          title="Export as CSV"
                        >
                          <FiDownload />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedReport.reportType} ({selectedReport.year})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => exportReport(selectedReport)}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded"
                  title="Export as CSV"
                >
                  <FiDownload />
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded"
                  title="Print Report"
                >
                  <FiPrinter />
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedReport.data))}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded"
                  title="Copy Data"
                >
                  <FiShare2 />
                </button>
                <button
                  onClick={closeReportModal}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Generated by {selectedReport.generatedBy} on {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
              </div>
              
              {selectedReport.data && selectedReport.data.length > 0 ? (
                <div className="overflow-x-auto bg-gray-50 rounded-lg p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {Object.keys(selectedReport.data[0]).map((key) => (
                          <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedReport.data.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {Object.entries(item).map(([key, value]) => (
                            <td key={key} className="px-4 py-3 whitespace-nowrap text-sm">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No data available in this report
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsCH;