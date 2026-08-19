import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RegisterProps {
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
}

export const AdminRegister: React.FC<RegisterProps> = ({ 
  onNavigateToLogin,
  onNavigateToHome 
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNavigateToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.location.href = '/admin/login';
    }
  };

  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Form Validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      // 1. Register Auth User in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'admin',
          },
        },
      });

      if (authError) {
        throw authError;
      }

      const authUser = authData.user;
      if (!authUser) {
        throw new Error('Registration failed to create an authenticated record.');
      }

      // 2. Insert Pending Row into admin_profiles with is_active = false
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .upsert(
          [
            {
              user_id: authUser.id,
              full_name: fullName.trim(),
              email: email.trim().toLowerCase(),
              role: 'admin',
              is_active: false, // strictly pending approval
            },
          ],
          { onConflict: 'user_id' }
        );

      if (profileError) {
        console.warn('[AdminRegister] Non-fatal admin profile upsert warning:', profileError);
        // Continue if profile insert is also handled by DB triggers
      }

      // 3. Render Success Confirmation State
      setIsSuccess(true);
    } catch (err: any) {
      console.error('[AdminRegister] Registration error:', err);
      if (err.message?.includes('User already registered') || err.code === 'user_already_exists') {
        setErrorMessage('An account with this email address already exists. Please proceed to sign in.');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred during registration. Please try again.');
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
          
          {isSuccess ? (
            /* Confirmation State: Account Pending Activation */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/70 text-amber-800 border border-amber-200 mb-3">
                Registration Successful • Pending Review
              </span>

              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Account Awaiting Activation
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Your administrative account request for <strong className="text-slate-900">{email}</strong> has been registered. 
                For platform security, all new administrator credentials require review and activation by a Super Admin before access is granted.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left mb-6 space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Your credentials are securely hashed and stored.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>The Super Admin team has been notified for profile approval.</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleNavigateToLogin}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
                >
                  Return to Admin Login <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Standard Registration Form */
            <div>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Request Admin Access
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Create your administrator account. Super Admin approval is required.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
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
                  <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters with mixed characters recommended.</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Registration Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Footer Switch to Login */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Already have an approved administrator profile?{' '}
                  <button
                    type="button"
                    onClick={handleNavigateToLogin}
                    className="font-semibold text-slate-900 hover:underline inline-block focus:outline-none"
                  >
                    Sign In here
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
