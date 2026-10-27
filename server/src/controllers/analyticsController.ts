import { Request, Response } from 'express';
import { Order } from '../models/Order.js';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { range = 'today' } = req.query;

    const now = new Date();
    let startDate: Date;

    if (range === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      // 'today' default: from beginning of current day
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    }

    // Match all completed (Served) orders within date window
    const matchStage = {
      orderStatus: 'Served',
      createdAt: { $gte: startDate },
    };

    const [metricsResult] = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgPrepTimeMs: {
            $avg: {
              $cond: [
                { $and: ['$servedAt', '$createdAt'] },
                { $subtract: ['$servedAt', '$createdAt'] },
                null,
              ],
            },
          },
        },
      },
    ]);

    // Top selling items aggregation
    const topSellingItems = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: '$_id',
          totalQuantity: 1,
          totalSales: { $round: ['$totalSales', 2] },
        },
      },
    ]);

    const totalRevenue = metricsResult ? Math.round(metricsResult.totalRevenue * 100) / 100 : 0;
    const orderCount = metricsResult ? metricsResult.orderCount : 0;
    const avgPrepTimeMinutes = metricsResult && metricsResult.avgPrepTimeMs
      ? Math.round((metricsResult.avgPrepTimeMs / (1000 * 60)) * 10) / 10
      : 0;

    res.json({
      success: true,
      range,
      totalRevenue,
      orderCount,
      avgPrepTimeMinutes,
      topSellingItems,
    });
  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    res.status(500).json({ success: false, message: 'Server error calculating analytics.' });
  }
};
