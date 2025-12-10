const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("./db");

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, tenantId, role } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data, error } = await supabase
      .from("users")
      .insert({
        tenant_id: tenantId,
        email,
        password_hash: passwordHash,
        name,
        role: role || "staff",
      })
      .select("id, email, name, role, tenant_id")
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = null;

    // First, check users table for owners/clients with password
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .not("password_hash", "is", null)
      .eq("is_active", true)
      .single();

    if (userData) {
      user = userData;
    } else {
      // If not found in users, check user_accounts for staff
      const { data: staffData } = await supabase
        .from("user_accounts")
        .select("*, staff(name, role, profile_image_url)")
        .eq("email", email)
        .eq("is_active", true)
        .single();

      if (staffData) {
        user = {
          ...staffData,
          name: staffData.staff.name,
          role: staffData.staff.role || "staff",
          profile_image_url: staffData.staff.profile_image_url,
        };
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant_id,
        profileImageUrl: user.profile_image_url,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create user account for staff
router.post("/create-user-account", async (req, res) => {
  try {
    const { staffId, email, password, tenantId } = req.body;

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("user_accounts")
      .select("*")
      .or(`staff_id.eq.${staffId},email.eq.${email}`)
      .single();

    if (existingAccount) {
      return res.status(400).json({
        error: "Account already exists for this staff member or email",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user account
    const { data, error } = await supabase
      .from("user_accounts")
      .insert({
        tenant_id: tenantId,
        staff_id: staffId,
        email,
        password_hash: passwordHash,
      })
      .select("id, email, staff_id, tenant_id")
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
