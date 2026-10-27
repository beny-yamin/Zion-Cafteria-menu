const API_URL = 'http://localhost:5000/api';

async function runRBACTest() {
  console.log('=== Starting Firebase & 4-Role RBAC Integration Verification ===\n');

  // 1. Test All 4 Pre-Configured Seed Accounts
  const seedCredentials = [
    { role: 'Owner', email: 'owner@cafe.com', pass: 'owner1234' },
    { role: 'KitchenStaff', email: 'kitchen@cafe.com', pass: 'kitchen1234' },
    { role: 'Staff', email: 'staff@cafe.com', pass: 'staff1234' },
    { role: 'Customer', email: 'customer@cafe.com', pass: 'customer1234' },
  ];

  const tokens: Record<string, string> = {};

  for (const cred of seedCredentials) {
    const res = (await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cred.email, password: cred.pass }),
    }).then((r) => r.json())) as any;

    if (!res.success || res.user.role !== cred.role) {
      throw new Error(`Login failed for ${cred.role} (${cred.email}): ${JSON.stringify(res)}`);
    }

    tokens[cred.role] = res.token;
    console.log(`✓ Authenticated [${cred.role}] successfully: "${res.user.name}" (${res.user.email}) -> Role: "${res.user.role}"`);
  }

  // 2. Test RBAC Route Protection on API
  console.log('\n--- Testing RBAC Endpoint Protection ---');

  // Kitchen Staff attempting Owner-only endpoint (GET /api/auth/users)
  const kitchenForbiddenRes = await fetch(`${API_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${tokens['KitchenStaff']}` },
  });
  if (kitchenForbiddenRes.status !== 403) {
    throw new Error(`Expected 403 for KitchenStaff accessing /api/auth/users, got ${kitchenForbiddenRes.status}`);
  }
  console.log('✓ Route Guard: KitchenStaff correctly rejected from Owner endpoint with 403 Forbidden.');

  // Owner accessing Owner-only endpoint (GET /api/auth/users)
  const ownerUsersRes = (await fetch(`${API_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${tokens['Owner']}` },
  }).then((r) => r.json())) as any;

  if (!ownerUsersRes.success || !Array.isArray(ownerUsersRes.users)) {
    throw new Error(`Owner failed to list users: ${JSON.stringify(ownerUsersRes)}`);
  }
  console.log(`✓ Route Guard: Owner allowed. Found ${ownerUsersRes.users.length} registered accounts in Staff Manager.`);

  // 3. Test Owner Staff Management Lifecycle
  console.log('\n--- Testing Owner Staff Management Lifecycle ---');

  // A. Create new team member
  const createRes = (await fetch(`${API_URL}/auth/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['Owner']}`,
    },
    body: JSON.stringify({
      name: 'Test Barista',
      email: 'barista.test@cafe.com',
      password: 'password123',
      role: 'Staff',
    }),
  }).then((r) => r.json())) as any;

  if (!createRes.success) {
    throw new Error(`Failed to create staff member: ${JSON.stringify(createRes)}`);
  }
  const newStaffId = createRes.user.id;
  console.log(`✓ Owner created new staff account: "${createRes.user.name}" (${createRes.user.email}) -> Role: "${createRes.user.role}"`);

  // B. Update staff role to KitchenStaff
  const roleUpdateRes = (await fetch(`${API_URL}/auth/users/${newStaffId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['Owner']}`,
    },
    body: JSON.stringify({ role: 'KitchenStaff' }),
  }).then((r) => r.json())) as any;

  if (!roleUpdateRes.success || roleUpdateRes.user.role !== 'KitchenStaff') {
    throw new Error(`Failed to update role: ${JSON.stringify(roleUpdateRes)}`);
  }
  console.log(`✓ Owner changed role for user to: "${roleUpdateRes.user.role}"`);

  // C. Reset staff password
  const passResetRes = (await fetch(`${API_URL}/auth/users/${newStaffId}/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['Owner']}`,
    },
    body: JSON.stringify({ newPassword: 'newSecretPass456' }),
  }).then((r) => r.json())) as any;

  if (!passResetRes.success) {
    throw new Error(`Failed to reset password: ${JSON.stringify(passResetRes)}`);
  }
  console.log('✓ Owner reset staff password successfully.');

  // D. Delete staff member
  const deleteRes = (await fetch(`${API_URL}/auth/users/${newStaffId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokens['Owner']}` },
  }).then((r) => r.json())) as any;

  if (!deleteRes.success) {
    throw new Error(`Failed to delete staff member: ${JSON.stringify(deleteRes)}`);
  }
  console.log('✓ Owner deleted test staff account.');

  console.log('\n=== All Firebase & 4-Role RBAC Tests Passed with 100% Success! ===');
  process.exit(0);
}

runRBACTest().catch((err) => {
  console.error('\n❌ RBAC Test Failed:', err);
  process.exit(1);
});
