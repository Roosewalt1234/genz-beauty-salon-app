const express = require("express");
const cors = require("cors");
const supabase = require("./db");
const authRouter = require("./auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

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
      supabase.from("clients").select("*").eq("tenant_id", id),
      supabase.from("staff").select("*").eq("tenant_id", id),
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
    const { id, name } = req.body;
    const { data, error } = await supabase
      .from("tenants")
      .insert({ id, name })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update tenant data (clients, staff, etc.)
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
    // Add more handlers as needed

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
