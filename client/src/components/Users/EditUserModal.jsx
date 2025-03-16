import Modal from "react-modal";
Modal.setAppElement("#root");
const EditUserModal = ({ isOpen, onRequestClose, selectedUser, setSelectedUser, handleEditUser, loading }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="modal bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-lg font-semibold mb-4">Edit User</h2>
        {selectedUser && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={selectedUser.fullName}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, fullName: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={selectedUser.username}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, username: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, email: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={selectedUser.phone}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, phone: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="chair"
              placeholder="Chair"
              value={selectedUser.chair}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, chair: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="position"
              placeholder="Position"
              value={selectedUser.position}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, position: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={selectedUser.location}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, location: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <select
              name="role"
              value={selectedUser.role}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, role: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            >
              <option value="Instructor">Instructor</option>
              <option value="ChairHead">Chair Head</option>
              <option value="COC">COC</option>
              <option value="HeadOfFaculty">Head of Faculty</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update User"}
            </button>
          </form>
        )}
      </Modal>
    );
  };
  
  export default EditUserModal;