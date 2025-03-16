import { FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "./Pagination";

const UserTable = ({
  users,
  setSelectedUser,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
  currentPage,
  usersPerPage,
  filteredUsers,
  paginate,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Users List</h2>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wider">
              <th className="border-b p-3 text-left">Full Name</th>
              <th className="border-b p-3 text-left">Username</th>
              <th className="border-b p-3 text-left">Email</th>
              <th className="border-b p-3 text-left">Chair</th>
              <th className="border-b p-3 text-left">Role</th>
              <th className="border-b p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u._id} className="border-b text-gray-700 hover:bg-gray-50 transition">
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.chair}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 transition p-2"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 transition p-2"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 p-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        usersPerPage={usersPerPage}
        totalUsers={filteredUsers.length}
        paginate={paginate}
      />
    </div>
  );
};

export default UserTable;
