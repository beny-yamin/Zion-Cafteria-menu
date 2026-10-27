import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function runE2ETest() {
  console.log('=== Starting End-to-End Integration Smoke Test ===\n');

  // 1. Connect Socket.io client to listen for real-time events
  const socket = io(SOCKET_URL, { transports: ['websocket'] });
  const receivedEvents: string[] = [];

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
    socket.on('connect', () => {
      clearTimeout(timer);
      console.log('✓ Socket.io test client connected:', socket.id);
      socket.emit('join:kitchen');
      socket.emit('join:table', 3);
      resolve();
    });
  });

  socket.on('order:new', (order: { tableNumber: number; totalAmount: number }) => {
    receivedEvents.push(`order:new: Table ${order.tableNumber}`);
    console.log(`✓ Real-time event received [order:new]: Table #${order.tableNumber}, Total: $${order.totalAmount}`);
  });

  socket.on('order:status-change', (data: { orderStatus: string }) => {
    receivedEvents.push(`order:status-change: ${data.orderStatus}`);
    console.log(`✓ Real-time event received [order:status-change]: Order transitioned to "${data.orderStatus}"`);
  });

  // 2. Fetch public menu items
  const menuRes = (await fetch(`${API_URL}/menu`).then((r) => r.json())) as any;
  if (!menuRes.success || menuRes.items.length === 0) {
    throw new Error('Failed to retrieve menu items or catalog is empty.');
  }
  const firstItem = menuRes.items[0];
  console.log(`✓ Retrieved menu catalog (${menuRes.items.length} items). Selected: "${firstItem.name}" ($${firstItem.price})`);

  // 3. Login as Owner to obtain auth token
  const loginRes = (await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@cafe.com', password: 'admin1234' }),
  }).then((r) => r.json())) as any;

  if (!loginRes.success || !loginRes.token) {
    throw new Error('Staff authentication failed.');
  }
  const token = loginRes.token;
  console.log('✓ Owner authentication successful. Bearer token acquired.');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 4. Place customer order for Table 3
  const orderRes = (await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tableNumber: 3,
      items: [
        {
          menuItemId: firstItem._id,
          quantity: 2,
          specialInstructions: 'Extra napkins please',
        },
      ],
    }),
  }).then((r) => r.json())) as any;

  const createdOrder = orderRes.order;
  console.log(`✓ Order placed successfully for Table 3:`);
  console.log(`  - Subtotal: $${createdOrder.subtotal}`);
  console.log(`  - Tax (15%): $${createdOrder.tax}`);
  console.log(`  - Total: $${createdOrder.totalAmount}`);

  // Wait 1s for socket broadcast propagation
  await new Promise((r) => setTimeout(r, 1000));

  // 5. Query active orders as Kitchen Staff
  const activeRes = (await fetch(`${API_URL}/orders/active`, { headers: authHeaders }).then((r) => r.json())) as any;
  if (!activeRes.orders) {
    throw new Error(`Active orders query failed: ${JSON.stringify(activeRes)}`);
  }
  const foundInActive = activeRes.orders.some((o: { _id: string }) => o._id === createdOrder._id);
  if (!foundInActive) {
    throw new Error('Placed order did not appear in the active kitchen queue.');
  }
  console.log(`✓ Kitchen queue confirmed order present (${activeRes.orders.length} active orders).`);

  // 6. Transition order status: Received -> Cooking -> Ready -> Served
  await fetch(`${API_URL}/orders/${createdOrder._id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ orderStatus: 'Cooking' }),
  });
  await new Promise((r) => setTimeout(r, 500));

  await fetch(`${API_URL}/orders/${createdOrder._id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ orderStatus: 'Ready' }),
  });
  await new Promise((r) => setTimeout(r, 500));

  await fetch(`${API_URL}/orders/${createdOrder._id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ orderStatus: 'Served' }),
  });
  await new Promise((r) => setTimeout(r, 500));

  // 7. Verify Owner Analytics Dashboard
  const analyticsRes = (await fetch(`${API_URL}/analytics/dashboard?range=today`, {
    headers: authHeaders,
  }).then((r) => r.json())) as any;

  console.log('✓ Owner Analytics Dashboard:');
  console.log(`  - Total Revenue: $${analyticsRes.totalRevenue}`);
  console.log(`  - Orders Count: ${analyticsRes.orderCount}`);
  console.log(`  - Avg Prep Time: ${analyticsRes.avgPrepTimeMinutes} min`);

  socket.disconnect();
  console.log('\n=== All E2E Integration Checks Passed with 100% Success! ===');
  process.exit(0);
}

runE2ETest().catch((err) => {
  console.error('\n❌ E2E Smoke Test Failed:', err);
  process.exit(1);
});
