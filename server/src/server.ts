import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Server as SocketIOServer } from 'socket.io';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to server root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from './config/db.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { MenuItem } from './models/MenuItem.js';
import { Table } from './models/Table.js';
import { AdminUser } from './models/AdminUser.js';

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Configure Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: [clientOrigin, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.io instance to Express app for controller access
app.set('io', io);

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// Socket.io connection logging & room handling
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on('join:table', (tableNumber: number) => {
    socket.join(`table:${tableNumber}`);
    console.log(`Socket ${socket.id} joined room table:${tableNumber}`);
  });

  socket.on('join:kitchen', () => {
    socket.join('kitchen');
    console.log(`Socket ${socket.id} joined room kitchen`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Automatic Seeder for First-Time Setup
const seedInitialData = async () => {
  try {
    // 1. Seed Menu Catalog
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      console.log('Seeding initial cafe menu catalog...');
      await MenuItem.insertMany([
        {
          name: 'Classic Cheeseburger',
          description: 'Juicy beef patty with sharp cheddar, crisp lettuce, tomato, and secret sauce on a brioche bun.',
          price: 12.5,
          category: 'Main Dishes',
          dietaryTags: [],
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          basePrepTimeMinutes: 15,
          isAvailable: true,
        },
        {
          name: 'Crispy Truffle Fries',
          description: 'Hand-cut golden fries tossed in aromatic white truffle oil, parmesan, and fresh parsley.',
          price: 6.5,
          category: 'Starters',
          dietaryTags: ['Vegetarian'],
          imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          basePrepTimeMinutes: 10,
          isAvailable: true,
        },
        {
          name: 'Margherita Flatbread',
          description: 'Stone-baked thin crust with San Marzano tomatoes, fresh buffalo mozzarella, and basil.',
          price: 11.0,
          category: 'Main Dishes',
          dietaryTags: ['Vegetarian'],
          imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
          basePrepTimeMinutes: 12,
          isAvailable: true,
        },
        {
          name: 'Warm Chocolate Lava Cake',
          description: 'Decadent molten dark chocolate center served warm with vanilla bean gelato.',
          price: 7.5,
          category: 'Desserts',
          dietaryTags: ['Vegetarian'],
          imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
          basePrepTimeMinutes: 8,
          isAvailable: true,
        },
        {
          name: 'Caramel Macchiato',
          description: 'Rich espresso poured over velvety steamed milk, finished with buttery caramel drizzle.',
          price: 4.8,
          category: 'Hot Drinks',
          dietaryTags: ['Vegetarian'],
          imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
          basePrepTimeMinutes: 5,
          isAvailable: true,
        },
        {
          name: 'Iced Spanish Latte',
          description: 'Double shot espresso combined with condensed milk and whole milk over cracked ice.',
          price: 5.2,
          category: 'Cold Drinks',
          dietaryTags: ['Vegetarian'],
          imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
          basePrepTimeMinutes: 4,
          isAvailable: true,
        },
      ]);
      console.log('Seeded 6 starter menu items.');
    }

    // 2. Seed Tables
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      console.log('Generating initial QR codes for Tables 1 through 8...');
      for (let i = 1; i <= 8; i++) {
        const menuUrl = `${clientOrigin}/menu?table=${i}`;
        const qrCodeUrl = await QRCode.toDataURL(menuUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 300,
        });

        await Table.create({
          tableNumber: i,
          qrCodeUrl,
          isOccupied: false,
        });
      }
      console.log('Seeded 8 physical tables with QR codes.');
    }

    // 3. Seed Default Accounts for All 4 Roles
    const seedAccounts = [
      { name: 'Master Owner', email: 'owner@cafe.com', pass: 'owner1234', role: 'Owner' as const },
      { name: 'Kitchen Head', email: 'kitchen@cafe.com', pass: 'kitchen1234', role: 'KitchenStaff' as const },
      { name: 'Floor Staff', email: 'staff@cafe.com', pass: 'staff1234', role: 'Staff' as const },
      { name: 'Loyal Customer', email: 'customer@cafe.com', pass: 'customer1234', role: 'Customer' as const },
    ];

    for (const acc of seedAccounts) {
      const passwordHash = await bcrypt.hash(acc.pass, 10);
      await AdminUser.findOneAndUpdate(
        { email: acc.email },
        {
          name: acc.name,
          email: acc.email,
          passwordHash,
          role: acc.role,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Configured default ${acc.role} account: ${acc.email} / ${acc.pass}`);
    }
  } catch (err) {
    console.error('Error in initial data seeder:', err);
  }
};

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas, seed data, and start server
connectDB().then(async () => {
  await seedInitialData();
  server.listen(PORT, () => {
    console.log(`Cafe Server listening on port ${PORT}`);
    console.log(`Client Origin configured for: ${clientOrigin}`);
  });
});

export { app, server, io };
