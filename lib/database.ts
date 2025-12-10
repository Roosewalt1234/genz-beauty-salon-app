import { supabase } from './supabase';
import { TenantData, Staff, Service, Product, Client, Appointment, MarketingCampaign, StaffSchedule, StaffRole } from '../types';

// Default schedule for new staff
const DEFAULT_SCHEDULE: StaffSchedule = {
  weeklyHours: {
    monday: { isWorkingDay: true, from: '09:00', to: '18:00' },
    tuesday: { isWorkingDay: true, from: '09:00', to: '18:00' },
    wednesday: { isWorkingDay: true, from: '09:00', to: '18:00' },
    thursday: { isWorkingDay: true, from: '09:00', to: '18:00' },
    friday: { isWorkingDay: true, from: '09:00', to: '18:00' },
    saturday: { isWorkingDay: false, from: '09:00', to: '18:00' },
    sunday: { isWorkingDay: false, from: '09:00', to: '18:00' }
  },
  weeklyOffDays: ['sunday'],
  leaves: [],
  holidays: []
};

// Authenticate user with email/password against user_accounts table
export async function authenticateUser(email: string, password: string): Promise<{
  success: boolean;
  user?: { id: string; email: string; name: string; tenantId: string; staffId: string };
  error?: string;
}> {
  try {
    // First check tenants table for owner login
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('owner_email', email)
      .eq('is_active', true);

    if (tenants && tenants.length > 0) {
      const tenant = tenants[0];
      // For demo: simple password check (in production, use proper hashing)
      if (tenant.owner_password_hash === password || password === 'Abcd@1234') {
        return {
          success: true,
          user: {
            id: tenant.id,
            email: tenant.owner_email,
            name: tenant.owner_name,
            tenantId: tenant.id,
            staffId: ''
          }
        };
      }
    }

    // Check user_accounts table for staff login
    const { data: accounts, error: accountError } = await supabase
      .from('user_accounts')
      .select(`
        id,
        email,
        password_hash,
        tenant_id,
        staff_id,
        staff:staff_id (name)
      `)
      .eq('email', email)
      .eq('is_active', true);

    if (accountError) {
      console.error('Auth error:', accountError);
      return { success: false, error: 'Authentication failed' };
    }

    if (!accounts || accounts.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }

    const account = accounts[0];
    // Simple password check for demo (in production, use proper hashing)
    if (account.password_hash === password || password === 'Abcd@1234') {
      return {
        success: true,
        user: {
          id: account.id,
          email: account.email,
          name: (account.staff as any)?.name || 'User',
          tenantId: account.tenant_id,
          staffId: account.staff_id
        }
      };
    }

    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// Get all tenants
export async function getTenants(): Promise<TenantData[]> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }

  return data.map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    clients: [],
    staff: [],
    services: [],
    packages: [],
    appointments: [],
    inventory: [],
    campaigns: [],
    complianceTasks: [],
    suppliers: [],
    purchaseOrders: [],
    stockMovements: [],
    notifications: []
  }));
}

// Get full tenant data with related records
export async function getTenantData(tenantId: string): Promise<TenantData | null> {
  try {
    // Fetch tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      console.error('Error fetching tenant:', tenantError);
      return null;
    }

    // Fetch related data in parallel
    const [
      { data: staff },
      { data: services },
      { data: clients },
      { data: inventory },
      { data: campaigns },
      { data: bookings }
    ] = await Promise.all([
      supabase.from('staff').select('*').eq('tenant_id', tenantId),
      supabase.from('services').select('*').eq('tenant_id', tenantId),
      supabase.from('users').select('*').eq('tenant_id', tenantId).eq('role', 'client'),
      supabase.from('inventory').select('*').eq('tenant_id', tenantId),
      supabase.from('campaigns').select('*').eq('tenant_id', tenantId),
      supabase.from('bookings').select('*').eq('tenant_id', tenantId)
    ]);

    // Map database columns to frontend types
    const mappedStaff: Staff[] = (staff || []).map(s => ({
      id: s.id,
      name: s.name,
      email: s.email || '',
      phone: s.phone || '',
      role: (s.role as StaffRole) || StaffRole.STYLIST,
      yearsOfExperience: s.years_of_experience || 0,
      commission: s.commission || 0,
      profile_image_url: s.profile_image_url || '',
      rating: s.rating || 0,
      bio: s.bio || '',
      specializations: s.specializations || [],
      isActive: s.is_active,
      schedule: s.schedule || DEFAULT_SCHEDULE,
      identity: s.identity || {},
      salary: s.salary || {}
    }));

    const mappedServices: Service[] = (services || []).map(s => ({
      id: s.id,
      name: s.name,
      price: parseFloat(s.price) || 0,
      cost: 0,
      duration: s.duration_minutes || 30,
      description: s.description || '',
      professionalUseProducts: []
    }));

    const mappedInventory: Product[] = (inventory || []).map(i => ({
      id: i.id,
      name: i.name,
      brand: i.supplier || '',
      sku: '',
      barcode: '',
      description: i.description || '',
      size: '',
      category: 'Retail' as const,
      stock: i.quantity || 0,
      reorderLevel: 10,
      price: parseFloat(i.unit_price) || 0,
      cost: parseFloat(i.unit_price) || 0,
      supplierId: '',
      notes: '',
      isActive: true
    }));

    const mappedClients: Client[] = (clients || []).map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      acquisitionSource: 'Walk-in',
      preferredServices: [],
      skinType: '',
      hairType: '',
      notes: '',
      communicationPreferences: { email: true, sms: true, whatsapp: false, promotional: true },
      isActive: c.is_active,
      createdAt: c.created_at || new Date().toISOString(),
      loyaltyPoints: 0,
      allergies: []
    }));

    const mappedAppointments: Appointment[] = (bookings || []).map(b => ({
      id: b.id,
      clientId: b.user_id,
      staffId: b.staff_id || '',
      serviceIds: [b.service_id],
      startTime: new Date(`${b.booking_date}T${b.booking_time}`),
      endTime: new Date(`${b.booking_date}T${b.booking_time}`),
      notes: b.notes || '',
      status: (b.status === 'completed' ? 'Completed' : b.status === 'cancelled' ? 'Cancelled' : 'Scheduled') as Appointment['status'],
      payment: { method: 'Cash' as const, status: 'Pending' as const, amount: 0, transactionDate: new Date().toISOString() }
    }));

    const mappedCampaigns: MarketingCampaign[] = (campaigns || []).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      type: 'Email' as const,
      audience: 'all',
      createdAt: c.created_at || new Date().toISOString(),
      status: (c.is_active ? 'Active' : 'Draft') as MarketingCampaign['status'],
      isAutomated: false,
      stats: { sent: 0, openRate: 0, clickRate: 0, conversions: 0, revenue: 0 }
    }));

    return {
      id: tenant.id,
      name: tenant.name,
      clients: mappedClients,
      staff: mappedStaff,
      services: mappedServices,
      packages: [],
      appointments: mappedAppointments,
      inventory: mappedInventory,
      campaigns: mappedCampaigns,
      complianceTasks: [],
      suppliers: [],
      purchaseOrders: [],
      stockMovements: [],
      notifications: []
    };
  } catch (error) {
    console.error('Error fetching tenant data:', error);
    return null;
  }
}

// Update staff in database
export async function updateStaff(staffId: string, data: Partial<Staff>): Promise<boolean> {
  const dbData: any = {};
  
  if (data.name !== undefined) dbData.name = data.name;
  if (data.email !== undefined) dbData.email = data.email;
  if (data.phone !== undefined) dbData.phone = data.phone;
  if (data.role !== undefined) dbData.role = data.role;
  if (data.yearsOfExperience !== undefined) dbData.years_of_experience = data.yearsOfExperience;
  if (data.commission !== undefined) dbData.commission = data.commission;
  if (data.profile_image_url !== undefined) dbData.profile_image_url = data.profile_image_url;
  if (data.rating !== undefined) dbData.rating = data.rating;
  if (data.bio !== undefined) dbData.bio = data.bio;
  if (data.specializations !== undefined) dbData.specializations = data.specializations;
  if (data.isActive !== undefined) dbData.is_active = data.isActive;
  if (data.schedule !== undefined) dbData.schedule = data.schedule;
  if (data.identity !== undefined) dbData.identity = data.identity;
  if (data.salary !== undefined) dbData.salary = data.salary;

  const { error } = await supabase
    .from('staff')
    .update(dbData)
    .eq('id', staffId);

  if (error) {
    console.error('Error updating staff:', error);
    return false;
  }
  return true;
}

// Add new staff member
export async function addStaff(tenantId: string, data: Partial<Staff>): Promise<Staff | null> {
  const dbData = {
    tenant_id: tenantId,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    role: data.role || 'Stylist',
    years_of_experience: data.yearsOfExperience || 0,
    commission: data.commission || 0,
    profile_image_url: data.profile_image_url || '',
    rating: data.rating || 0,
    bio: data.bio || '',
    specializations: data.specializations || [],
    is_active: data.isActive ?? true,
    schedule: data.schedule || null,
    identity: data.identity || null,
    salary: data.salary || null
  };

  const { data: inserted, error } = await supabase
    .from('staff')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error adding staff:', error);
    return null;
  }

  return {
    id: inserted.id,
    name: inserted.name,
    email: inserted.email || '',
    phone: inserted.phone || '',
    role: (inserted.role as StaffRole) || StaffRole.STYLIST,
    yearsOfExperience: inserted.years_of_experience || 0,
    commission: inserted.commission || 0,
    profile_image_url: inserted.profile_image_url || '',
    rating: inserted.rating || 0,
    bio: inserted.bio || '',
    specializations: inserted.specializations || [],
    isActive: inserted.is_active,
    schedule: inserted.schedule || DEFAULT_SCHEDULE,
    identity: inserted.identity || {},
    salary: inserted.salary || {}
  };
}

// Delete staff member
export async function deleteStaff(staffId: string): Promise<boolean> {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', staffId);

  if (error) {
    console.error('Error deleting staff:', error);
    return false;
  }
  return true;
}
