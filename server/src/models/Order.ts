import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderStatus = 'Received' | 'Cooking' | 'Ready' | 'Served' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid';

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface IOrder extends Document {
  tableNumber: number;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
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
    tableNumber: {
      type: Number,
      required: true,
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
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Received', 'Cooking', 'Ready', 'Served', 'Cancelled'],
      default: 'Received',
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

// High performance index for active kitchen display and analytics queries
OrderSchema.index({ orderStatus: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
