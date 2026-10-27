import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITable extends Document {
  tableNumber: number;
  qrCodeUrl: string;
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
      unique: true,
      min: 1,
    },
    qrCodeUrl: {
      type: String,
      required: true,
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

export const Table = mongoose.model<ITable>('Table', TableSchema);
