// src/components/Navbar.jsx
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { FaBell, FaSearch } from "react-icons/fa";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to login
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex items-center justify-between shadow-md">
      {/* Left Section: Logo and Search */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">FCSE System</h1>
        {/* Search input visible on md and above */}
        <div className="relative hidden md:block">
          <FaSearch className="absolute top-2 left-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-1 rounded bg-gray-700 text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Right Section: Notifications, Welcome, and Logout */}
      <div className="flex items-center gap-4">
        <button className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
          <FaBell size={20} />
        </button>
        <span className="hidden md:inline">Welcome, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
