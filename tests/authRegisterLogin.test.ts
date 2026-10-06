import { describe, it, expect } from 'vitest';
import { dbService } from '../db';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

describe('Real Registration & Login Persistence Suite', () => {
  it('registers a user, permanently stores all data, and updates properly', () => {
    const testId = `usr_test_${Date.now()}`;
    const testEmail = `developer_${Date.now()}@example.com`;
    const testPhone = '+919876543210';
    const testPass = 'SecurePass123!';
    const passHash = hashPassword(testPass);

    // 1. Create user
    const created = dbService.createUser({
      id: testId,
      email: testEmail,
      phone: testPhone,
      fullName: 'Yash Developer',
      passwordHash: passHash,
      role: 'developer',
      isVerified: true,
    });

    expect(created).toBeDefined();
    expect(created.id).toBe(testId);
    expect(created.email).toBe(testEmail);
    expect(created.phone).toBe(testPhone);
    expect(created.fullName).toBe('Yash Developer');
    expect(created.isVerified).toBe(true);

    // 2. Fetch by email
    const fetched = dbService.getUserByEmail(testEmail);
    expect(fetched).toBeDefined();
    expect(fetched?.passwordHash).toBe(passHash);

    // 3. Record login and increment count
    dbService.updateUserLogin(testId);
    const updated = dbService.getUserById(testId);
    expect(updated?.loginCount).toBe(2);

    // 4. Verify in getAllUsers
    const all = dbService.getAllUsers();
    const inList = all.find((u) => u.id === testId);
    expect(inList).toBeDefined();
    expect(inList?.email).toBe(testEmail);
    expect(inList?.phone).toBe(testPhone);
  });

  it('supports lookup and login via registered mobile number', () => {
    const testId = `usr_phone_${Date.now()}`;
    const testPhone = '+919988776655';
    const testPass = 'Password123!';
    const passHash = hashPassword(testPass);

    dbService.createUser({
      id: testId,
      email: `phone_${Date.now()}@domain.com`,
      phone: testPhone,
      fullName: 'Phone User',
      passwordHash: passHash,
      role: 'developer',
      isVerified: true,
    });

    const userByPhone = dbService.getUserByPhone(testPhone);
    expect(userByPhone).toBeDefined();
    expect(userByPhone?.id).toBe(testId);
    expect(userByPhone?.passwordHash).toBe(passHash);
    expect(userByPhone?.fullName).toBe('Phone User');
  });
});
