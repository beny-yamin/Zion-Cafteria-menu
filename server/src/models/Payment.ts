import mongoose, { Schema, Document, Types } from 'mongoose';

export type PaymentGatewayStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'verification_failed';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  orderNumber: number;
  tx_ref: string;
  chapaReference?: string;
  amount: number;
  currency: 'ETB';
  paymentMethod: string;
  status: PaymentGatewayStatus;
  customerName?: string;
  customerEmail?: string;
  rawVerificationResponse?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: {
      type: Number,
      required: true,
      index: true,
    },
    tx_ref: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    chapaReference: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['ETB'],
      default: 'ETB',
    },
    paymentMethod: {
      type: String,
      default: 'chapa',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled', 'verification_failed'],
      default: 'pending',
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
    rawVerificationResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
