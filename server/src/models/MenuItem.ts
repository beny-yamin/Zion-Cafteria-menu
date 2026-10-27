import mongoose, { Schema, Document } from 'mongoose';

export type MenuCategory = 'Starters' | 'Main Dishes' | 'Desserts' | 'Hot Drinks' | 'Cold Drinks';
export type DietaryTag = 'Vegetarian' | 'Vegan' | 'Spicy' | 'Gluten-Free';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  dietaryTags: DietaryTag[];
  imageUrl: string;
  basePrepTimeMinutes: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['Starters', 'Main Dishes', 'Desserts', 'Hot Drinks', 'Cold Drinks'],
    },
    dietaryTags: {
      type: [String],
      enum: ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-Free'],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    basePrepTimeMinutes: {
      type: Number,
      default: 15,
      min: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
