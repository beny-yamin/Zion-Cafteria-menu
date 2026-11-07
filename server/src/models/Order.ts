import mongoose, { Schema, Document, Types } from 'mongoose';

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

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface IOrder extends Document {
  orderNumber: number;
  tableNumber: number;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  currency: 'ETB';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentId?: Types.ObjectId;
  tx_ref?: string;
  customerName?: string;
  customerEmail?: string;
  estimatedPrepTimeMinutes: number;
  servedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    specialInstructions: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: Number,
      index: true,
    },
    tableNumber: {
      type: Number,
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'An order must contain at least one item.',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['ETB'],
      default: 'ETB',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'Preparing',
        'Ready',
        'Completed',
        'Cancelled',
        'Received',
        'Cooking',
        'Served',
      ],
      default: 'Pending',
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    tx_ref: {
      type: String,
      default: '',
      index: true,
    },
    customerName: {
      type: String,
      default: '',
      trim: true,
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true,
    },
    estimatedPrepTimeMinutes: {
      type: Number,
      default: 15,
      min: 0,
    },
    servedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// High performance indices for active kitchen display and analytics queries
OrderSchema.index({ paymentStatus: 1, orderStatus: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
