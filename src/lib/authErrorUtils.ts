/**
 * Utility functions for safely extracting error messages and granular error codes
 * from Supabase Auth & PostgreSQL responses.
 * Prevents non-enumerable Error instances from serializing to `{}`.
 */

export interface GranularAuthError {
  code: string;
  rawMessage: string;
  userFriendlyMessage: string;
  status?: number;
}

export function parseGranularAuthError(err: any): GranularAuthError {
  if (!err) {
    return {
      code: 'unknown_error',
      rawMessage: 'Unknown error occurred',
      userFriendlyMessage: 'Authentication failed. Please verify your credentials and try again.'
    };
  }

  // 1. Extract error code from various potential locations
  const code = (
    err.code || 
    err.error_code || 
    err.error?.code || 
    err.status_code || 
    (typeof err.status === 'string' ? err.status : '') ||
    ''
  ).toString().toLowerCase().trim();

  // 2. Extract raw message
  let rawMessage = '';
  if (typeof err === 'string') {
    rawMessage = err;
  } else if (err.message && typeof err.message === 'string') {
    rawMessage = err.message;
  } else if (err.error_description && typeof err.error_description === 'string') {
    rawMessage = err.error_description;
  } else if (err.error?.message && typeof err.error.message === 'string') {
    rawMessage = err.error.message;
  } else {
    try {
      const propNames = Object.getOwnPropertyNames(err);
      for (const prop of propNames) {
        if (prop === 'stack') continue;
        const val = err[prop];
        if (typeof val === 'string' && val.trim() && val !== '{}' && val !== '[object Object]') {
          rawMessage = val.trim();
          break;
        }
      }
    } catch (_) {}
  }

  const rawLower = rawMessage.toLowerCase();
  const status = typeof err.status === 'number' ? err.status : undefined;

  // 3. Map granular error codes & patterns to clear user-friendly scenarios
  let userFriendlyMessage = rawMessage || 'Authentication encountered an issue. Please try again.';

  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    rawLower.includes('invalid login credentials') ||
    rawLower.includes('invalid credentials') ||
    rawLower.includes('invalid password') ||
    rawLower.includes('wrong password')
  ) {
    return {
      code: 'invalid_credentials',
      rawMessage,
      userFriendlyMessage: 'Invalid email or password. Please verify your credentials and try again.',
      status: 400
    };
  }

  if (
    rawLower.includes('unexpected end of json input') ||
    rawLower.includes('syntaxerror') ||
    rawLower.includes('failed to parse json') ||
    rawLower.includes('json.parse')
  ) {
    return {
      code: 'network_session_error',
      rawMessage,
      userFriendlyMessage: 'Authentication connection was interrupted. Please check your connection and try logging in again.',
      status: 500
    };
  }

  if (
    code === 'weak_password' || 
    code === 'password_too_short' ||
    rawLower.includes('password should be at least') || 
    rawLower.includes('weak password') ||
    rawLower.includes('password must be at least')
  ) {
    return {
      code: 'weak_password',
      rawMessage,
      userFriendlyMessage: 'Password is too weak. Please provide a password with at least 6 characters, combining letters and numbers.',
      status
    };
  }

  if (
    code === 'email_exists' || 
    code === 'user_already_exists' || 
    code === '23505' || 
    rawLower.includes('already registered') || 
    rawLower.includes('already in use') || 
    rawLower.includes('user already exists') ||
    rawLower.includes('already exists')
  ) {
    return {
      code: 'email_exists',
      rawMessage,
      userFriendlyMessage: 'An account with this email address already exists. Please log in or use a different email address.',
      status
    };
  }

  if (
    code === 'invalid_email' || 
    code === 'email_address_invalid' || 
    code === 'validation_failed' ||
    rawLower.includes('valid email') || 
    rawLower.includes('invalid email')
  ) {
    return {
      code: 'invalid_email',
      rawMessage,
      userFriendlyMessage: 'The email address provided is invalid. Please check the spelling and try again.',
      status
    };
  }

  if (
    code === 'over_request_rate_limit' || 
    code === 'rate_limit_exceeded' || 
    status === 429 ||
    rawLower.includes('rate limit') || 
    rawLower.includes('too many requests')
  ) {
    return {
      code: 'over_request_rate_limit',
      rawMessage,
      userFriendlyMessage: 'Too many registration requests in a short time. Please wait 60 seconds before trying again.',
      status: 429
    };
  }

  if (
    code === 'signup_disabled' || 
    code === 'signups_not_allowed' || 
    rawLower.includes('signup is disabled') || 
    rawLower.includes('signups not allowed')
  ) {
    return {
      code: 'signup_disabled',
      rawMessage,
      userFriendlyMessage: 'New recruiter signups are currently paused in your Supabase project. Enable Email Signups in the Supabase Dashboard under Authentication -> Providers.',
      status
    };
  }

  if (
    code === 'pgrst202' || 
    rawLower.includes('function') && rawLower.includes('not found')
  ) {
    return {
      code: 'pgrst202',
      rawMessage,
      userFriendlyMessage: 'Database setup note: The signup_recruiter RPC function is missing. Please run the migration SQL in your Supabase SQL editor.',
      status
    };
  }

  if (
    code === '42p01' || 
    rawLower.includes('relation "public.recruiters" does not exist')
  ) {
    return {
      code: '42p01',
      rawMessage,
      userFriendlyMessage: 'Database table missing: The recruiters table does not exist. Please run the migration SQL to create the table and RLS policies.',
      status
    };
  }

  if (
    code === '42501' || 
    code === 'pgrst301' || 
    rawLower.includes('permission denied') || 
    rawLower.includes('violates row-level security')
  ) {
    return {
      code: 'rls_violation',
      rawMessage,
      userFriendlyMessage: 'Security Policy Notice: The request violated Supabase Row-Level Security. Please verify your RLS policies on public.recruiters.',
      status
    };
  }

  // Fallback check on HTTP status
  if (status === 400 && !rawMessage) {
    userFriendlyMessage = 'Invalid input parameters. Please ensure your email and password meet the requirements.';
  } else if (status === 500 && !rawMessage) {
    userFriendlyMessage = 'Supabase internal error (500). Please check your database triggers and migration scripts.';
  }

  return {
    code: code || 'auth_error',
    rawMessage,
    userFriendlyMessage,
    status
  };
}

export function extractAuthErrorMessage(err: any, fallback = 'Authentication failed. Please verify your credentials.'): string {
  if (!err) return fallback;
  const parsed = parseGranularAuthError(err);
  return parsed.userFriendlyMessage || parsed.rawMessage || fallback;
}
