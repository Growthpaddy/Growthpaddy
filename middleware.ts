import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware Route Protection Layer
 * 
 * Secures all `/admin/*` routes (except `/admin/login` and public auth assets)
 * Verifies Supabase session and ensures the user exists in `admin_profiles` with `is_active = true`.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip non-admin routes and the explicit admin login/auth page
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname === '/admin/login' || pathname.startsWith('/admin/auth');

  if (!isAdminRoute || isAuthRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase environment is not configured, redirect to login with config warning
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'configuration_missing');
    return NextResponse.redirect(loginUrl);
  }

  // 2. Instantiate Supabase Server Client with Cookie Handlers
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // 3. Retrieve authenticated user session safely
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized');
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Query `admin_profiles` to verify is_active = true
  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, role, is_active')
    .eq('user_id', user.id)
    .maybeSingle();

  // If profile not found or database error
  if (profileError || !profile) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'not_an_admin');
    return NextResponse.redirect(loginUrl);
  }

  // Check if admin is active
  if (!profile.is_active) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'account_pending_approval');
    return NextResponse.redirect(loginUrl);
  }

  // 5. Special check for Super Admin exclusive routes (e.g. /admin/approvals)
  if (pathname.startsWith('/admin/approvals') && profile.role !== 'super_admin') {
    const dashboardUrl = new URL('/admin', request.url);
    dashboardUrl.searchParams.set('error', 'super_admin_required');
    return NextResponse.redirect(dashboardUrl);
  }

  // 6. User is authenticated and active admin
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths starting with /admin
     * Exclude static files, _next, favicon.ico, and images
     */
    '/admin/:path*',
  ],
};
