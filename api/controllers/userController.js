import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmail } from "../utils/emailService.js";
import { generateResetToken, validateResetToken } from "../utils/tokenService.js";
import { validationResult } from "express-validator";
dotenv.config();

// User signup
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, role, phone, chair, rank, position, location, active } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      role,
      phone,
      chair,
      rank,
      position,
      location,
      active: active !== undefined ? active : true, // Use provided active status or default to true
    });
    
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user account is active
    if (!user.active) return res.status(403).json({ message: "Account is inactive. Please contact administrator." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role, chair: user.chair }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
// Password Reset Route
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const token = generateResetToken(email);
    await sendEmail(email, "Password Reset", `Your reset token: ${token}`);
    res.json({ message: "Reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending reset email", error });
  }
};

// Confirm Password Reset Route
export const confirmReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const email = validateResetToken(token);
    if (!email) return res.status(400).json({ message: "Invalid or expired token" });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
};


// Get course by chair
export const getUserByChair = async (req, res) => {
  try {
    const users = await User.find({ chair: req.params.chair, role: "Instructor" }); // Find users with the specified chair and role
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No instructors found for this chair" });
    }
    res.json(users); // Return the list of users
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructors", error });
  }
};

export const getUserByRole = async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }); // Find users with the specified role
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found " });
    }
    res.json(users); // Return the list of users
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};


export const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, currentPassword, newPassword } = req.body;

  try {
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as current password' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save the updated user
    await user.save();

    // Log the password change (optional)
    console.log(`User ${user.email} changed their password`);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserStatistics = async (req, res) => {
  try {
    // Total number of users
    const totalUsers = await User.countDocuments();

    // Number of users per role
    const usersByRole = await User.aggregate([
      { 
        $group: { 
          _id: "$role", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Number of users per chair
    const usersByChair = await User.aggregate([
      { 
        $group: { 
          _id: "$chair", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Number of users per rank
    const usersByRank = await User.aggregate([
      { 
        $group: { 
          _id: "$rank", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Number of users per location
    const usersByLocation = await User.aggregate([
      { 
        $group: { 
          _id: "$location", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    res.status(200).json({
      totalUsers,
      usersByRole,
      usersByChair,
      usersByRank,
      usersByLocation
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user statistics", error });
  }
};
