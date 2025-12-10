const express = require("express");
const multer = require("multer");
const path = require("path");
const supabase = require("./db");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Create a separate Supabase client with service role key for storage operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Update staff profile with image upload
router.post(
  "/:staffId/profile",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { staffId } = req.params;
      const {
        name,
        email,
        phone,
        role,
        yearsOfExperience,
        commission,
        rating,
        bio,
        specializations,
        isActive,
        schedule,
        identity,
        salary,
      } = req.body;

      let profileImageUrl = null;

      // Handle image upload if provided
      if (req.file) {
        // Generate unique filename
        const fileExt = path.extname(req.file.originalname);
        const fileName = `staff-${staffId}-${Date.now()}${fileExt}`;

        // Upload to Supabase storage using admin client
        const { data, error: uploadError } = await supabaseAdmin.storage
          .from("staff images")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          return res
            .status(500)
            .json({ error: "Failed to upload profile image" });
        }

        // Get public URL using admin client
        const { data: urlData } = supabaseAdmin.storage
          .from("staff images")
          .getPublicUrl(fileName);

        profileImageUrl = urlData.publicUrl;
      }

      // Prepare staff data for update
      const staffData = {
        name,
        email,
        phone,
        role,
        years_of_experience: yearsOfExperience,
        commission,
        rating,
        bio,
        specializations:
          typeof specializations === "string"
            ? JSON.parse(specializations)
            : specializations,
        is_active: isActive,
        schedule,
        identity,
        salary,
      };

      // Add profile image URL if uploaded
      if (profileImageUrl) {
        staffData.profile_image_url = profileImageUrl;
      }

      // Update staff record in database
      const { data: staffUpdateData, error: staffUpdateError } = await supabase
        .from("staff")
        .update(staffData)
        .eq("id", staffId)
        .select()
        .single();

      if (staffUpdateError) {
        console.error("Staff update error:", staffUpdateError);
        return res
          .status(500)
          .json({ error: "Failed to update staff profile" });
      }

      res.json({
        success: true,
        staff: staffUpdateData,
        profileImageUrl: profileImageUrl || staffUpdateData.profile_image_url,
      });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ error: "Profile update failed" });
    }
  }
);

// Get staff profile
router.get("/:staffId/profile", async (req, res) => {
  try {
    const { staffId } = req.params;

    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("id", staffId)
      .single();

    if (error) {
      console.error("Error fetching staff profile:", error);
      return res.status(404).json({ error: "Staff not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching staff profile:", err);
    res.status(500).json({ error: "Failed to fetch staff profile" });
  }
});

module.exports = router;
