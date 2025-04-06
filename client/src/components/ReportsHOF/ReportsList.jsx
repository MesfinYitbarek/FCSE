
import { format } from 'date-fns';

const ReportsList = ({ reports, onViewReport }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or creating a new report.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Year</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Semester</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Program</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created By</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date Created</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Assignments</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{report.year}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{report.semester || 'N/A'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{report.program || 'N/A'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{report.generatedBy?.name || 'N/A'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {format(new Date(report.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {report.assignments?.length || 0}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => onViewReport(report._id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View<span className="sr-only">, {report._id}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsList;