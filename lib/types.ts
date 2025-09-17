// Centralized type definitions for the ZetraTech admin system
// These types are shared between frontend and backend

export interface Store {
  id: string;
  name: string;
  businessType: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  subscriptionPackage: {
    id: string;
    name: string;
    price: number;
    currency: string;
    description: string | null;
    maxStores: number;
    maxProducts: number;
    maxUsers: number;
    features: string[];
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdByAdmin?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  storeId?: string;
  store?: {
    id: string;
    name: string;
  };
  role: 'ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  basePrice: number;
  unit: string;
  type: 'prepackaged' | 'loose_weight';
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  imageUrl?: string;
  barcode?: string;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  weight?: number;
  weightUnit?: string;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'jazzcash' | 'easypaisa';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  change?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  weight?: number;
  unitPrice: number;
  totalPrice: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF';
  };
  message: string;
}

// Subscription package types
export interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  maxStores: number;
  maxProducts: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Constraint visualization types
export interface DatabaseConstraint {
  table: string;
  column: string;
  constraintType: string;
  details: string;
  status: 'OK' | 'WARNING' | 'ERROR';
}

// Recycle bin types
export interface RecycleBinItem {
  id: string;
  type: string;
  name: string;
  deletedAt: string;
  deletedBy?: string;
}

// Audit types
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  user?: User;
  storeId?: string;
  store?: Store;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
