import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import api from "../../utils/api";

const AnnouncementsInst = () => {
  const { user } = useSelector((state) => state.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Fetch all active announcements - filtering is now done on the server
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/announcements");
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
    setLoading(false);
  };

  // Mark an announcement as read
  const markAsRead = async (announcementId) => {
    try {
      await api.post(`/announcements/${announcementId}/read`);
      // Update the local state to show it's been read
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement._id === announcementId 
            ? { ...announcement, isRead: true }
            : announcement
        )
      );
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  };

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Announcements</h1>

      {/* Announcements List */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Latest Announcements</h2>
        {loading ? (
          <div className="py-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-4 text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No active announcements.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <motion.div 
                key={announcement._id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`border ${announcement.isRead ? 'border-gray-200' : 'border-blue-200'} rounded-lg p-4`}
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  {announcement.isRead ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span className="text-sm">Read</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => markAsRead(announcement._id)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm flex items-center"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Mark as read
                    </button>
                  )}
                </div>
                <p className="mt-2 text-gray-700">{announcement.message}</p>
                <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-4">
                  <div className="w-full">
                    <span className="font-medium">For:</span> {formatTargetAudience(announcement)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsInst;