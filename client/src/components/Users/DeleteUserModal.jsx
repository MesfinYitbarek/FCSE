import Modal from "react-modal";
Modal.setAppElement("#root");
const DeleteUserModal = ({ isOpen, onRequestClose, handleDelete, loading }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="modal bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-lg font-semibold mb-4">Delete User</h2>
        <p className="mb-4">Are you sure you want to delete this user?</p>
        <div className="flex gap-4">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onRequestClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </Modal>
    );
  };
  
  export default DeleteUserModal;