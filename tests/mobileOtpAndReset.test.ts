import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber } from '../server/lib/sms';
import { dbService } from '../db';
import crypto from 'crypto';

describe('Mobile OTP and Password Recovery Flow', () => {
  it('normalizes mobile numbers into valid E.164 format', () => {
    expect(normalizePhoneNumber('9876543210')).toBe('+919876543210');
    expect(normalizePhoneNumber('+91 98765 43210')).toBe('+919876543210');
    expect(normalizePhoneNumber('+1 (555) 123-4567')).toBe('+15551234567');
    expect(normalizePhoneNumber('09876543210')).toBe('+919876543210');
  });

  it('correctly creates, validates, and expires phone OTP records', () => {
    const testPhone = '+919999988888';
    const otpCode = '123456';
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
    const otpId = `otp_${Date.now()}`;
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Save Phone OTP
    dbService.savePhoneOtp(otpId, testPhone, hashedOtp, expiresAt, 60);

    // Verify record retrieval
    const record = dbService.getPhoneOtpRecord(testPhone);
    expect(record).toBeDefined();
    expect(record?.otpHash).toBe(hashedOtp);
    expect(record?.phone).toBe(testPhone);

    // Cooldown check (should enforce 60s cooldown)
    const cooldownCheck = dbService.canResendPhoneOtp(testPhone);
    expect(cooldownCheck.allowed).toBe(false);
    expect(cooldownCheck.waitSeconds).toBeGreaterThan(0);

    // Clean up
    dbService.deletePhoneOtp(testPhone);
    const deletedRecord = dbService.getPhoneOtpRecord(testPhone);
    expect(deletedRecord).toBeNull();
  });

  it('handles password reset token lifecycle and password update', () => {
    const testEmail = `test_reset_${Date.now()}@example.com`;
    const initialHash = crypto.createHash('sha256').update('InitialPass123').digest('hex');
    
    // Create user in dbService
    const userId = `usr_${Date.now()}`;
    const user = dbService.createUser({
      id: userId,
      email: testEmail,
      fullName: 'Reset Tester',
      passwordHash: initialHash,
      phone: '+919876543210',
    });
    expect(user).toBeDefined();
    expect(user.id).toBe(userId);

    // Create reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const resetId = `reset_${Date.now()}`;

    dbService.createPasswordReset(resetId, user.id, tokenHash, expiresAt);

    // Retrieve and verify token record
    const record = dbService.getPasswordResetRecord(tokenHash);
    expect(record).toBeDefined();
    expect(record?.userId).toBe(user.id);
    expect(record?.used).toBe(false);

    // Update password
    const newPassword = 'BrandNewSecurePassword456!';
    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    dbService.updateUserPassword(user.id, newHash);
    dbService.markPasswordResetUsed(tokenHash);

    // Verify token marked used
    const updatedRecord = dbService.getPasswordResetRecord(tokenHash);
    expect(updatedRecord?.used).toBe(true);

    // Verify updated password hash in user record
    const updatedUser = dbService.getUserByEmail(testEmail);
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.passwordHash).toBe(newHash);
  });
});
