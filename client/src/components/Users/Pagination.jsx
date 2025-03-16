import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Pagination = ({ currentPage, usersPerPage, totalUsers, paginate }) => {
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
          currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        <FaArrowLeft /> Previous
      </button>

      <span className="text-gray-700 font-semibold">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
          currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Next <FaArrowRight />
      </button>
    </div>
  );
};

export default Pagination;
