import Announcement from "../models/Announcement.js";
import User from "../models/User.js";

// Create an announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, publishedBy, targetAudience, validUntil } = req.body;
    const newAnnouncement = new Announcement({ 
      title, 
      message, 
      publishedBy, 
      targetAudience, 
      validUntil 
    });
    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement created successfully", announcement: newAnnouncement });
  } catch (error) {
    res.status(500).json({ message: "Error creating announcement", error: error.message });
  }
};

// Get announcements relevant to the current user
export const getAnnouncements = async (req, res) => {
  try {
    let { role, chair, id } = req.user;
    const currentDate = new Date();
    console.log(chair, role, id);

    // Ensure role and chair are arrays
    role = Array.isArray(role) ? role : [role];
    chair = Array.isArray(chair) ? chair : [chair];

    const announcements = await Announcement.find({
      $and: [
        { validUntil: { $gte: currentDate } },
        {
          $or: [
            { 'targetAudience.roles': { $in: role } },
            { 'targetAudience.chairs': { $in: chair } }
          ]
        }
      ]
    }).sort({ publishedAt: -1 });

    const announcementsWithReadStatus = announcements.map(announcement => {
      const isRead = announcement.readBy?.some(read => {
        return read.userId && read.userId.toString() === id.toString();
      }) || false;

      return {
        ...announcement._doc,
        isRead
      };
    });

    res.json(announcementsWithReadStatus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error: error.message });
  }
};





// Get announcements published by the current user
export const getAnnouncementsForPublisher = async (req, res) => {
  try {
    const { role } = req.user;
    const announcements = await Announcement.find({ publishedBy: role });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error: error.message });
  }
};

// Mark an announcement as read
export const markAnnouncementAsRead = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const userId = req.user.id;

    // Check if announcement exists
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user has already read this announcement
    const alreadyRead = announcement.readBy.some(read => read.userId.toString() === userId.toString());
    
    if (!alreadyRead) {
      // Mark as read
      announcement.readBy.push({ userId, readAt: new Date() });
      await announcement.save();
    }

    res.json({ message: "Announcement marked as read", isRead: true });
  } catch (error) {
    res.status(500).json({ message: "Error marking announcement as read", error: error.message });
  }
};

// Update an announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, targetAudience, validUntil } = req.body;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message, targetAudience, validUntil },
      { new: true }
    );
    if (!updatedAnnouncement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement updated successfully", announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ message: "Error updating announcement", error: error.message });
  }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    if (!deletedAnnouncement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting announcement", error: error.message });
  }
};

// Get read statistics for an announcement
export const getAnnouncementReadStats = async (req, res) => {
  try {
    const announcementId = req.params.id;
    
    const announcement = await Announcement.findById(announcementId)
      .populate('readBy.userId', 'fullName username role chair');
    
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    
    // Count total target audience
    let targetAudienceCount = 0;
    
    // If targeting specific roles
    if (announcement.targetAudience.roles && announcement.targetAudience.roles.length > 0) {
      const roleCount = await User.countDocuments({
        role: { $in: announcement.targetAudience.roles }
      });
      targetAudienceCount += roleCount;
    }
    
    // If targeting specific chairs
    if (announcement.targetAudience.chairs && announcement.targetAudience.chairs.length > 0) {
      const chairCount = await User.countDocuments({
        chair: { $in: announcement.targetAudience.chairs }
      });
      // We need to be careful not to double-count users who match both role and chair
      // This is a simplification that might count some users twice
      targetAudienceCount += chairCount;
    }
    
    const readCount = announcement.readBy.length;
    
    res.json({
      announcement: {
        title: announcement.title,
        publishedAt: announcement.publishedAt
      },
      stats: {
        totalTargetAudience: targetAudienceCount,
        readCount,
        readPercentage: targetAudienceCount > 0 ? (readCount / targetAudienceCount) * 100 : 0
      },
      readBy: announcement.readBy
    });
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcement statistics", error: error.message });
  }
};
