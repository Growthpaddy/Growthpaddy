DIGITAL CAMPUX / GROWTHPADDY — FOUNDER ACCOUNT APPROVAL PATCH

WHAT THIS ADDS
- Adds a Founder Accounts section to the existing Admin Console sidebar.
- Lists registered founder accounts from public.founder_profiles.
- Shows pending, approved, rejected and suspended account states.
- Allows an active Administrator to Approve, Reject, Suspend and Restore an account.
- Searches by founder name, email, business name or location.
- Records status actions using the existing audit logger.
- Prevents a founder from changing their own profile_status through the normal authenticated database session.
- Blocks pending, rejected and suspended founder accounts from signing in to the workspace.
- Ensures new founder registrations are only marked successful after both a real Auth user and founder_profiles row are saved.
- Verifies founder account approval again when the founder workspace loads.

FILES
1. src/pages/admin/AdminDashboard.tsx (updated)
2. src/components/admin/FounderManagementPanel.tsx (new)
3. src/lib/founderAuth.ts (updated)
4. src/pages/founders/FounderDashboard.tsx (updated)
5. server.ts (updated)
6. supabase/migrations/20261108150000_founder_account_approval_guard.sql (new)

INSTALLATION
1. Back up your current project or commit your current work in Git.
2. Extract the patch ZIP into the Growthpaddy project root and allow the listed files to merge/replace.
3. Open Supabase SQL Editor and run the migration file:
   supabase/migrations/20261108150000_founder_account_approval_guard.sql
4. Run `npm run build` locally.
5. Commit and push the changes to GitHub. Vercel should deploy from the connected branch.
6. Sign in to the Admin Console and select Founder Accounts.

IMPORTANT SCOPE NOTE
This panel manages registered founder accounts in public.founder_profiles. It does not display the separate public community intake submissions stored in public.founder_applications. Those are a different workflow and can be added as a separate Applications queue if required.

The panel uses the existing founder_profiles administrator SELECT/UPDATE RLS policies. It assumes those policies continue to use public.is_active_admin() for administrator access. Do not disable RLS.
