import { Request, Response } from 'express';
import { MenuItem } from '../models/MenuItem.js';

export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, availableOnly } = req.query;
    const filter: Record<string, unknown> = {};

    if (category) {
      filter.category = category;
    }
    if (availableOnly === 'true') {
      filter.isAvailable = true;
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving menu items.' });
  }
};

export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      category,
      dietaryTags,
      imageUrl,
      basePrepTimeMinutes,
    } = req.body;

    if (!name || price === undefined || !category) {
      res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
      return;
    }

    const newItem = await MenuItem.create({
      name,
      description: description || '',
      price: Number(price),
      category,
      dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : [],
      imageUrl: imageUrl || '',
      basePrepTimeMinutes: basePrepTimeMinutes ? Number(basePrepTimeMinutes) : 15,
      isAvailable: true,
    });

    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    console.error('Error in createMenuItem:', error);
    res.status(500).json({ success: false, message: 'Server error creating menu item.' });
  }
};

export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await MenuItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Menu item not found.' });
      return;
    }

    res.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    res.status(500).json({ success: false, message: 'Server error updating menu item.' });
  }
};

export const toggleStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      res.status(400).json({ success: false, message: 'isAvailable boolean is required.' });
      return;
    }

    const item = await MenuItem.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    );

    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found.' });
      return;
    }

    // Broadcast stock toggle event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('stock:toggle', { menuItemId: item._id, isAvailable: item.isAvailable });
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error('Error in toggleStock:', error);
    res.status(500).json({ success: false, message: 'Server error toggling stock status.' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await MenuItem.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Menu item not found.' });
      return;
    }

    res.json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    res.status(500).json({ success: false, message: 'Server error deleting menu item.' });
  }
};
