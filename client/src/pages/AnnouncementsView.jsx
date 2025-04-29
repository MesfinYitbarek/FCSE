import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Loader2, Check, Eye } from "lucide-react";
import api from "../utils/api";

const AnnouncementsView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // The server will now filter for valid announcements and include read status
      const { data } = await api.get("/announcements");
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
    setLoading(false);
  };

  // Mark an announcement as read
  const markAsRead = async (announcementId) => {
    if (markingRead) return;

    setMarkingRead(true);
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
    setMarkingRead(false);
  };
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Megaphone className="text-indigo-600 dark:text-indigo-400" size={28} />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Announcements</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Megaphone className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No announcements available.</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence>
            {announcements.map((announcement) => (
              <motion.div
                key={announcement._id}
                variants={item}
                layout
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border 
                  ${announcement.isRead
                    ? 'border-gray-100 dark:border-gray-700'
                    : 'border-indigo-200 dark:border-indigo-700'} 
                  overflow-hidden hover:shadow-md transition-shadow duration-200`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 flex flex-wrap items-center gap-2">
                        {announcement.title}
                        {announcement.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            <Check className="w-3 h-3 mr-1" />
                            Read
                          </span>
                        )}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {announcement.message}
                      </p>
                    </div>
                    {!announcement.isRead && (
                      <button
                        onClick={() => markAsRead(announcement._id)}
                        disabled={markingRead}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-300 dark:border-indigo-600 
                          rounded-md text-sm font-medium text-indigo-700 dark:text-indigo-300 
                          bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-800/50
                          transition-colors duration-200 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Mark as read
                      </button>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {announcement.publishedAt && (
                          <span>Published: {new Date(announcement.publishedAt).toLocaleDateString()}</span>
                        )}
                        
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default AnnouncementsView;