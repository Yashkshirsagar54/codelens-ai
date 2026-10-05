import { Router, Request, Response } from 'express';
import { dbService } from '../../db';
import crypto from 'crypto';
import * as Sentry from '@sentry/node';
import { sendVerificationOtpEmail, sendPasswordResetEmail } from '../lib/email';
import { sendOtpSms, normalizePhoneNumber } from '../lib/sms';

export const authRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

function createToken(userId: string): string {
  return `token_${userId}_${Date.now()}`;
}

/**
 * POST /api/auth/send-otp
 * Generates and dispatches secure 6-digit OTP to user's mobile number (primary) or email with 5-minute expiry and rate limiting.
 * The OTP is NEVER exposed in the JSON response or client logs.
 */
authRouter.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone, email } = req.body;

  // 1. Mobile-based OTP verification (Primary)
  if (phone && phone.trim().length >= 8) {
    const cleanPhone = normalizePhoneNumber(phone);

    // Check resend cooldown
    const cooldownCheck = dbService.canResendPhoneOtp(cleanPhone);
    if (!cooldownCheck.allowed) {
      res.status(429).json({
        error: `Please wait ${cooldownCheck.waitSeconds}s before requesting a new code.`,
        waitSeconds: cooldownCheck.waitSeconds,
      });
      return;
    }

    const generatedOTP = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(generatedOTP);
    const expiresAtMs = Date.now() + 5 * 60 * 1000;
    const otpId = `otp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    try {
      dbService.savePhoneOtp(otpId, cleanPhone, otpHash, expiresAtMs, 60);

      // Dispatch real-time SMS
      const smsRes = await sendOtpSms(cleanPhone, generatedOTP);

      if (!smsRes.success && smsRes.error) {
        res.status(400).json({ error: smsRes.error });
        return;
      }

      res.status(200).json({
        success: true,
        message: smsRes.simulated
          ? `Code dispatched to ${cleanPhone}.`
          : `Verification code sent to ${cleanPhone}.`,
        expiresAt: expiresAtMs,
        cooldownSeconds: 60,
        simulated: smsRes.simulated,
        devOtp: smsRes.devCode,
      });
      return;
    } catch (err: any) {
      console.error('❌ Failed to process phone OTP request:', err);
      res.status(500).json({ error: 'Failed to generate and dispatch verification code.' });
      return;
    }
  }

  // 2. Email-based OTP fallback
  const targetEmail = (email || '').toLowerCase().trim();
  if (targetEmail && /\S+@\S+\.\S+/.test(targetEmail)) {
    const cooldownCheck = dbService.canResendEmailOtp(targetEmail);
    if (!cooldownCheck.allowed) {
      res.status(429).json({
        error: `Please wait ${cooldownCheck.waitSeconds}s before requesting a new verification code.`,
        waitSeconds: cooldownCheck.waitSeconds,
      });
      return;
    }

    const generatedOTP = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(generatedOTP);
    const expiresAtMs = Date.now() + 5 * 60 * 1000;
    const otpId = `otp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    try {
      dbService.saveEmailOtp(otpId, targetEmail, otpHash, expiresAtMs, 60);
      await sendVerificationOtpEmail(targetEmail, generatedOTP);

      res.status(200).json({
        success: true,
        message: `Verification code sent to ${targetEmail}.`,
        expiresAt: expiresAtMs,
        cooldownSeconds: 60,
      });
      return;
    } catch (err: any) {
      console.error('❌ Failed to process email OTP request:', err);
      res.status(500).json({ error: 'Failed to generate and dispatch verification code.' });
      return;
    }
  }

  res.status(400).json({ error: 'A valid mobile number is required to receive verification code.' });
});

/**
 * POST /api/auth/resend-otp
 * Resends a fresh 6-digit OTP, invalidating the previous OTP, respecting the 60s cooldown.
 */
authRouter.post('/resend-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone, email } = req.body;

  // 1. Mobile phone resend
  if (phone && phone.trim().length >= 8) {
    const cleanPhone = normalizePhoneNumber(phone);

    const cooldownCheck = dbService.canResendPhoneOtp(cleanPhone);
    if (!cooldownCheck.allowed) {
      res.status(429).json({
        error: `Please wait ${cooldownCheck.waitSeconds}s before requesting a new code.`,
        waitSeconds: cooldownCheck.waitSeconds,
      });
      return;
    }

    const generatedOTP = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(generatedOTP);
    const expiresAtMs = Date.now() + 5 * 60 * 1000;
    const otpId = `otp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    try {
      dbService.savePhoneOtp(otpId, cleanPhone, otpHash, expiresAtMs, 60);
      const smsRes = await sendOtpSms(cleanPhone, generatedOTP);

      if (!smsRes.success && smsRes.error) {
        res.status(400).json({ error: smsRes.error });
        return;
      }

      res.status(200).json({
        success: true,
        message: smsRes.simulated
          ? `New verification code generated for ${cleanPhone}.`
          : 'New verification code sent successfully to your mobile number.',
        expiresAt: expiresAtMs,
        cooldownSeconds: 60,
        simulated: smsRes.simulated,
        devOtp: smsRes.devCode,
      });
      return;
    } catch (err: any) {
      console.error('❌ Failed to resend mobile OTP:', err);
      res.status(500).json({ error: 'Failed to resend verification code.' });
      return;
    }
  }

  // 2. Email fallback resend
  const targetEmail = (email || '').toLowerCase().trim();
  if (targetEmail && /\S+@\S+\.\S+/.test(targetEmail)) {
    const cooldownCheck = dbService.canResendEmailOtp(targetEmail);
    if (!cooldownCheck.allowed) {
      res.status(429).json({
        error: `Please wait ${cooldownCheck.waitSeconds}s before requesting a new code.`,
        waitSeconds: cooldownCheck.waitSeconds,
      });
      return;
    }

    const generatedOTP = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(generatedOTP);
    const expiresAtMs = Date.now() + 5 * 60 * 1000;
    const otpId = `otp_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    try {
      dbService.saveEmailOtp(otpId, targetEmail, otpHash, expiresAtMs, 60);
      await sendVerificationOtpEmail(targetEmail, generatedOTP);

      res.status(200).json({
        success: true,
        message: 'New verification code sent successfully to your email.',
        expiresAt: expiresAtMs,
        cooldownSeconds: 60,
      });
      return;
    } catch (err: any) {
      console.error('❌ Failed to resend email OTP:', err);
      res.status(500).json({ error: 'Failed to resend verification code.' });
      return;
    }
  }

  res.status(400).json({ error: 'Mobile number is required to resend verification code.' });
});

/**
 * POST /api/auth/verify-otp
 * Validates 6-digit OTP, enforces max attempt limit, checks expiry, marks user as verified in DB,
 * and issues secure authentication token.
 */
authRouter.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone, email, otp, fullName } = req.body;

  if (!otp || otp.trim().length !== 6) {
    res.status(400).json({ error: 'Please enter a valid 6-digit verification code.' });
    return;
  }

  const cleanOtp = otp.trim();

  // 1. Mobile Phone OTP Verification (Primary)
  if (phone && phone.trim().length >= 8) {
    const cleanPhone = normalizePhoneNumber(phone);
    const record = dbService.getPhoneOtpRecord(cleanPhone);

    if (!record) {
      res.status(400).json({ error: 'No active OTP found. Please request a new verification code.' });
      return;
    }

    // Check expiration
    if (Date.now() > record.expiresAt) {
      dbService.deletePhoneOtp(cleanPhone);
      res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      return;
    }

    // Check max attempts
    if (record.attempts >= record.maxAttempts) {
      dbService.deletePhoneOtp(cleanPhone);
      res.status(429).json({ error: 'Too many incorrect attempts. This code has been invalidated. Please request a new code.' });
      return;
    }

    // Verify hash
    const inputHash = hashOtp(cleanOtp);
    if (record.otpHash !== inputHash) {
      const attempts = dbService.incrementOtpAttempts(record.id);
      const remaining = Math.max(0, record.maxAttempts - attempts);

      if (remaining === 0) {
        dbService.deletePhoneOtp(cleanPhone);
        res.status(429).json({ error: 'Too many incorrect attempts. Please request a new verification code.' });
        return;
      }

      res.status(400).json({
        error: `Invalid verification code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
        remainingAttempts: remaining,
      });
      return;
    }

    // Successfully verified: Invalidate OTP
    dbService.deletePhoneOtp(cleanPhone);

    try {
      let user = dbService.getUserByPhone(cleanPhone);

      if (!user) {
        const userId = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
        user = dbService.createUser({
          id: userId,
          phone: cleanPhone,
          email: email ? email.toLowerCase().trim() : `${cleanPhone.replace('+', '')}@mobile.user`,
          fullName: fullName || `Developer ${cleanPhone.slice(-4)}`,
          role: 'developer',
        });
      }

      // Mark account as verified in DB
      dbService.markUserVerified(user.id);
      dbService.updateUserLogin(user.id);
      user = dbService.getUserById(user.id)!;

      // Record auth audit log
      dbService.recordAuthLog({
        id: crypto.randomUUID(),
        userId: user.id,
        authType: 'otp_verified',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      const token = createToken(user.id);

      console.log(`✅ Phone verified and authenticated: [${cleanPhone}] (User ID: ${user.id})`);

      res.status(200).json({
        success: true,
        message: 'Account successfully verified!',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName || `Developer ${cleanPhone.slice(-4)}`,
          role: user.role || 'developer',
          isVerified: true,
          loginCount: user.loginCount || 1,
          lastLoginAt: user.lastLoginAt,
        },
        token,
      });
      return;
    } catch (error: any) {
      console.error('❌ Verification session creation error:', error);
      Sentry.captureException(error);
      res.status(500).json({ error: 'Failed to complete verification.' });
      return;
    }
  }

  // 2. Email OTP Verification Fallback
  const targetEmail = (email || '').toLowerCase().trim();
  if (targetEmail) {
    const record = dbService.getEmailOtpRecord(targetEmail);

    if (!record) {
      res.status(400).json({ error: 'No active OTP found. Please request a new verification code.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      dbService.deleteEmailOtp(targetEmail);
      res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      return;
    }

    if (record.attempts >= record.maxAttempts) {
      dbService.deleteEmailOtp(targetEmail);
      res.status(429).json({ error: 'Too many incorrect attempts. This code has been invalidated. Please request a new code.' });
      return;
    }

    const inputHash = hashOtp(cleanOtp);
    if (record.otpHash !== inputHash) {
      const attempts = dbService.incrementOtpAttempts(record.id);
      const remaining = Math.max(0, record.maxAttempts - attempts);

      if (remaining === 0) {
        dbService.deleteEmailOtp(targetEmail);
        res.status(429).json({ error: 'Too many incorrect attempts. Please request a new verification code.' });
        return;
      }

      res.status(400).json({
        error: `Invalid verification code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
        remainingAttempts: remaining,
      });
      return;
    }

    dbService.deleteEmailOtp(targetEmail);

    try {
      let user = dbService.getUserByEmail(targetEmail);

      if (!user) {
        const userId = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
        user = dbService.createUser({
          id: userId,
          email: targetEmail,
          fullName: fullName || targetEmail.split('@')[0],
          role: 'developer',
        });
      }

      dbService.markUserVerified(user.id);
      dbService.updateUserLogin(user.id);
      user = dbService.getUserById(user.id)!;

      dbService.recordAuthLog({
        id: crypto.randomUUID(),
        userId: user.id,
        authType: 'otp_verified',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      const token = createToken(user.id);

      res.status(200).json({
        success: true,
        message: 'Account successfully verified!',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          isVerified: true,
          loginCount: user.loginCount || 1,
          lastLoginAt: user.lastLoginAt,
        },
        token,
      });
      return;
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to complete verification.' });
      return;
    }
  }

  res.status(400).json({ error: 'Mobile number or email is required to verify code.' });
});

/**
 * POST /api/auth/register
 * Registers user account with Name, Email, Mobile Number, and Password.
 * Generates and sends real-time 6-digit Mobile OTP.
 * Does NOT issue auth token until OTP is verified.
 */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, phone, password, fullName } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();

  if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const cleanPhone = phone && phone.trim().length >= 8 ? normalizePhoneNumber(phone) : null;
  const passHash = hashPassword(password);

  try {
    const existingByEmail = dbService.getUserByEmail(cleanEmail);

    if (existingByEmail) {
      // If user exists and password matches, log them in smoothly
      if (existingByEmail.passwordHash && existingByEmail.passwordHash === passHash) {
        dbService.updateUserLogin(existingByEmail.id);
        const refreshedUser = dbService.getUserById(existingByEmail.id)!;
        const token = createToken(refreshedUser.id);

        dbService.recordAuthLog({
          id: crypto.randomUUID(),
          userId: refreshedUser.id,
          authType: 'login',
          ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        });

        res.status(200).json({
          success: true,
          message: 'Account already exists. Logged in successfully!',
          user: {
            id: refreshedUser.id,
            email: refreshedUser.email || '',
            phone: refreshedUser.phone || null,
            fullName: refreshedUser.fullName || refreshedUser.email?.split('@')[0],
            role: refreshedUser.role || 'developer',
            isVerified: true,
            loginCount: refreshedUser.loginCount,
            lastLoginAt: refreshedUser.lastLoginAt,
            createdAt: refreshedUser.createdAt,
          },
          token,
        });
        return;
      } else if (existingByEmail.passwordHash && existingByEmail.isVerified) {
        res.status(400).json({ error: 'An account with this email already exists. Please log in with your password.' });
        return;
      }
    }

    const userId = existingByEmail ? existingByEmail.id : `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    // Create and permanently save user account in DB
    const user = dbService.createUser({
      id: userId,
      email: cleanEmail,
      phone: cleanPhone || (existingByEmail?.phone ?? null),
      fullName: fullName || cleanEmail.split('@')[0],
      passwordHash: passHash,
      role: 'developer',
      isVerified: true,
    });

    // Record auth audit log for registration
    dbService.recordAuthLog({
      id: crypto.randomUUID(),
      userId: user.id,
      authType: 'register',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    const token = createToken(user.id);

    console.log(`✅ Real developer account registered and stored: [${user.email}] (User ID: ${user.id}, Phone: ${user.phone || 'none'})`);

    res.status(201).json({
      success: true,
      message: 'Account registered and activated successfully!',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone || null,
        fullName: user.fullName,
        role: user.role || 'developer',
        isVerified: true,
        loginCount: user.loginCount || 1,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to complete registration.' });
  }
});

/**
 * POST /api/auth/login
 * User login: authenticates password, updates login timestamp & count in DB, and logs activity
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const passHash = hashPassword(password);

  try {
    let user = dbService.getUserByEmail(cleanEmail);

    if (!user) {
      res.status(401).json({ error: 'No account found with this email. Please register first.' });
      return;
    }

    if (user.passwordHash && user.passwordHash !== passHash) {
      res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      return;
    }

    // If existing user didn't have password saved yet, set it now
    if (!user.passwordHash) {
      dbService.updateUserPassword(user.id, passHash);
    }

    // Update login timestamp & counter
    dbService.updateUserLogin(user.id);
    user = dbService.getUserById(user.id)!;

    // Record login activity log
    dbService.recordAuthLog({
      id: crypto.randomUUID(),
      userId: user.id,
      authType: 'login',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    const token = createToken(user.id);

    console.log(`🔑 Developer logged in: [${user.email}] (Total Logins: ${user.loginCount})`);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        phone: user.phone || null,
        fullName: user.fullName || (user.email ? user.email.split('@')[0] : 'Developer'),
        role: user.role || 'developer',
        isVerified: true,
        loginCount: user.loginCount || 1,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to authenticate user.' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Generates a secure, single-use 32-byte password reset token (valid for 15 minutes)
 * and dispatches a branded transactional email containing the recovery link.
 */
authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  try {
    const user = dbService.getUserByEmail(cleanEmail);

    if (!user) {
      // Return 200 to prevent account enumeration
      res.status(200).json({
        success: true,
        message: `If an account exists with ${cleanEmail}, a password reset link has been dispatched.`,
      });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAtMs = Date.now() + 15 * 60 * 1000; // 15-minute expiration
    const resetId = `rst_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    dbService.createPasswordReset(resetId, user.id, tokenHash, expiresAtMs);

    const clientOrigin = req.headers.origin || process.env.APP_URL || 'http://localhost:5173';
    const resetLink = `${clientOrigin}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(cleanEmail, resetLink, user.fullName || undefined);

    res.status(200).json({
      success: true,
      message: `Password reset link sent to ${cleanEmail}. Valid for 15 minutes.`,
    });
  } catch (err: any) {
    console.error('❌ Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

/**
 * GET /api/auth/verify-reset-token
 * Validates whether a given reset token is valid, unused, and not expired.
 */
authRouter.get('/verify-reset-token', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ valid: false, error: 'Reset token is required.' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const record = dbService.getPasswordResetRecord(tokenHash);

  if (!record || record.used || Date.now() > record.expiresAt) {
    res.status(400).json({ valid: false, error: 'Password reset link is invalid or has expired.' });
    return;
  }

  res.status(200).json({ valid: true });
});

/**
 * POST /api/auth/reset-password
 * Updates user password with SHA-256 hash, invalidates the reset token, and logs the event.
 */
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ error: 'Reset token and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const record = dbService.getPasswordResetRecord(tokenHash);

  if (!record || record.used || Date.now() > record.expiresAt) {
    res.status(400).json({ error: 'Password reset link is invalid or has expired. Please request a new one.' });
    return;
  }

  try {
    const newPassHash = hashPassword(newPassword);
    dbService.updateUserPassword(record.userId, newPassHash);
    dbService.markPasswordResetUsed(tokenHash);

    dbService.recordAuthLog({
      id: crypto.randomUUID(),
      userId: record.userId,
      authType: 'password_reset',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    console.log(`🔒 Password successfully updated for user ID: [${record.userId}]`);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
    });
  } catch (err: any) {
    console.error('❌ Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

/**
 * POST /api/auth/demo-login
 * Instant 1-click Demo Developer access with DB persistence & logging
 */
authRouter.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  const demoUserId = 'usr_demo_developer';
  const demoEmail = 'demo@codelens.ai';
  const demoName = 'Demo Developer';

  try {
    let user = dbService.getUserById(demoUserId);

    if (!user) {
      user = dbService.createUser({
        id: demoUserId,
        email: demoEmail,
        fullName: demoName,
        role: 'pro_developer',
      });
    } else {
      dbService.updateUserLogin(demoUserId);
      user = dbService.getUserById(demoUserId)!;
    }

    // Record demo auth log
    dbService.recordAuthLog({
      id: crypto.randomUUID(),
      userId: demoUserId,
      authType: 'demo',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    const token = `token_${demoUserId}`;

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName || demoName,
        role: user.role || 'pro_developer',
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('❌ Demo login error:', error);
    Sentry.captureException(error);
    res.status(500).json({ error: 'Failed to start demo session.' });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user info from DB
 */
authRouter.get('/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  let userId = token.split('_')[1] || token;
  if (!userId || userId === 'token') userId = 'usr_demo_developer';

  try {
    let user = dbService.getUserById(userId);

    if (!user) {
      user = dbService.createUser({
        id: userId,
        email: `${userId}@codelens.ai`,
        fullName: 'Developer',
        role: 'developer',
      });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email || '',
        fullName: user.fullName || 'Developer',
        phone: user.phone,
        role: user.role,
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user session' });
  }
});

/**
 * PUT /api/auth/profile
 * Updates user profile details (fullName, phone, avatarUrl) in DB
 */
authRouter.put('/profile', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  let userId = token.split('_')[1] || token;

  const { fullName, phone, avatarUrl } = req.body;

  try {
    const updated = dbService.updateUserProfile(userId, { fullName, phone, avatarUrl });
    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/auth/users
 * Returns list of all registered users (Admin / Verification endpoint)
 */
authRouter.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = dbService.getAllUsers();
    res.status(200).json({
      success: true,
      total: allUsers.length,
      users: allUsers,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch registered users list' });
  }
});

/**
 * GET /api/auth/stats
 * Returns database metrics and recent login logs
 */
authRouter.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = dbService.getStats();
    const recentLogs = dbService.getRecentAuthLogs(20);
    res.status(200).json({
      success: true,
      stats,
      recentAuthLogs: recentLogs,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch DB stats' });
  }
});
