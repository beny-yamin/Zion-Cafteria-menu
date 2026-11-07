export type MenuCategory = 'Starters' | 'Main Dishes' | 'Desserts' | 'Hot Drinks' | 'Cold Drinks';
export type DietaryTag = 'Vegetarian' | 'Vegan' | 'Spicy' | 'Gluten-Free';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  dietaryTags: DietaryTag[];
  imageUrl: string;
  basePrepTimeMinutes: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Completed'
  | 'Cancelled'
  | 'Received'
  | 'Cooking'
  | 'Served';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  _id: string;
  orderNumber?: number;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  currency?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  tx_ref?: string;
  customerName?: string;
  customerEmail?: string;
  estimatedPrepTimeMinutes: number;
  servedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type QrType = 'table' | 'general';
export type QrStatus = 'active' | 'deactivated';

export interface Table {
  _id: string;
  tableNumber: number;
  name?: string;
  type?: QrType;
  status?: QrStatus;
  qrCodeUrl: string;
  targetUrl?: string;
  qrToken?: string;
  isOccupied: boolean;
  activeOrderId?: Order | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions: string;
}

export type UserRole = 'Owner' | 'KitchenStaff' | 'Staff';

export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  firebaseUid?: string;
  isDemo?: boolean;
  isProtected?: boolean;
  createdAt?: string;
}

export interface AnalyticsData {
  range: string;
  totalRevenue: number;
  orderCount: number;
  avgPrepTimeMinutes: number;
  topSellingItems: Array<{
    name: string;
    totalQuantity: number;
    totalSales: number;
  }>;
}
