import User from "../models/user.js";

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.result._id;
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }
    
    const user = await User.findById(userId);
    user.profilePicture = req.file.path; // Cloudinary secure URL
    await user.save();
    
    res.json({ message: "Profile picture updated successfully", profilePicture: user.profilePicture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating profile picture." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching user profile." });
  }
};
