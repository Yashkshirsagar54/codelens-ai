import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** requireAuth=true → only signed-in users. requireAuth=false → only guests */
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Show spinner while Supabase is verifying session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b0a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5ed29c]" />
          <span className="text-xs font-mono text-slate-400">Verifying session authentication...</span>
        </div>
      </div>
    );
  }

  // Guest-only pages (/login, /register): redirect to dashboard if already signed in
  if (!requireAuth) {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Auth-required pages (/dashboard, /settings): redirect to login if not signed in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
