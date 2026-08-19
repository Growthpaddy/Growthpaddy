'use client';

import React from 'react';
import { X } from 'lucide-react';
import AdminSignInForm, { AdminProfileRecord } from './AdminSignInForm';

export type { AdminRole, AdminProfileRecord } from './AdminSignInForm';

export interface AdminAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (adminProfile: AdminProfileRecord) => void;
  initialView?: 'signin' | 'signup';
  adminInviteCode?: string;
  customInviteValidator?: (code: string) => Promise<boolean> | boolean;
}

/**
 * Unified Modern Admin Auth Modal
 * Renders the clean, plain-background AdminSignInForm inside a light backdrop overlay.
 */
export default function AdminAuthModal({
  isOpen = true,
  onClose,
  onSuccess,
  initialView = 'signin',
  adminInviteCode,
  customInviteValidator
}: AdminAuthModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fadeIn"
      id="admin-auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md animate-scaleIn">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <AdminSignInForm
          initialMode={initialView}
          onSuccess={(profile) => {
            if (onSuccess) {
              onSuccess(profile);
            }
            if (onClose) {
              onClose();
            }
          }}
          onBackToMain={onClose}
          adminInviteCode={adminInviteCode}
          customInviteValidator={customInviteValidator}
        />
      </div>
    </div>
  );
}
