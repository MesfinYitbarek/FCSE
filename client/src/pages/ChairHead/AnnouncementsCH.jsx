import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, ChevronRight} from "lucide-react";
import api from "../../utils/api";

const AnnouncementsCH = () => {
  const { user } = useSelector((state) => state.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [chairs, setChairs] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    validUntil: "",
    publishedBy: user?.role || "Unknown",
    targetAudience: {
      roles: [],
      chairs: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [readStats, setReadStats] = useState(null);

  const roleOptions = ["ChairHead", "HeadOfFaculty", "Instructor", "COC"];

  useEffect(() => {
    fetchAnnouncements();
    fetchChairs();
  }, []);

  const fetchChairs = async () => {
    try {
      // Replace with your actual API endpoint to fetch chairs
      const { data } = await api.get("/chairs");
      setChairs(data);
    } catch (error) {
      console.error("Error fetching chairs:", error);
      // Fallback with some example chairs if API fails
      setChairs(["Computer Science", "Information Technology", "Software Engineering"]);
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/announcements/publisher");
      const filtered = data.filter((announcement) => announcement.publishedBy === user?.role);
      setAnnouncements(filtered);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
    setLoading(false);
  };



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => {
      const updatedRoles = checked 
        ? [...prev.targetAudience.roles, value]
        : prev.targetAudience.roles.filter(role => role !== value);
      
      return {
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          roles: updatedRoles
        }
      };
    });
  };

  const handleChairChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => {
      const updatedChairs = checked 
        ? [...prev.targetAudience.chairs, value]
        : prev.targetAudience.chairs.filter(chair => chair !== value);
      
      return {
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          chairs: updatedChairs
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (form.targetAudience.roles.length === 0 && form.targetAudience.chairs.length === 0) {
      alert("Please select at least one role or chair for the target audience");
      setLoading(false);
      return;
    }
    
    try {
      const payload = { ...form, publishedBy: user?.role || "Unknown" };
      if (selectedAnnouncement) {
        await api.put(`/announcements/${selectedAnnouncement._id}`, payload);
      } else {
        await api.post("/announcements", payload);
      }
      fetchAnnouncements();
      resetForm();
      setSelectedAnnouncement(null);
      setOpenAddModal(false);
      setOpenEditModal(false);
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      title: "",
      message: "",
      validUntil: "",
      publishedBy: user?.role || "Unknown",
      targetAudience: {
        roles: [],
        chairs: []
      }
    });
  };

  const handleEdit = (announcement) => {
    const formattedDate = announcement.validUntil ? new Date(announcement.validUntil).toISOString().split('T')[0] : '';
    
    setForm({
      title: announcement.title,
      message: announcement.message,
      validUntil: formattedDate,
      targetAudience: announcement.targetAudience || { roles: [], chairs: [] }
    });
    
    setSelectedAnnouncement(announcement);
    setOpenEditModal(true);
  };

  const handleDeleteAnnouncement = async () => {
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

  // Format the target audience display
  const formatTargetAudience = (announcement) => {
    const roles = announcement.targetAudience?.roles || [];
    const chairs = announcement.targetAudience?.chairs || [];
    
    let audience = [];
    if (roles && roles.length > 0) {
      audience.push(`Roles: ${roles.join(', ')}`);
    }
    if (chairs && chairs.length > 0) {
      audience.push(`Chairs: ${chairs.join(', ')}`);
    }
    
    return audience.join(' | ') || 'None specified';
  };

  const MobileAnnouncementCard = ({ announcement }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-lg shadow-sm p-4 mb-4"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
        <div className="flex space-x-2">          
          <button
            onClick={() => handleEdit(announcement)}
            className="p-1.5 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="Edit announcement"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedAnnouncement(announcement);
              setOpenDeleteModal(true);
            }}
            className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete announcement"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{announcement.message}</p>
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Published By:</span>
          <span className="font-medium">{announcement.publishedBy}</span>
        </div>
        <div className="flex justify-between">
          <span>Target Audience:</span>
          <span className="font-medium truncate max-w-[60%] text-right">
            {formatTargetAudience(announcement)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Valid Until:</span>
          <span className="font-medium">
            {new Date(announcement.validUntil).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Read Count:</span>
          <span className="font-medium">
            {announcement.readBy?.length || 0} users
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Announcements</h1>
          <button
            onClick={() => {
              resetForm();
              setOpenAddModal(true);
            }}
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
                  {["Title", "Message", "Target Audience", "Valid Until", "Read Count", "Actions"].map((header) => (
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
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {formatTargetAudience(announcement)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(announcement.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {announcement.readBy?.length || 0} users
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">                  
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="Edit announcement"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAnnouncement(announcement);
                            setOpenDeleteModal(true);
                          }}
                          className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                          title="Delete announcement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

        {/* Add/Edit Announcement Modal */}
        {[
          { isOpen: openAddModal, setIsOpen: setOpenAddModal, title: "Create New Announcement", isEdit: false },
          { isOpen: openEditModal, setIsOpen: setOpenEditModal, title: "Edit Announcement", isEdit: true },
        ].map((modal) => (
          <Dialog key={modal.title} open={modal.isOpen} onClose={() => modal.setIsOpen(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-xl rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">{modal.title}</Dialog.Title>
                  <button
                    onClick={() => modal.setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
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
                  
                  {/* Target Audience Section */}
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Target Audience</h3>
                    
                    {/* Roles Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                      <div className="space-y-2">
                        {roleOptions.map(role => (
                          <div key={role} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`role-${role}-${modal.isEdit ? 'edit' : 'add'}`}
                              value={role}
                              checked={form.targetAudience.roles.includes(role)}
                              onChange={handleRoleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`role-${role}-${modal.isEdit ? 'edit' : 'add'}`} className="ml-2 text-sm text-gray-700">
                              {role}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Chairs Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chairs</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                        {chairs.map(chair => (
                          <div key={chair._id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`chair-${chair._id}-${modal.isEdit ? 'edit' : 'add'}`}
                              value={chair.name}
                              checked={form.targetAudience.chairs.includes(chair.name)}
                              onChange={handleChairChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`chair-${chair._id}-${modal.isEdit ? 'edit' : 'add'}`} className="ml-2 text-sm text-gray-700">
                              {chair.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => modal.setIsOpen(false)}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : modal.isEdit ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </Dialog>
        ))}

        {/* Delete Confirmation Modal */}
        <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">Delete Announcement</Dialog.Title>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete "{selectedAnnouncement?.title}"? This action cannot be undone.
              </p>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setOpenDeleteModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAnnouncement}
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

export default AnnouncementsCH;