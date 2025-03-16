import { FaFilter, FaSearch } from "react-icons/fa";

const UserFilters = ({ filters, handleFilterChange }) => {
  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaFilter /> Filters
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">All Roles</option>
          <option value="Instructor">Instructor</option>
          <option value="ChairHead">Chair Head</option>
          <option value="COC">COC</option>
          <option value="HeadOfFaculty">Head of Faculty</option>
        </select>
        <select
          name="chair"
          value={filters.chair}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">All Chairs</option>
          <option value="Chair1">Chair 1</option>
          <option value="Chair2">Chair 2</option>
        </select>
        <div className="relative">
          <input
            type="text"
            name="search"
            placeholder="Search by name or email"
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-lg pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default UserFilters;