/**
 * Utility functions for safely extracting error messages from Supabase Auth & PostgreSQL responses.
 * Prevents non-enumerable Error instances from serializing to `{}`.
 */

export function extractAuthErrorMessage(err: any, fallback = 'Authentication failed. Please verify your credentials.'): string {
  if (!err) return fallback;

  // If already a readable string
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (trimmed && trimmed !== '{}' && trimmed !== '[object Object]') {
      return trimmed;
    }
  }

  // Check common error message properties
  if (typeof err.message === 'string' && err.message.trim() && err.message !== '{}' && err.message !== '[object Object]') {
    // Check for common Supabase messages and format user-friendly
    const msg = err.message.trim();
    if (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('already exists')) {
      return 'An account with this email address already exists. Please sign in instead.';
    }
    if (msg.toLowerCase().includes('signup is disabled') || msg.toLowerCase().includes('signups not allowed')) {
      return 'User registration is currently disabled in your Supabase project. Enable Email Signups in the Supabase Dashboard.';
    }
    if (msg.toLowerCase().includes('database error saving new user')) {
      return 'Database trigger error in Supabase. Please run the provided SQL setup script to configure triggers and permissions.';
    }
    return msg;
  }

  if (typeof err.error_description === 'string' && err.error_description.trim()) {
    return err.error_description.trim();
  }

  if (typeof err.msg === 'string' && err.msg.trim()) {
    return err.msg.trim();
  }

  if (typeof err.description === 'string' && err.description.trim()) {
    return err.description.trim();
  }

  if (err.error?.message && typeof err.error.message === 'string' && err.error.message.trim()) {
    return err.error.message.trim();
  }

  // Non-enumerable properties on native Error instances
  try {
    const propNames = Object.getOwnPropertyNames(err);
    for (const prop of propNames) {
      if (prop === 'stack') continue;
      const val = err[prop];
      if (typeof val === 'string' && val.trim() && val !== '{}' && val !== '[object Object]') {
        return val.trim();
      }
    }
  } catch (_) {}

  // HTTP status codes
  if (err.status) {
    if (err.status === 429) return 'Too many registration requests. Please wait a moment before trying again.';
    if (err.status === 400) return 'Invalid credentials provided. Please ensure password is at least 6 characters.';
    if (err.status === 500) return 'Supabase server error (500). Please run the database migration SQL to resolve trigger errors.';
    return `Authentication request failed with status code ${err.status}.`;
  }

  return fallback;
}
