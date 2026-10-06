import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AppUser {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  role?: string;
  isVerified?: boolean;
  login_count?: number;
  last_login_at?: string;
  app_metadata?: {
    provider?: string;
  };
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isSignedIn: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, fullName?: string, phone?: string) => Promise<{
    error: any;
    requiresVerification?: boolean;
    phone?: string;
    message?: string;
    cooldownSeconds?: number;
    simulated?: boolean;
    devOtp?: string;
  }>;
  sendOTP: (contact: string) => Promise<{ error: any; message?: string; cooldownSeconds?: number; simulated?: boolean; devOtp?: string }>;
  resendOTP: (contact: string) => Promise<{ error: any; message?: string; cooldownSeconds?: number; simulated?: boolean; devOtp?: string }>;
  verifyOTP: (contact: string, otp: string, fullName?: string) => Promise<{ error: any }>;
  signInWithOAuth?: (provider: 'google' | 'github') => Promise<{ error: any }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any; message?: string }>;
  verifyResetToken: (token: string) => Promise<{ valid: boolean; error?: string }>;
  updatePassword: (password: string, token?: string) => Promise<{ error: any; message?: string }>;
  updateProfile: (data: { fullName?: string; phone?: string; avatarUrl?: string }) => Promise<{ error: any }>;
  signInDemo: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'codelens_auth_token';
const USER_KEY = 'codelens_user_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore active session from localStorage on app launch
    try {
      const savedUserStr = localStorage.getItem(USER_KEY);
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (savedUserStr && savedToken) {
        setUser(JSON.parse(savedUserStr));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn('Auth restoration issue:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, email, password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: { message: data.error || 'Login failed.' } };
      }

      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role || 'developer',
        isVerified: data.user.isVerified ?? true,
        login_count: data.user.loginCount || 1,
        last_login_at: data.user.lastLoginAt,
        created_at: data.user.createdAt || new Date().toISOString(),
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: data.user.fullName },
      };

      setUser(appUser);
      localStorage.setItem(USER_KEY, JSON.stringify(appUser));
      localStorage.setItem(TOKEN_KEY, data.token);

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Server connection failed. Ensure backend server is running.' } };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string, phone?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: { message: data.error || 'Registration failed.' } };
      }

      if (data.user && data.token) {
        const appUser: AppUser = {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          isVerified: data.user.isVerified ?? true,
          role: data.user.role || 'developer',
          login_count: data.user.loginCount || 1,
          last_login_at: data.user.lastLoginAt,
          created_at: data.user.createdAt || new Date().toISOString(),
          app_metadata: { provider: 'email' },
          user_metadata: { full_name: data.user.fullName },
        };

        setUser(appUser);
        localStorage.setItem(USER_KEY, JSON.stringify(appUser));
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      return { error: null, message: data.message };
    } catch (err: any) {
      return { error: { message: err.message || 'Server connection failed. Ensure backend server is running.' } };
    }
  };

  const sendOTP = async (contact: string) => {
    try {
      const isEmail = contact.includes('@');
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: contact } : { phone: contact }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: { message: data.error || 'Failed to send verification code.' } };
      }

      return {
        error: null,
        message: data.message,
        cooldownSeconds: data.cooldownSeconds || 60,
        simulated: data.simulated,
        devOtp: data.devOtp,
      };
    } catch (err: any) {
      return { error: { message: err.message || 'Server connection error.' } };
    }
  };

  const resendOTP = async (contact: string) => {
    try {
      const isEmail = contact.includes('@');
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: contact } : { phone: contact }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: { message: data.error || 'Failed to resend verification code.' } };
      }

      return {
        error: null,
        message: data.message,
        cooldownSeconds: data.cooldownSeconds || 60,
        simulated: data.simulated,
        devOtp: data.devOtp,
      };
    } catch (err: any) {
      return { error: { message: err.message || 'Server connection error.' } };
    }
  };

  const verifyOTP = async (contact: string, otp: string, fullName?: string) => {
    try {
      const isEmail = contact.includes('@');
      const payload: any = {
        otp: otp.trim(),
        fullName,
      };
      if (isEmail) {
        payload.email = contact.toLowerCase().trim();
      } else {
        payload.phone = contact.trim();
      }

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: { message: data.error || 'Invalid verification code.' } };
      }

      const appUser: AppUser = {
        id: data.user.id,
        phone: data.user.phone,
        email: data.user.email,
        isVerified: true,
        created_at: new Date().toISOString(),
        app_metadata: { provider: isEmail ? 'email' : 'phone' },
        user_metadata: { full_name: data.user.fullName },
      };

      setUser(appUser);
      localStorage.setItem(USER_KEY, JSON.stringify(appUser));
      localStorage.setItem(TOKEN_KEY, data.token);

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Server connection error.' } };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: { message: data.error || 'Failed to send password reset email.' } };
      }

      return { error: null, message: data.message };
    } catch (err: any) {
      return { error: { message: err.message || 'Server connection error.' } };
    }
  };

  const verifyResetToken = async (token: string) => {
    try {
      const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { valid: false, error: data.error || 'Password reset link is invalid or has expired.' };
      }
      return { valid: true };
    } catch (err: any) {
      return { valid: false, error: err.message || 'Server connection error.' };
    }
  };

  const updatePassword = async (password: string, token?: string) => {
    if (!token) {
      return { error: { message: 'Password reset token is missing. Please use the link sent to your email.' } };
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { error: { message: data.error || 'Failed to update password.' } };
      }

      return { error: null, message: data.message };
    } catch (err: any) {
      return { error: { message: err.message || 'Server connection error.' } };
    }
  };

  const updateProfile = async (data: { fullName?: string; phone?: string; avatarUrl?: string }) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        return { error: { message: resData.error || 'Failed to update profile.' } };
      }

      if (user && resData.user) {
        const updated: AppUser = {
          ...user,
          phone: resData.user.phone || user.phone,
          user_metadata: {
            ...user.user_metadata,
            full_name: resData.user.fullName || user.user_metadata?.full_name,
            avatar_url: resData.user.avatarUrl || user.user_metadata?.avatar_url,
          },
        };
        setUser(updated);
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      }

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Server error updating profile' } };
    }
  };

  const signInDemo = async () => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      const demoUser: AppUser = {
        id: data.user?.id || 'demo-user-id',
        email: data.user?.email || 'demo@codelens.ai',
        created_at: new Date().toISOString(),
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: data.user?.fullName || 'Demo Developer' },
      };

      setUser(demoUser);
      localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
      localStorage.setItem(TOKEN_KEY, data.token || 'token_demo-user-id');

      return { error: null };
    } catch (err: any) {
      const fallbackUser: AppUser = {
        id: 'demo-user-id',
        email: 'demo@codelens.ai',
        created_at: new Date().toISOString(),
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: 'Demo Developer' },
      };
      setUser(fallbackUser);
      localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
      localStorage.setItem(TOKEN_KEY, 'token_demo-user-id');
      return { error: null };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return { error: null };
  };

  const getToken = async (): Promise<string | null> => {
    return localStorage.getItem(TOKEN_KEY) || 'token_demo-user-id';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSignedIn: !!user,
        signInWithEmail,
        signUpWithEmail,
        sendOTP,
        resendOTP,
        verifyOTP,
        resetPasswordForEmail,
        verifyResetToken,
        updatePassword,
        updateProfile,
        signInDemo,
        signOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
