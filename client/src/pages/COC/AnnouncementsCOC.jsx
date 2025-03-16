import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, AlertCircle } from "lucide-react";
import api from "../../utils/api";

const AnnouncementsCOC = () => {
  const { user } = useSelector((state) => state.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", validUntil: "",
    viewedBy: "COC", // Default value
    publishedBy: user?.role || "Unknown"
   });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Role options for viewedBy field
  const roleOptions = ["COC", "ChairHead", "HeadOfFaculty", "Instructor"];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/announcements/publisher");
      setAnnouncements(data);
    } catch (error) {
      setError("Failed to fetch announcements");
      console.error("Error fetching announcements:", error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.message || !form.validUntil || !form.viewedBy) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {

      const payload = {
        ...form,
        publishedBy: user?.role || "Unknown",
      };

      await api.post("/announcements", payload);
      fetchAnnouncements();
      setForm({ title: "",
        message: "",
        validUntil: "",
        viewedBy: "COC",
        publishedBy: user?.role || "Unknown"});
      setOpenAddModal(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error creating announcement");
      console.error("Error creating announcement:", error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/announcements/${selectedAnnouncement._id}`);
      fetchAnnouncements();
      setOpenDeleteModal(false);
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
    setLoading(false);
  };

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MobileAnnouncementCard = ({ announcement }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-lg shadow-sm p-4 mb-4"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
        <button
          onClick={() => {
            setSelectedAnnouncement(announcement);
            setOpenDeleteModal(true);
          }}
          className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{announcement.message}</p>
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Published By:</span>
          <span className="font-medium">{announcement.publishedBy}</span>
        </div>
        <div className="flex justify-between">
          <span>Valid Until:</span>
          <span className="font-medium">
            {new Date(announcement.validUntil).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">COC Announcements</h1>
          <button
            onClick={() => setOpenAddModal(true)}
            className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Announcement
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Title", "Message", "Published By", "Valid Until", "Actions"].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAnnouncements.map((announcement) => (
                  <motion.tr
                    key={announcement._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{announcement.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{announcement.message}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{announcement.publishedBy}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(announcement.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setOpenDeleteModal(true);
                        }}
                        className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredAnnouncements.map((announcement) => (
            <MobileAnnouncementCard key={announcement._id} announcement={announcement} />
          ))}
        </div>

        {/* Add Announcement Modal */}
        <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-xl rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Create New Announcement
              </Dialog.Title>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={form.validUntil}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenAddModal(false)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Announcement"}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 text-center">
                Delete Announcement
              </Dialog.Title>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Are you sure you want to delete this announcement? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setOpenDeleteModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default AnnouncementsCOC;