const API_URL = 'http://localhost:3002/api';

export const api = {
  // Get all tenants
  getTenants: async () => {
    const response = await fetch(`${API_URL}/tenants`);
    return response.json();
  },

  // Get tenant by ID with all data
  getTenant: async (id: string) => {
    const response = await fetch(`${API_URL}/tenants/${id}`);
    return response.json();
  },

  // Create new tenant
  createTenant: async (tenant: { id: string; name: string; ownerName: string; ownerEmail: string; ownerPassword: string }) => {
    const response = await fetch(`${API_URL}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenant)
    });
    return response.json();
  },

  // Update tenant data
  updateTenant: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
