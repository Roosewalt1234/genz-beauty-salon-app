const express = require("express");
const multer = require("multer");
const path = require("path");
const supabase = require("./db");

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

// Upload endpoint
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate unique filename
    const fileExt = path.extname(req.file.originalname);
    const fileName = `staff-${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("staff images")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res
        .status(500)
        .json({ error: "Failed to upload image to storage" });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("staff images")
      .getPublicUrl(fileName);

    res.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
