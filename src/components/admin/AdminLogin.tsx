import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { verifyAdminStatus } from '../../lib/adminApi';

interface AdminLoginProps {
  onSuccess: (email: string) => void;
  onExitToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExitToStore }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your administrator email and password.');
      setIsLoading(false);
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      // Local preview simulation when Supabase credentials are not yet entered in .env
      if (cleanEmail.toLowerCase().includes('admin') || cleanEmail.toLowerCase().includes('mahad')) {
        localStorage.setItem('ak_sports_admin_mock_session', cleanEmail);
        onSuccess(cleanEmail);
        setIsLoading(false);
        return;
      }
      setErrorMessage('Offline test mode: Use an email containing "admin" or "mahad" to test the admin panel, or provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError || !authData.user) {
        let msg = authError?.message || 'Invalid administrator login credentials.';
        if (msg.toLowerCase().includes('invalid path')) {
          msg = 'Invalid Supabase Project URL: Please ensure VITE_SUPABASE_URL in Vercel is set to "https://<project-id>.supabase.co" without any "/rest/v1" or trailing slash.';
        }
        setErrorMessage(msg);
        setIsLoading(false);
        return;
      }

      // 2. Verify against public.admins via public.is_admin()
      const status = await verifyAdminStatus();

      if (!status.isAdmin) {
        // Sign out immediately: User exists in Auth but is NOT in public.admins
        await supabase.auth.signOut();
        setErrorMessage('Access Denied: This account is authenticated but not listed in the public.admins authorization table. Please contact the store owner.');
        setIsLoading(false);
        return;
      }

      onSuccess(status.email || cleanEmail);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error authenticating with Supabase Auth.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] flex flex-col justify-center items-center p-4 antialiased text-white">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full mx-auto p-0.5 bg-black border-2 border-[#d4af37] shadow-xl overflow-hidden flex items-center justify-center">
            <img 
              src="/images/ak_sports_logo.jpg" 
              alt="AK Sports Official Logo" 
              className="w-full h-full object-cover object-center scale-135"
            />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-mono font-bold text-[#d4af37]">
              Internal Portal
            </span>
            <h1 className="font-display font-extrabold text-2xl tracking-wide uppercase text-white mt-0.5">
              AK Sports Admin
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Restricted catalog and stock inventory management.
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-[#1c1c1f] p-8 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aksports.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/90 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/90 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#d4af37] hover:bg-[#c29e2f] text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Permissions...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800/80 text-center">
            <span className="text-[11px] text-zinc-500 block">
              Direct Supabase Auth · Verified via public.is_admin()
            </span>
          </div>
        </div>

        {/* Back to Public Store */}
        <div className="text-center">
          <button
            onClick={onExitToStore}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public AK Sports Store</span>
          </button>
        </div>

      </div>
    </div>
  );
};
