import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { Table, QrType } from '../models/Table.js';
import { getTableQrUrl } from '../utils/qrUrl.js';

export const getTables = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tables = await Table.find().sort({ type: -1, tableNumber: 1 }).populate('activeOrderId');

    // Auto-heal/migrate any legacy dev/localhost QR URLs to the canonical deployed URL
    const updatedTables = await Promise.all(
      tables.map(async (table) => {
        const canonicalTarget = getTableQrUrl(table.tableNumber);
        if (
          !table.targetUrl ||
          table.targetUrl.includes('localhost') ||
          table.targetUrl.includes('127.0.0.1') ||
          table.targetUrl !== canonicalTarget
        ) {
          const freshQr = await QRCode.toDataURL(canonicalTarget, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 320,
            color: { dark: '#000000', light: '#ffffff' },
          });
          table.targetUrl = canonicalTarget;
          table.qrCodeUrl = freshQr;
          await table.save();
        }
        return table;
      })
    );

    res.json({ success: true, tables: updatedTables });
  } catch (error) {
    console.error('Error in getTables:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving tables.' });
  }
};

export const createQr = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, tableNumber } = req.body;
    const qrType: QrType = type === 'general' ? 'general' : 'table';
    const num = qrType === 'general' ? 0 : Number(tableNumber);

    if (qrType === 'table' && (!num || num < 1)) {
      res.status(400).json({ success: false, message: 'Valid table number is required for table QR codes.' });
      return;
    }

    const targetUrl = getTableQrUrl(num);
    const qrCodeUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const qrName = (name || '').trim() || (qrType === 'general' ? 'General Cafeteria' : `Table ${num}`);

    const existing = await Table.findOne({ tableNumber: num, type: qrType });
    if (existing) {
      existing.name = qrName;
      existing.qrCodeUrl = qrCodeUrl;
      existing.targetUrl = targetUrl;
      existing.status = 'active';
      await existing.save();
      res.json({ success: true, table: existing });
      return;
    }

    const newTable = await Table.create({
      tableNumber: num,
      name: qrName,
      type: qrType,
      status: 'active',
      qrCodeUrl,
      targetUrl,
      isOccupied: false,
    });

    res.status(201).json({ success: true, table: newTable });
  } catch (error) {
    console.error('Error in createQr:', error);
    res.status(500).json({ success: false, message: 'Server error creating QR code.' });
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

    const createdOrUpdated = [];

    // Ensure general cafeteria QR also exists using canonical deployed URL
    const generalUrl = getTableQrUrl(0);
    const generalQr = await QRCode.toDataURL(generalUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: { dark: '#000000', light: '#ffffff' },
    });
    const generalRecord = await Table.findOneAndUpdate(
      { tableNumber: 0, type: 'general' },
      {
        tableNumber: 0,
        name: 'General Cafeteria',
        type: 'general',
        status: 'active',
        qrCodeUrl: generalQr,
        targetUrl: generalUrl,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdOrUpdated.push(generalRecord);

    for (let i = 1; i <= count; i++) {
      const menuUrl = getTableQrUrl(i);
      const qrCodeUrl = await QRCode.toDataURL(menuUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: { dark: '#000000', light: '#ffffff' },
      });

      const table = await Table.findOneAndUpdate(
        { tableNumber: i, type: 'table' },
        {
          tableNumber: i,
          name: `Table ${i}`,
          type: 'table',
          status: 'active',
          qrCodeUrl,
          targetUrl: menuUrl,
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

export const toggleTableStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const table = await Table.findById(id);
    if (!table) {
      res.status(404).json({ success: false, message: 'QR code record not found.' });
      return;
    }

    table.status = table.status === 'active' ? 'deactivated' : 'active';
    await table.save();

    res.json({ success: true, table });
  } catch (error) {
    console.error('Error in toggleTableStatus:', error);
    res.status(500).json({ success: false, message: 'Server error updating status.' });
  }
};

export const regenerateQr = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const table = await Table.findById(id);
    if (!table) {
      res.status(404).json({ success: false, message: 'QR code record not found.' });
      return;
    }

    const targetUrl = getTableQrUrl(table.tableNumber);
    const qrCodeUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: { dark: '#000000', light: '#ffffff' },
    });

    table.targetUrl = targetUrl;
    table.qrCodeUrl = qrCodeUrl;
    await table.save();

    res.json({ success: true, table });
  } catch (error) {
    console.error('Error in regenerateQr:', error);
    res.status(500).json({ success: false, message: 'Server error regenerating QR code.' });
  }
};

export const deleteTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const table = await Table.findByIdAndDelete(id);
    if (!table) {
      res.status(404).json({ success: false, message: 'QR code record not found.' });
      return;
    }
    res.json({ success: true, message: 'QR record deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteTable:', error);
    res.status(500).json({ success: false, message: 'Server error deleting table.' });
  }
};

export const checkTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const tableNumber = Number(req.params.tableNumber);
    if (isNaN(tableNumber)) {
      res.status(400).json({ success: false, message: 'Invalid table number.' });
      return;
    }

    const table = await Table.findOne({ tableNumber, type: tableNumber === 0 ? 'general' : 'table' });
    if (!table) {
      res.json({ success: true, exists: false, active: true });
      return;
    }

    res.json({
      success: true,
      exists: true,
      active: table.status === 'active',
      name: table.name,
    });
  } catch (error) {
    console.error('Error in checkTable:', error);
    res.status(500).json({ success: false, message: 'Server error checking table status.' });
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
