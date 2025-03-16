import React from 'react';
import { BarChart, FileText, Bookmark } from 'lucide-react';

const ReportStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Reports Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-500 font-medium">Total Reports</p>
            <h3 className="text-3xl font-bold text-blue-800">{stats.totalReports}</h3>
          </div>
        </div>
      </div>

      {/* Reports by Year Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-green-100 mr-3">
            <BarChart className="h-5 w-5 text-green-600" />
          </div>
          <h5 className="text-lg font-semibold text-gray-800">By Year</h5>
        </div>
        
        {Object.entries(stats.byYear).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(stats.byYear)
              .sort(([yearA], [yearB]) => yearB - yearA)
              .slice(0, 5) // Show only top 5 years
              .map(([year, count]) => (
                <div key={year} className="flex items-center">
                  <div className="w-12 text-gray-600 font-medium">{year}</div>
                  <div className="flex-grow mx-2">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-green-100">
                      <div 
                        style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.byYear))) * 100)}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 italic">No data available</p>
          </div>
        )}
      </div>

      {/* Reports by Program Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-purple-100 mr-3">
            <Bookmark className="h-5 w-5 text-purple-600" />
          </div>
          <h5 className="text-lg font-semibold text-gray-800">By Program</h5>
        </div>
        
        {Object.entries(stats.byProgram).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(stats.byProgram).map(([program, count]) => (
              <div key={program} className="flex items-center">
                <div className="w-24 truncate text-gray-600 font-medium">{program}</div>
                <div className="flex-grow mx-2">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                    <div 
                      style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.byProgram))) * 100)}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                    ></div>
                  </div>
                </div>
                <div className="w-8 text-right">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 italic">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportStats;