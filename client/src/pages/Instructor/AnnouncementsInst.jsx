// src/pages/Instructor/AnnouncementsInst.js
import { useEffect, useState } from "react";
import api from "../../utils/api";

const AnnouncementsInst = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Fetch all active announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/announcements");
      const validAnnouncements = data.filter((a) => new Date(a.validUntil) > new Date());
      setAnnouncements(validAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Announcements</h1>

      {/* Announcements List */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Latest Announcements</h2>
        {loading ? (
          <p>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p>No active announcements.</p>
        ) : (
          <ul className="list-disc pl-6">
            {announcements.map((announcement) => (
              <li key={announcement._id} className="mb-2">
                <strong>{announcement.title}</strong>: {announcement.message}  
                <br />
                <span className="text-gray-500 text-sm">
                  Posted by {announcement.publishedBy} - Valid Until: {new Date(announcement.validUntil).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsInst;
