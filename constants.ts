import { TenantData, StaffRole, DaySchedule } from './types';

export const DEFAULT_SCHEDULE = {
    weeklyHours: {
        monday: { isWorkingDay: true, from: '09:00', to: '18:00' },
        tuesday: { isWorkingDay: true, from: '09:00', to: '18:00' },
        wednesday: { isWorkingDay: true, from: '09:00', to: '18:00' },
        thursday: { isWorkingDay: true, from: '09:00', to: '18:00' },
        friday: { isWorkingDay: true, from: '09:00', to: '18:00' },
        saturday: { isWorkingDay: true, from: '10:00', to: '16:00' },
        sunday: { isWorkingDay: false, from: '', to: '' },
    },
    weeklyOffDays: ['sunday'],
    leaves: [],
    holidays: [],
};

export const STAFF_ROLES: StaffRole[] = [
    StaffRole.STYLIST,
    StaffRole.COLORIST,
    StaffRole.NAIL_TECHNICIAN,
    StaffRole.ESTHETICIAN,
    StaffRole.MASSAGE_THERAPIST,
    StaffRole.MANAGER,
    StaffRole.RECEPTIONIST,
];

export const SPECIALIZATIONS_LIST = [
    "Haircut", "Hair Coloring", "Manicure", "Pedicure", "Facial", "Massage", "Waxing", "Makeup"
];

export const SKIN_TYPES = ["Normal", "Oily", "Dry", "Combination", "Sensitive"];
export const HAIR_TYPES = ["Straight", "Wavy", "Curly", "Coily"];
export const ACQUISITION_SOURCES = ["Word of Mouth", "Social Media", "Walk-in", "Google Search", "Referral"];

export const MOCK_TENANTS: TenantData[] = [
  {
    id: 't1',
    name: 'Glamoir Beauty Lounge',
    clients: [
      {
        id: 'c1',
        name: 'Alice Johnson',
        phone: '5551234567',
        email: 'alice.j@example.com',
        dob: '1990-05-15',
        acquisitionSource: 'Social Media',
        preferredServices: ['Haircut', 'Manicure'],
        skinType: 'Combination',
        notes: 'Prefers organic products.',
        communicationPreferences: { sms: true, email: true, whatsapp: false, promotional: true },
        isActive: true,
        createdAt: '2023-01-20T10:00:00Z',
        loyaltyPoints: 1250,
        allergies: ['Peanuts'],
        purchasedPackages: [
            { packageId: 'pkg1', purchaseDate: '2023-10-15T14:00:00Z', remainingServices: [{ serviceId: 's3', quantity: 3 }, { serviceId: 's4', quantity: 2 }] }
        ],
        loyaltyHistory: [
            { id: 'lh1', date: '2023-10-15T14:05:00Z', type: 'earned', points: 350, reason: 'Purchased Mani-Pedi Combo' },
            { id: 'lh2', date: '2023-11-02T11:20:00Z', type: 'earned', points: 50, reason: 'Appointment: Haircut' },
            { id: 'lh3', date: '2023-12-05T15:00:00Z', type: 'redeemed', points: -150, reason: '10% off retail product' },
            { id: 'lh4', date: '2024-01-10T10:00:00Z', type: 'manual_addition', points: 1000, reason: 'Year-end bonus points' },
        ]
      },
      {
        id: 'c2',
        name: 'Bob Williams',
        phone: '5559876543',
        email: 'bob.w@example.com',
        preferredServices: ['Massage'],
        communicationPreferences: { sms: true, email: false, whatsapp: false, promotional: false },
        isActive: true,
        createdAt: '2023-03-10T11:30:00Z',
        loyaltyPoints: 500,
        loyaltyHistory: [
            { id: 'lh5', date: '2023-03-10T11:35:00Z', type: 'earned', points: 100, reason: 'First appointment bonus' },
            { id: 'lh6', date: '2023-08-22T18:00:00Z', type: 'earned', points: 400, reason: 'Appointment: Massage' },
        ]
      }
    ],
    staff: [
      {
        id: 'st1',
        name: 'Chloe Davis',
        phone: '5551112222',
        role: StaffRole.STYLIST,
        rating: 4.8,
        specializations: ['Haircut', 'Hair Coloring'],
        isActive: true,
        schedule: DEFAULT_SCHEDULE,
        profileImageUrl: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=200&h=200&fit=crop&q=80'
      },
      {
        id: 'st2',
        name: 'David Miller',
        phone: '5553334444',
        role: StaffRole.ESTHETICIAN,
        rating: 4.9,
        specializations: ['Facial', 'Waxing'],
        isActive: true,
        schedule: DEFAULT_SCHEDULE,
        profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80'
      },
      {
        id: 'st3',
        name: 'Emily White',
        phone: '5557778888',
        role: StaffRole.NAIL_TECHNICIAN,
        rating: 4.7,
        specializations: ['Manicure', 'Pedicure'],
        isActive: false,
        schedule: DEFAULT_SCHEDULE,
        profileImageUrl: 'https://images.unsplash.com/photo-1607957159143-de3859adca2d?w=200&h=200&fit=crop&q=80'
      }
    ],
    services: [
      { id: 's1', name: 'Haircut', price: 50, cost: 5, duration: 45, description: "Classic haircut and style." },
      { id: 's2', name: 'Hair Coloring', price: 120, cost: 25, duration: 120, description: "Full hair coloring service." },
      { id: 's3', name: 'Manicure', price: 35, cost: 8, duration: 30, description: "Standard manicure with polish." },
      { id: 's4', name: 'Pedicure', price: 45, cost: 10, duration: 45, description: "Relaxing pedicure service." },
      { id: 's5', name: 'Facial', price: 80, cost: 15, duration: 60, description: "Deep cleansing and moisturizing facial." },
      { id: 's6', name: 'Massage', price: 100, cost: 12, duration: 60, description: "60-minute Swedish massage." },
    ],
    packages: [
        { id: 'pkg1', name: "Mani-Pedi Combo", services: [{ serviceId: 's3', quantity: 5}, {serviceId: 's4', quantity: 5}], price: 350, isActive: true, description: "Get 5 manicures and 5 pedicures at a discounted rate."}
    ],
    appointments: [
      {
        id: 'a1',
        clientId: 'c1',
        staffId: 'st1',
        serviceIds: ['s1'],
        startTime: new Date(new Date().setDate(new Date().getDate() + 2)),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).getTime() + 45 * 60000),
        notes: '',
        status: 'Scheduled',
      },
      {
        id: 'a2',
        clientId: 'c2',
        staffId: 'st2',
        serviceIds: ['s5'],
        startTime: new Date(new Date().setDate(new Date().getDate() - 5)),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).getTime() + 60 * 60000),
        notes: 'Client has sensitive skin',
        status: 'Paid',
        payment: { method: 'Card', amount: 80, transactionDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), status: 'Paid' },
        rating: 5,
      }
    ],
    inventory: [
      { id: 'p1', name: 'Organic Shampoo', brand: 'NaturePure', category: 'Retail', stock: 50, reorderLevel: 10, price: 25, cost: 12, isActive: true, sku: 'NP-SH-001' },
      { id: 'p2', name: 'Pro Keratin Treatment', brand: 'GlamoirPro', category: 'Professional', stock: 15, reorderLevel: 5, price: 0, cost: 40, isActive: true, sku: 'GP-KT-001' },
      { id: 'p3', name: 'Red Nail Polish #42', brand: 'ColorPop', category: 'Professional', stock: 5, reorderLevel: 10, price: 0, cost: 5, isActive: true, sku: 'CP-NP-042', expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString() }
    ],
    campaigns: [
        { id: 'mc1', name: "Welcome New Clients", description: "Automated welcome email for new clients with a 10% discount.", type: 'Email', audience: 'New Clients', createdAt: '2023-01-15T09:00:00Z', status: 'Active', isAutomated: true, stats: { sent: 150, openRate: 45, clickRate: 20, conversions: 30, revenue: 2400 } }
    ],
    complianceTasks: [],
    suppliers: [
        { id: 'sup1', name: 'Beauty Supplies Inc.', contactPerson: 'John Smith', phone: '555-SUP-PLY1', email: 'sales@beautysupplies.com' },
        { id: 'sup2', name: 'Glamoir Professional', contactPerson: 'Jane Doe', phone: '555-PRO-GLAM', email: 'orders@glamoirpro.com' }
    ],
    purchaseOrders: [
        { id: 'po1', poNumber: 'PO-2024-001', supplierId: 'sup1', items: [{ productId: 'p1', quantity: 20, cost: 12 }], orderDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(), status: 'Received', totalCost: 240, receivedDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString() }
    ],
    stockMovements: [
        { id: 'sm1', productId: 'p1', date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), type: 'in', quantity: 20, reason: 'Purchase Order', relatedPoId: 'po1'}
    ],
    notifications: [],
  }
];