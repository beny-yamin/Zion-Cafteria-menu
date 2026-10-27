import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'Owner' | 'KitchenStaff' | 'Staff' | 'Customer';

export interface IAdminUser extends Document {
  firebaseUid?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    firebaseUid: {
      type: String,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Owner', 'KitchenStaff', 'Staff', 'Customer'],
      default: 'Staff',
    },
  },
  {
    timestamps: true,
  }
);

AdminUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
