import dotenv from 'dotenv';

dotenv.config();

/**
 * Normalizes a raw phone input to E.164-compatible international format.
 * Defaults 10-digit Indian numbers to +91 country code.
 */
export function normalizePhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');

  // If starts with +, maintain E.164
  if (rawPhone.trim().startsWith('+')) {
    return `+${digits}`;
  }

  // 10-digit standard Indian phone number
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // 11-digit starting with 0 (Indian local format)
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }

  // 12-digit starting with 91
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export interface SmsDispatchResult {
  success: boolean;
  simulated: boolean;
  provider?: string;
  devCode?: string;
  error?: string;
}

/**
 * Dispatches real-time 6-digit OTP via SMS.
 * Checks for live SMS providers in order:
 *  1. Fast2SMS (Indian SMS gateway - fast & simple for +91 numbers)
 *  2. Twilio (Global SMS gateway)
 *  3. 2Factor (India OTP SMS gateway)
 *  4. Development Local Simulator (when no live SMS API credentials are set)
 */
export async function sendOtpSms(recipientPhone: string, otpCode: string): Promise<SmsDispatchResult> {
  const normalizedPhone = normalizePhoneNumber(recipientPhone);
  const rawDigits = recipientPhone.replace(/\D/g, '');
  const tenDigitPhone = rawDigits.slice(-10);

  // --------------------------------------------------------------------------
  // 1. Provider: Fast2SMS (Direct Indian SMS delivery to +91 mobile numbers)
  // --------------------------------------------------------------------------
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey && tenDigitPhone.length === 10) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: tenDigitPhone,
        }),
      });

      const data = await response.json();
      if (response.ok && data?.return === true) {
        console.log(`📱 [Fast2SMS] Real SMS dispatched to [${normalizedPhone}]! Message:`, data.message || 'OTP Sent');
        return { success: true, simulated: false, provider: 'fast2sms' };
      } else {
        const errorMsg = Array.isArray(data?.message) ? data.message.join(', ') : (data?.message || 'Fast2SMS dispatch rejected.');
        console.warn('⚠️ Fast2SMS API response:', errorMsg);
        return {
          success: false,
          simulated: false,
          provider: 'fast2sms',
          error: errorMsg,
        };
      }
    } catch (f2sErr: any) {
      console.warn('⚠️ Fast2SMS delivery error:', f2sErr.message);
      return {
        success: false,
        simulated: false,
        provider: 'fast2sms',
        error: `Fast2SMS network connection failed: ${f2sErr.message}`,
      };
    }
  }

  // --------------------------------------------------------------------------
  // 2. Provider: Twilio (Global carrier SMS)
  // --------------------------------------------------------------------------
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromNumber) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('To', normalizedPhone);
      params.append('From', fromNumber);
      params.append('Body', `[CodeLens AI] Your verification code is ${otpCode}. Valid for 5 minutes. Do not share this code.`);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (res.ok) {
        console.log(`📱 [Twilio] Real SMS dispatched to [${normalizedPhone.slice(0, 6)}****]`);
        return { success: true, simulated: false, provider: 'twilio' };
      } else {
        const errText = await res.text();
        console.warn('⚠️ Twilio SMS dispatch API error:', errText);
      }
    } catch (twErr: any) {
      console.warn('⚠️ Twilio connection failed:', twErr.message);
    }
  }

  // --------------------------------------------------------------------------
  // 3. Provider: 2Factor (India OTP SMS Gateway)
  // --------------------------------------------------------------------------
  const twoFactorKey = process.env.TWOFACTOR_API_KEY;
  if (twoFactorKey && tenDigitPhone.length === 10) {
    try {
      const endpoint = `https://2factor.in/API/V1/${twoFactorKey.trim()}/SMS/${tenDigitPhone}/${otpCode}/AUTOGEN`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (res.ok && data?.Status === 'Success') {
        console.log(`📱 [2Factor] Real SMS dispatched to [${normalizedPhone}]`);
        return { success: true, simulated: false, provider: '2factor' };
      }
    } catch (twoErr: any) {
      console.warn('⚠️ 2Factor delivery error:', twoErr.message);
    }
  }

  // --------------------------------------------------------------------------
  // 4. Real-Time Development Simulator (Terminal Output + UI Hint in dev mode)
  // --------------------------------------------------------------------------
  const divider = '═'.repeat(60);
  console.log(`
╔${divider}╗
║ 📱 [CODELENS AI] REAL-TIME MOBILE SMS DISPATCH SIMULATOR   ║
╠${divider}╣
║ Recipient Mobile : ${normalizedPhone.padEnd(40)} ║
║ Security OTP     : ${otpCode.padEnd(40)} ║
║ Expiration       : 5 Minutes (300 seconds)                ║
║ Notice           : Live SMS gateway key not yet in .env   ║
╚${divider}╝`);

  return {
    success: true,
    simulated: true,
    devCode: otpCode,
  };
}
