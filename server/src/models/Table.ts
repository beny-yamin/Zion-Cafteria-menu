import mongoose, { Schema, Document, Types } from 'mongoose';

export type QrType = 'table' | 'general';
export type QrStatus = 'active' | 'deactivated';

export interface ITable extends Document {
  tableNumber: number;
  name: string;
  type: QrType;
  status: QrStatus;
  qrCodeUrl: string;
  targetUrl: string;
  isOccupied: boolean;
  activeOrderId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    tableNumber: {
      type: Number,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: function (this: ITable) {
        return this.type === 'general' ? 'General Cafeteria' : `Table ${this.tableNumber}`;
      },
    },
    type: {
      type: String,
      enum: ['table', 'general'],
      default: 'table',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'deactivated'],
      default: 'active',
      index: true,
    },
    qrCodeUrl: {
      type: String,
      required: true,
    },
    targetUrl: {
      type: String,
      required: true,
      default: '',
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    activeOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

TableSchema.index({ tableNumber: 1, type: 1 });

export const Table = mongoose.model<ITable>('Table', TableSchema);
