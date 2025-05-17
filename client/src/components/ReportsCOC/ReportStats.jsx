import { motion } from 'framer-motion';
import { BarChart, FileText, Bookmark } from 'lucide-react';

const ReportStats = ({ stats }) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Reports Card */}
      <motion.div 
        variants={cardVariants}
        className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600"
      >
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mr-4">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Reports</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalReports}</h3>
          </div>
        </div>
      </motion.div>

      {/* Reports by Year Card */}
      <motion.div 
        variants={cardVariants}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600"
      >
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 mr-3">
            <BarChart size={18} />
          </div>
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white">By Year</h5>
        </div>
        
        {Object.entries(stats.byYear).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(stats.byYear)
              .sort(([yearA], [yearB]) => yearB - yearA)
              .slice(0, 5) // Show only top 5 years
              .map(([year, count]) => (
                <div key={year} className="flex items-center">
                  <div className="w-12 text-gray-600 dark:text-gray-300 font-medium">{year}</div>
                  <div className="flex-grow mx-2">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100 dark:bg-green-900/30">
                      <div 
                        style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.byYear))) * 100)}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 dark:bg-green-600"
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-right">
                    <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 italic">No data available</p>
          </div>
        )}
      </motion.div>

      {/* Reports by Program Card */}
      <motion.div 
        variants={cardVariants}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600"
      >
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mr-3">
            <Bookmark size={18} />
          </div>
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white">By Program</h5>
        </div>
        
        {Object.entries(stats.byProgram).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(stats.byProgram).map(([program, count]) => (
              <div key={program} className="flex items-center">
                <div className="w-24 truncate text-gray-600 dark:text-gray-300 font-medium">{program}</div>
                <div className="flex-grow mx-2">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100 dark:bg-purple-900/30">
                    <div 
                      style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.byProgram))) * 100)}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 dark:bg-purple-600"
                    ></div>
                  </div>
                </div>
                <div className="w-8 text-right">
                  <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 italic">No data available</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportStats;