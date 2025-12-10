import { ReactNode } from 'react';

export interface Service {
  id: string;
  name: string;
  price: number;
  cost: number;
  duration: number; // in minutes
  description?: string;
  professionalUseProducts?: {
    productId: string;
    quantityUsed: number;
    unit: 'ml' | 'g' | 'pcs';
  }[];
}

export interface ServicePackageItem {
  serviceId: string;
  quantity: number;
}

export interface ServicePackage {
  id:string;
  name: string;
  description?: string;
  services: ServicePackageItem[];
  price: number;
  isActive: boolean;
}

export interface PurchasedPackage {
  packageId: string;
  purchaseDate: string;
  remainingServices: ServicePackageItem[];
}

export interface LoyaltyTransaction {
  id: string;
  date: string; // ISO string
  type: 'earned' | 'redeemed' | 'manual_addition' | 'manual_deduction';
  points: number; // can be positive or negative
  reason: string;
}


export interface Client {
  id:string;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  acquisitionSource?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
  };
  preferredServices: string[];
  skinType?: string;
  hairType?: string;
  notes?: string;
  communicationPreferences: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
    promotional: boolean;
  };
  isActive: boolean;
  createdAt: string;
  loyaltyPoints?: number;
  allergies?: string[];
  purchasedPackages?: PurchasedPackage[];
  loyaltyHistory?: LoyaltyTransaction[];
}

export enum StaffRole {
  STYLIST = 'Stylist',
  COLORIST = 'Colorist',
  NAIL_TECHNICIAN = 'Nail Technician',
  ESTHETICIAN = 'Esthetician',
  MASSAGE_THERAPIST = 'Massage Therapist',
  MANAGER = 'Manager',
  RECEPTIONIST = 'Receptionist',
}

export interface DaySchedule {
    isWorkingDay: boolean;
    from: string; // "HH:MM"
    to: string;   // "HH:MM"
}

export interface StaffSchedule {
    weeklyHours: {
        monday: DaySchedule;
        tuesday: DaySchedule;
        wednesday: DaySchedule;
        thursday: DaySchedule;
        friday: DaySchedule;
        saturday: DaySchedule;
        sunday: DaySchedule;
    };
    weeklyOffDays: string[]; // e.g., ['sunday']
    leaves: string[]; // ISO date strings "YYYY-MM-DD"
    holidays: string[]; // ISO date strings "YYYY-MM-DD"
}


export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: StaffRole;
  yearsOfExperience?: number;
  commission?: number;
  profile_image_url?: string;
  rating?: number;
  bio?: string;
  specializations: string[];
  isActive: boolean;
  schedule: StaffSchedule;
  identity?: {
    emiratesId?: string;
    emiratesIdExpiry?: string;
    passportNumber?: string;
    passportExpiry?: string;
    ohcNumber?: string;
    ohcExpiry?: string;
  };
  salary?: {
    payrollType?: 'Full Time' | 'Part Time' | 'Commission' | 'Temporary' | '';
    basicSalary?: number;
    accommodationAllowance?: number;
    transportAllowance?: number;
    notes?: string;
  };
}

export interface Payment {
    method: 'Cash' | 'Card' | 'Digital Wallet' | 'Package';
    amount: number;
    transactionDate: string;
    status: 'Paid' | 'Pending' | 'Refunded';
    pointsEarned?: number;
    pointsRedeemed?: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  staffId: string;
  serviceIds: string[];
  startTime: Date;
  endTime: Date;
  notes: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'Paid';
  payment?: Payment;
  rating?: number;
}

export interface Product {
    id: string;
    name: string;
    brand: string;
    sku?: string;
    barcode?: string;
    description?: string;
    size?: string; // e.g., "250ml", "50g"
    category: 'Retail' | 'Professional';
    stock: number;
    reorderLevel: number;
    price: number; // Selling price
    cost: number; // Purchase cost
    supplierId?: string;
    expiryDate?: string;
    lastOrderedDate?: string;
    notes?: string;
    isActive: boolean;
}

export interface MarketingCampaign {
    id: string;
    name: string;
    description: string;
    type: 'Email' | 'SMS' | 'WhatsApp' | 'Email Blast';
    audience: string;
    createdAt: string;
    scheduledAt?: string;
    status: 'Active' | 'Completed' | 'Scheduled' | 'Draft' | 'Paused';
    isAutomated: boolean;
    stats: {
        sent: number;
        openRate: number;
        clickRate: number;
        conversions: number;
        revenue: number;
    };
}


export interface ComplianceTask {
    id: string;
    name: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    lastCompleted?: string;
    assignedTo: string; // Staff ID
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  cost: number; // Cost per item at time of order
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g., PO-2025-001
  supplierId: string;
  items: PurchaseOrderItem[];
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  status: 'Draft' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';
  totalCost: number;
  notes?: string;
}

export type StockMovementReason = 'Purchase Order' | 'Customer Return' | 'Stock Count Correction' | 'Retail Sale' | 'Professional Use' | 'Damaged/Expired' | 'Initial Stock';

export interface StockMovement {
  id: string;
  productId: string;
  date: string; // ISO string
  type: 'in' | 'out';
  quantity: number;
  reason: StockMovementReason;
  notes?: string;
  relatedPoId?: string; // Link to PO if applicable
}

export interface AppNotification {
  id: string; // e.g., `low-stock-${productId}`
  type: 'low_stock' | 'expiring_soon';
  message: string;
  relatedId: string; // e.g., productId
  createdAt: string; // ISO string
  isRead: boolean;
}


export interface TenantData {
  id: string;
  name: string;
  clients: Client[];
  staff: Staff[];
  appointments: Appointment[];
  inventory: Product[];
  campaigns: MarketingCampaign[];
  complianceTasks: ComplianceTask[];
  services: Service[];
  packages: ServicePackage[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];
  notifications: AppNotification[];
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}