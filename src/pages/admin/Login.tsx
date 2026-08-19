import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ArrowLeft,
  Clock,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface LoginProps {
  onLoginSuccess?: () => void;
  onNavigateToRegister?: () => void;
  onNavigateToHome?: () => void;
}

export const AdminLogin: React.FC<LoginProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToHome
}) => {
  const { refreshProfile } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingActivation, setIsPendingActivation] = useState(false);

  const handleNavigateToRegister = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else {
      window.location.href = '/admin/register';
    }
  };

  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleNavigateToDashboard = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsPendingActivation(false);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your administrator email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        throw authError;
      }

      const authUser = authData.user;
      if (!authUser) {
        throw new Error('Authentication succeeded but failed to retrieve user session.');
      }

      // 2. Query admin_profiles table for is_active and role verification
      const { data: profileData, error: profileError } = await supabase
        .from('admin_profiles')
        .select('*')
        .or(`user_id.eq.${authUser.id},email.ilike.${authUser.email}`)
        .maybeSingle();

      if (profileError) {
        console.warn('[AdminLogin] Error checking admin profile:', profileError);
      }

      // 3. Verification checks:
      if (!profileData) {
        // No admin profile row found
        await supabase.auth.signOut();
        setErrorMessage('Unauthorized: No administrator profile exists for this account. Please register for access.');
        setLoading(false);
        return;
      }

      if (profileData.is_active === false) {
        // Account exists but is awaiting super admin activation
        await supabase.auth.signOut();
        setIsPendingActivation(true);
        setErrorMessage('Account pending activation by Super Admin. Your credentials are valid, but an active Super Admin must approve your profile before portal access is unlocked.');
        setLoading(false);
        return;
      }

      // Sync user_id if needed
      if (profileData.user_id !== authUser.id) {
        await supabase
          .from('admin_profiles')
          .update({ user_id: authUser.id })
          .eq('id', profileData.id);
      }

      // 4. Success: Refresh Context and navigate to dashboard
      await refreshProfile();
      handleNavigateToDashboard();
    } catch (err: any) {
      console.error('[AdminLogin] Authentication failure:', err);
      if (err.message?.includes('Invalid login credentials') || err.status === 400) {
        setErrorMessage('Invalid email or password. Please verify your credentials and try again.');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred during administrator authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand & Home Breadcrumb */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <button
          onClick={handleNavigateToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Platform
        </button>

        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Digital Campux <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 ml-1">Admin Portal</span>
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Administrator Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your authorized credentials to access the central operations control hub.
            </p>
          </div>

          {/* Pending Approval Notice Banner */}
          {isPendingActivation && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-950 mb-0.5">Approval Required</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Standard Error Banner */}
          {!isPendingActivation && errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@digitalcampux.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Switch to Register */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Need administrator access?{' '}
              <button
                type="button"
                onClick={handleNavigateToRegister}
                className="font-semibold text-slate-900 hover:underline inline-block focus:outline-none"
              >
                Request an admin account
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
