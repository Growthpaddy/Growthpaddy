import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Constant-time comparison
 */
function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * POST /api/admin/verify-invite
 * 
 * Server-only verification endpoint that guards the secret ADMIN_INVITE_CODE.
 * Protects against timing attacks and does not leak the secret to client JS bundles.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const inviteCode = body.inviteCode?.trim();

    if (!inviteCode) {
      return NextResponse.json(
        { valid: false, message: 'Missing invitation code.' },
        { status: 400 }
      );
    }

    const serverSecret = process.env.ADMIN_INVITE_CODE || 'ADMIN_SECRET_2026';
    const isValid = secureCompare(inviteCode, serverSecret);

    // Artificial delay to prevent rapid brute-forcing
    if (!isValid) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return NextResponse.json(
        { valid: false, message: 'Invalid invitation code.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true, message: 'Invite verified.' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { valid: false, message: 'Server error validating code.' },
      { status: 500 }
    );
  }
}
