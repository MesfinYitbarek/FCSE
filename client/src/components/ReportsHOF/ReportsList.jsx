import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Eye,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Briefcase,
  FileText
} from 'lucide-react';

const ReportsList = ({ reports, onViewReport }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'descending'
  });

  if (reports.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg"
      >
        <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No reports found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Try adjusting your filters or check back later as new reports are added to the system.
        </p>
      </motion.div>
    );
  }

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (a[sortConfig.key] === null) return 1;
    if (b[sortConfig.key] === null) return -1;
    if (a[sortConfig.key] === b[sortConfig.key]) return 0;
    
    if (sortConfig.key === 'createdAt') {
      return sortConfig.direction === 'ascending'
        ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
        : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
    }
    
    return sortConfig.direction === 'ascending'
      ? a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
      : a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) {
      return null;
    }
    
    return sortConfig.direction === 'ascending' ? (
      <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
    );
  };

  // Mobile card variant - we'll show this on small screens
  const renderMobileCard = (report, idx) => (
    <motion.div
      key={report._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
      className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-4 last:mb-0"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{report.year} - {report.semester || 'N/A'}</h3>
          {report.program && (
            <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              report.program === 'Regular' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 
              report.program === 'Common' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' :
              report.program === 'Extension' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300' :
              'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'
            }`}>
              {report.program}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Calendar size={12} className="mr-1" />
          {format(new Date(report.createdAt), 'MMM d, yyyy')}
        </div>
      </div>
      
      <div className="flex items-center mb-3 text-sm text-gray-500 dark:text-gray-400">
        <User size={14} className="mr-2" />
        <span>{report.generatedBy || 'N/A'}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Briefcase size={14} className="mr-1 text-gray-400 dark:text-gray-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {report.assignments?.length || 0} assignments
          </span>
        </div>
        
        <button
          onClick={() => onViewReport(report._id)}
          className="inline-flex items-center px-3 py-1.5 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:text-white dark:hover:text-white rounded-md text-sm transition-colors"
        >
          <Eye size={14} className="mr-1" />
          View
        </button>
      </div>
    </motion.div>
  );

  return (
    <div>
      {/* Mobile view */}
      <div className="sm:hidden space-y-4">
        {sortedReports.map((report, idx) => renderMobileCard(report, idx))}
      </div>
      
      {/* Desktop view */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">
                    <button
                      onClick={() => requestSort('year')}
                      className="group inline-flex items-center font-semibold hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Year
                      <span className="ml-2 flex-none rounded">{getSortIcon('year')}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                    <button
                      onClick={() => requestSort('semester')}
                      className="group inline-flex items-center font-semibold hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Semester
                      <span className="ml-2 flex-none rounded">{getSortIcon('semester')}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                    <button
                      onClick={() => requestSort('program')}
                      className="group inline-flex items-center font-semibold hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Program
                      <span className="ml-2 flex-none rounded">{getSortIcon('program')}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Created By</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                    <button
                      onClick={() => requestSort('createdAt')}
                      className="group inline-flex items-center font-semibold hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Date Created
                      <span className="ml-2 flex-none rounded">{getSortIcon('createdAt')}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Assignments</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedReports.map((report, idx) => (
                  <motion.tr 
                    key={report._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-150`}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{report.year}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{report.semester || 'N/A'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {report.program ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.program === 'Regular' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 
                          report.program === 'Common' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' :
                          report.program === 'Extension' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300' :
                          'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'
                        }`}>
                          {report.program}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium text-sm">
                          {report.generatedBy?.charAt(0) || '?'}
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 dark:text-gray-200 whitespace-nowrap">{report.generatedBy || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(report.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                        {report.assignments?.length || 0}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => onViewReport(report._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-700 hover:text-white dark:hover:text-white rounded-md text-sm transition-colors"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsList;