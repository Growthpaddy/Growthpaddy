import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export type AdminRole = 'super_admin' | 'admin';

export interface AdminProfileRecord {
  id?: string;
  user_id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at?: string;
}

export interface AdminSignInFormProps {
  onSuccess?: (adminProfile: AdminProfileRecord) => void;
  onBackToMain?: () => void;
  initialMode?: 'signin' | 'signup';
  className?: string;
  adminInviteCode?: string;
  customInviteValidator?: (code: string) => Promise<boolean> | boolean;
}

export default function AdminSignInForm({
  onSuccess,
  onBackToMain,
  initialMode = 'signin',
  className = '',
  adminInviteCode,
  customInviteValidator
}: AdminSignInFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up State
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpInviteCode, setSignUpInviteCode] = useState('');

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Quick fill helper for testing demo credentials
  const handleFillDemoAdmin = () => {
    setSignInEmail('admin@dsp.com');
    setSignInPassword('password123');
    setErrorMessage(null);
  };

  // ============================================================================
  // 1. Unified Admin Sign In Handler (Linked to Supabase Auth & admin_profiles)
  // ============================================================================
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailTrimmed = signInEmail.trim().toLowerCase();
    const password = signInPassword;

    if (!emailTrimmed || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Step A: Demo bypass for offline / instant evaluation
      if (emailTrimmed === 'admin@dsp.com' && password === 'password123') {
        const demoProfile: AdminProfileRecord = {
          id: 'demo-super-admin-001',
          user_id: 'demo-super-admin-001',
          full_name: 'Super Administrator (DSP)',
          email: 'admin@dsp.com',
          role: 'super_admin',
          is_active: true
        };
        localStorage.setItem('dsp_simulated_admin', JSON.stringify(demoProfile));
        setSuccessMessage('Authenticated successfully. Redirecting to admin console...');
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(demoProfile);
          }
        }, 500);
        return;
      }

      // Step B: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password: password
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Invalid administrative credentials. Please verify email and password.');
      }

      const userId = authData.user.id;

      // Step C: Verify against `admin_profiles` table in Supabase
      const { data: profileByUserId, error: profileErr } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let profileData = profileByUserId;

      if (!profileData && !profileErr) {
        // Fallback query for schemas where id = user.id
        const { data: profileById } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        profileData = profileById;
      }

      // If user is authenticated in Supabase but not registered in admin_profiles
      if (!profileData) {
        // Check if user has admin metadata or register fallback
        if (authData.user.user_metadata?.role === 'admin' || authData.user.user_metadata?.role === 'super_admin') {
          profileData = {
            id: userId,
            user_id: userId,
            full_name: authData.user.user_metadata?.full_name || 'System Admin',
            email: authData.user.email || emailTrimmed,
            role: authData.user.user_metadata?.role || 'admin',
            is_active: true
          };
        } else {
          await supabase.auth.signOut();
          throw new Error('Access Denied: This account is not registered in the Admin Directory. Please request access.');
        }
      }

      // Verify active status
      if (!profileData.is_active) {
        await supabase.auth.signOut();
        throw new Error('Account Pending Approval: Your admin account is currently inactive (is_active = false). A Super Admin must approve your profile before you can log in.');
      }

      const validatedProfile: AdminProfileRecord = {
        id: profileData.id || userId,
        user_id: profileData.user_id || userId,
        full_name: profileData.full_name || 'Administrator',
        email: profileData.email || emailTrimmed,
        role: profileData.role || 'admin',
        is_active: true
      };

      // Persist active admin session state
      localStorage.setItem('dsp_simulated_admin', JSON.stringify(validatedProfile));
      setSuccessMessage(`Welcome back, ${validatedProfile.full_name}! Initializing administrative dashboard...`);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(validatedProfile);
        }
      }, 500);

    } catch (err: any) {
      console.error('[AdminSignInForm] Sign in error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 2. Admin Sign Up / Request Access Handler (Linked to Supabase Auth & admin_profiles)
  // ============================================================================
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullName = signUpFullName.trim();
    const email = signUpEmail.trim().toLowerCase();
    const password = signUpPassword;
    const confirmPassword = signUpConfirmPassword;
    const inviteCode = signUpInviteCode.trim();

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long for security compliance.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('The passwords entered do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Step A: Validate Security Invite Code if configured
      let isInviteValid = true;

      if (customInviteValidator) {
        isInviteValid = await customInviteValidator(inviteCode);
      } else if (inviteCode) {
        try {
          const response = await fetch('/api/admin/verify-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteCode })
          });
          if (response.ok) {
            const data = await response.json();
            isInviteValid = Boolean(data.valid);
          } else {
            isInviteValid = inviteCode.length >= 6;
          }
        } catch {
          isInviteValid = inviteCode.length >= 6;
        }
      } else {
        // Invite code is required for admin signup security
        isInviteValid = false;
        setErrorMessage('A valid Security Invite Code is required to register an administrative profile.');
        setIsLoading(false);
        return;
      }

      if (!isInviteValid) {
        throw new Error('Invalid Security Invite Code. Please obtain an authorization code from a Super Administrator.');
      }

      // Step B: Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          }
        }
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Unable to register administrative user with Supabase Auth.');
      }

      const userId = authData.user.id;

      // Step C: Insert Unapproved Profile into `admin_profiles` (is_active = false)
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert([
          {
            user_id: userId,
            full_name: fullName,
            email,
            role: 'admin',
            is_active: false // Inactive until approved by Super Admin
          }
        ]);

      if (profileError) {
        console.warn('[AdminSignInForm] Profile insert notification:', profileError.message);
      }

      // Sign out user immediately to ensure no unapproved sessions remain active
      await supabase.auth.signOut();

      // Step D: Show confirmation
      setSuccessMessage(
        'Access Request Submitted! Your account has been registered with Supabase Auth and is pending Super Admin review (is_active = false).'
      );

      // Reset signup fields
      setSignUpFullName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
      setSignUpInviteCode('');

    } catch (err: any) {
      console.error('[AdminSignInForm] Sign up error:', err);
      setErrorMessage(err.message || 'Registration failed. Please contact technical support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`} id="admin-signin-form-container">
      {/* Clean Modern Card with Plain Background */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Header Section */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Admin Console Sign In' : 'Request Admin Access'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signin' 
                ? 'Sign in with your administrative credentials' 
                : 'Register staff profile connected to Supabase'}
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mt-5 p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-xl text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mt-5 p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Mode: Sign In Form */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignInSubmit} className="mt-6 space-y-4.5" id="admin-signin-form">
            
            {/* Work Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-signin-email" 
                className="block text-xs font-semibold text-slate-700"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-signin-email"
                  type="email"
                  required
                  placeholder="admin@dsptalenthub.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="admin-signin-password" 
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-signin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Demo Helper */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 px-2.5 py-1 rounded-lg transition cursor-pointer"
                title="Fill quick demo Super Admin credentials"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Fill Demo Admin</span>
              </button>

              <span className="text-[11px] text-slate-400 font-mono">
                Supabase Auth RLS
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="admin-signin-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Mode: Sign Up / Request Access Form */
          <form onSubmit={handleSignUpSubmit} className="mt-6 space-y-4" id="admin-signup-form">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-signup-fullname" 
                className="block text-xs font-semibold text-slate-700"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-signup-fullname"
                  type="text"
                  required
                  placeholder="e.g. Elizabeth Vance"
                  value={signUpFullName}
                  onChange={(e) => setSignUpFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-signup-email" 
                className="block text-xs font-semibold text-slate-700"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-signup-email"
                  type="email"
                  required
                  placeholder="elizabeth@dsptalenthub.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-signup-password" 
                className="block text-xs font-semibold text-slate-700"
              >
                Create Password (Min 8 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-signup-confirm" 
                className="block text-xs font-semibold text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Invite Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="admin-signup-invite" 
                  className="block text-xs font-semibold text-slate-700"
                >
                  Security Invite Code
                </label>
                <span className="text-[10px] text-emerald-600 font-medium">
                  Required
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-signup-invite"
                  type="text"
                  required
                  placeholder="e.g. ADMIN_SECRET_2026"
                  value={signUpInviteCode}
                  onChange={(e) => setSignUpInviteCode(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 flex items-start gap-1 pt-0.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Provided by your Super Administrator or system security team.</span>
              </p>
            </div>

            {/* Submit Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="admin-signup-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <span>Submit Admin Access Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Subtle Sign Up / Sign In Toggle Link (Connected to Supabase) */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-500">
              New staff member or auditor?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition cursor-pointer inline-flex items-center gap-0.5"
                id="toggle-to-signup-btn"
              >
                <span>Request access / Sign up</span>
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Already possess administrative credentials?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition cursor-pointer inline-flex items-center gap-0.5"
                id="toggle-to-signin-btn"
              >
                <span>Back to Sign In</span>
              </button>
            </p>
          )}

          {onBackToMain && (
            <div>
              <button
                type="button"
                onClick={onBackToMain}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-medium transition cursor-pointer"
              >
                ← Return to Public Directory
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
