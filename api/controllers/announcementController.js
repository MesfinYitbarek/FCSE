import Announcement from "../models/Announcement.js";

// Create an announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, publishedBy, viewedBy, validUntil } = req.body;
    const newAnnouncement = new Announcement({ title, message, publishedBy, viewedBy, validUntil });
    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement created successfully", announcement: newAnnouncement });
  } catch (error) {
    res.status(500).json({ message: "Error creating announcement", error });
  }
};

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const { role } = req.user; // Assuming the user's role is available in req.user
    const announcements = await Announcement.find({ viewedBy: role });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error });
  }
};

// Get all announcements
export const getAnnouncementsForPublisher = async (req, res) => {
  try {
    const { role } = req.user; // Assuming the user's role is available in req.user
    const announcements = await Announcement.find({ publishedBy: role });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error });
  }
};
// Update an announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, viewedBy, validUntil } = req.body;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message, viewedBy, validUntil },
      { new: true }
    );
    if (!updatedAnnouncement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement updated successfully", announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ message: "Error updating announcement", error });
  }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    if (!deletedAnnouncement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting announcement", error });
  }
};
