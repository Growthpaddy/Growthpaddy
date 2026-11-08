# Growthpaddy — Founder directory and floating dashboard shortcut

This is an overlay patch for the existing Growthpaddy repository. It does not replace the project or touch `.env` files.

## Included behaviour

- An approved founder with an active Supabase Auth session sees a floating avatar shortcut on other pages. Clicking it returns to `/founders/overview`.
- The shortcut is hidden inside founder login, registration and workspace routes.
- Founder sign-out now returns the browser to `/` (the homepage).
- `/founders` displays approved public founder profiles from `public.founder_profiles_public`.
- The directory shows 10 profiles per page in a responsive two-column grid on desktop; Next/Previous controls appear when pagination is needed.
- The top spotlight displays exactly two founders selected for the current week.
- An active admin signed into Supabase sees controls on `/founders` to select and publish the two weekly founders.
- Pending, rejected and suspended applications are not exposed in the public directory.

## Apply the source patch

1. Back up or commit your current project before applying this patch.
2. Extract this ZIP into `C:\Users\HP\Documents\Growthpaddy`, preserving folders and allowing matching files to be overwritten.
3. In the project terminal run:

   ```powershell
   npm.cmd run lint
   npm.cmd run build
   ```

## Apply the Supabase migration

Apply `supabase/migrations/20261107190000_founder_directory_and_weekly_features.sql` to the same Supabase project used by `VITE_SUPABASE_URL`.

The migration:
- Extends the existing `founder_profiles_public` view with approved founders' public-facing headline, bio, avatar, slug and location fields. It does not expose email or account status.
- Creates the weekly feature table and a public view restricted to the current week in the Africa/Lagos timezone.
- Adds an administrator-only RPC, `set_founder_weekly_features`, which validates that two different selected profiles are approved and updates both weekly slots atomically.
- Does not create sample founders or delete founder profile records.

The existing profile migrations and `public.is_active_admin()` function must already be applied. The weekly feature management controls are shown only when the app's current admin profile is active; the SQL RPC independently verifies `public.is_active_admin()` so UI visibility is not a security boundary.

## Verification

1. Visit `/founders` while signed out and confirm only approved founder profiles appear.
2. Confirm 10 profiles maximum appear on each page and pagination appears only when more than 10 approved profiles exist.
3. Sign in as an active administrator, visit `/founders`, select two different approved profiles and publish them. Confirm both larger spotlight cards appear for the current week.
4. Sign in as an approved founder, navigate to another public page, and confirm the floating avatar appears. Click it and confirm it returns to `/founders/overview`.
5. Sign out from the founder workspace and confirm the browser redirects to `/`.

The source files were syntax-transpiled during patch preparation. Run the full TypeScript and production build checks in your local project before committing.
