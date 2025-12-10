const fetch = require("node-fetch"); // Assuming node-fetch is available or using built-in fetch in Node 18+
// If running in environment with built-in fetch (Node 18+), we don't need require.
// We'll wrap in an async function.

const BASE_URL = "http://localhost:3002/api";

async function testStaffEndpoints() {
  console.log("Starting Staff API Stability Test...");

  try {
    // 1. Get Tenants to find a valid tenant ID
    console.log("Fetching tenants...");
    const tenantsRes = await fetch(`${BASE_URL}/tenants`);
    if (!tenantsRes.ok)
      throw new Error(`Failed to fetch tenants: ${tenantsRes.statusText}`);
    const tenants = await tenantsRes.json();

    if (tenants.length === 0) {
      console.warn("No tenants found. Cannot test staff endpoints.");
      return;
    }

    const tenantId = tenants[0].id;
    console.log(`Using Tenant ID: ${tenantId}`);

    // 2. Add New Staff
    const newStaff = {
      id: crypto.randomUUID(), // Node 19+ has global crypto, or utilize a simple generator if needed
      name: "Test User Stability",
      email: `test_stability_${Date.now()}@example.com`,
      phone: "1234567890",
      role: "Stylist",
      isActive: true,
      tenantId: tenantId,
    };

    console.log("Adding new staff member...");
    const addRes = await fetch(`${BASE_URL}/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStaff),
    });

    if (!addRes.ok) {
      const err = await addRes.text();
      throw new Error(`Failed to add staff: ${addRes.status} ${err}`);
    }

    const addedStaff = await addRes.json();
    console.log("Start Added:", addedStaff.id);

    // 3. Update Staff
    console.log("Updating staff member...");
    const updateData = {
      ...addedStaff,
      name: "Test User Updated",
      yearsOfExperience: 5,
    };

    const updateRes = await fetch(`${BASE_URL}/staff/${addedStaff.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Failed to update staff: ${updateRes.status} ${err}`);
    }
    console.log("Staff Updated successfully.");

    // 4. Get Staff List
    console.log("Fetching staff list...");
    const listRes = await fetch(`${BASE_URL}/staff/${tenantId}`);
    if (!listRes.ok) throw new Error(`Failed to fetch staff list`);
    const staffList = await listRes.json();
    const found = staffList.find((s) => s.id === addedStaff.id);

    if (!found) throw new Error("Added staff member not found in list!");
    if (found.name !== "Test User Updated")
      throw new Error("Staff update did not persist!");
    console.log("Staff verification successful.");

    // 5. Delete Staff
    console.log("Deleting staff member...");
    const delRes = await fetch(`${BASE_URL}/staff/${addedStaff.id}`, {
      method: "DELETE",
    });

    if (!delRes.ok) throw new Error("Failed to delete staff");
    console.log("Staff deleted successfully.");

    console.log("PASSED: All Staff API stability tests passed.");
  } catch (error) {
    console.error("FAILED:", error);
  }
}

// Simple UUID generator fallback if crypto is not globally available in older node
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
  };
}

testStaffEndpoints();
