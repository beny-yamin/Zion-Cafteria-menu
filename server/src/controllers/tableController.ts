import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { Table } from '../models/Table.js';

export const getTables = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 }).populate('activeOrderId');
    res.json({ success: true, tables });
  } catch (error) {
    console.error('Error in getTables:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving tables.' });
  }
};

export const generateTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalTables } = req.body;

    const count = Number(totalTables);
    if (!count || count < 1 || count > 200) {
      res.status(400).json({
        success: false,
        message: 'totalTables must be an integer between 1 and 200.',
      });
      return;
    }

    const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const createdOrUpdated = [];

    for (let i = 1; i <= count; i++) {
      const menuUrl = `${clientOrigin}/menu?table=${i}`;
      const qrCodeUrl = await QRCode.toDataURL(menuUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      const table = await Table.findOneAndUpdate(
        { tableNumber: i },
        {
          tableNumber: i,
          qrCodeUrl,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      createdOrUpdated.push(table);
    }

    res.status(201).json({
      success: true,
      count: createdOrUpdated.length,
      tables: createdOrUpdated,
    });
  } catch (error) {
    console.error('Error in generateTables:', error);
    res.status(500).json({ success: false, message: 'Server error generating table QR codes.' });
  }
};

export const resetTableStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableNumber } = req.params;
    const table = await Table.findOneAndUpdate(
      { tableNumber: Number(tableNumber) },
      { isOccupied: false, activeOrderId: null },
      { new: true }
    );

    if (!table) {
      res.status(404).json({ success: false, message: 'Table not found.' });
      return;
    }

    res.json({ success: true, table });
  } catch (error) {
    console.error('Error in resetTableStatus:', error);
    res.status(500).json({ success: false, message: 'Server error resetting table.' });
  }
};
