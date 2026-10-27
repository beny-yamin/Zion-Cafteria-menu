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

export type OrderStatus = 'Received' | 'Cooking' | 'Ready' | 'Served' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  _id: string;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  estimatedPrepTimeMinutes: number;
  servedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  _id: string;
  tableNumber: number;
  qrCodeUrl: string;
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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'KitchenStaff';
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
