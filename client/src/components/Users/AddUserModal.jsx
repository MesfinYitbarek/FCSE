import Modal from "react-modal";
Modal.setAppElement("#root");
const AddUserModal = ({ isOpen, onRequestClose, newUser, handleChange, handleAddUser, loading }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="modal bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-lg font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
        <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={newUser.fullName}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={newUser.username}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newUser.email}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={newUser.password}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={newUser.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            name="chair"
            placeholder="Chair"
            value={newUser.chair}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={newUser.position}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={newUser.location}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            name="role"
            value={newUser.role}
            onChange={handleChange}
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
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </Modal>
    );
  };
  
  export default AddUserModal;