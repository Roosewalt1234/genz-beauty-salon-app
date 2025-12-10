const express = require("express");
const cors = require("cors");
const path = require("path");
const supabase = require("./db");
require("dotenv").config();

let authRoutes, uploadRoutes, staffRoutes, clientRoutes, staffProfileRoutes;
try {
  authRoutes = require("./auth");
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.error("❌ Failed to load auth routes:", err.message);
}

try {
  uploadRoutes = require("./upload");
  console.log("✅ Upload routes loaded");
} catch (err) {
  console.error("❌ Failed to load upload routes:", err.message);
}

try {
  staffRoutes = require("./staff");
  console.log("✅ Staff routes loaded");
} catch (err) {
  console.error("❌ Failed to load staff routes:", err.message);
}

try {
  staffProfileRoutes = require("./staff_profile");
  console.log("✅ Staff profile routes loaded");
} catch (err) {
  console.error("❌ Failed to load staff profile routes:", err.message);
}

try {
  clientRoutes = require("./clients");
  console.log("✅ Client routes loaded");
} catch (err) {
  console.error("❌ Failed to load client routes:", err.message);
}

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth routes
if (authRoutes) app.use("/api/auth", authRoutes);

// Upload routes
if (uploadRoutes) app.use("/api/upload", uploadRoutes);

// Staff routes
if (staffRoutes) app.use("/api/staff", staffRoutes);

// Staff profile routes
if (staffProfileRoutes) app.use("/api/staff", staffProfileRoutes);

// Client routes
if (clientRoutes) app.use("/api/clients", clientRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "GenZ Salon API", endpoints: ["/api/tenants"] });
});

// Get all tenants
app.get("/api/tenants", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get tenant by ID with all data
app.get("/api/tenants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [
      tenant,
      clients,
      staff,
      services,
      packages,
      appointments,
      products,
      campaigns,
      suppliers,
      purchaseOrders,
      stockMovements,
      notifications,
    ] = await Promise.all([
      supabase.from("tenants").select("*").eq("id", id).single(),
      supabase
        .from("clients")
        .select(
          'id, tenant_id as "tenantId", name, email, phone, dob, acquisition_source as "acquisitionSource", preferred_services as "preferredServices", skin_type as "skinType", hair_type as "hairType", notes, communication_preferences as "communicationPreferences", is_active as "isActive", loyalty_points as "loyaltyPoints", allergies, created_at as "createdAt"'
        )
        .eq("tenant_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("staff")
        .select(
          'id, tenant_id as "tenantId", name, email, phone, role, years_of_experience as "yearsOfExperience", commission, profile_image_url, rating, bio, specializations, is_active as "isActive", schedule, identity, salary, created_at as "createdAt"'
        )
        .eq("tenant_id", id),
      supabase.from("services").select("*").eq("tenant_id", id),
      supabase.from("service_packages").select("*").eq("tenant_id", id),
      supabase.from("appointments").select("*").eq("tenant_id", id),
      supabase.from("products").select("*").eq("tenant_id", id),
      supabase.from("marketing_campaigns").select("*").eq("tenant_id", id),
      supabase.from("suppliers").select("*").eq("tenant_id", id),
      supabase.from("purchase_orders").select("*").eq("tenant_id", id),
      supabase.from("stock_movements").select("*").eq("tenant_id", id),
      supabase.from("notifications").select("*").eq("tenant_id", id),
    ]);

    if (tenant.error || !tenant.data) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.json({
      ...tenant.data,
      clients: clients.data || [],
      staff: staff.data || [],
      services: services.data || [],
      packages: packages.data || [],
      appointments: appointments.data || [],
      inventory: products.data || [],
      campaigns: campaigns.data || [],
      suppliers: suppliers.data || [],
      purchaseOrders: purchaseOrders.data || [],
      stockMovements: stockMovements.data || [],
      notifications: notifications.data || [],
      complianceTasks: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create tenant
app.post("/api/tenants", async (req, res) => {
  try {
    const { id, name, ownerName, ownerEmail, ownerPassword } = req.body;
    const bcrypt = require("bcrypt");
    const ownerPasswordHash = await bcrypt.hash(ownerPassword, 10);

    const { data, error } = await supabase
      .from("tenants")
      .insert({
        id,
        name,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_password_hash: ownerPasswordHash,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update tenant data
app.put("/api/tenants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Update based on what data is provided
    if (data.clients) {
      // Handle client updates
    }
    if (data.staff) {
      // Handle staff updates
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
