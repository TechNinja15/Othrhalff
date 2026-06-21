# Othrhalff Project Rules and Database Reference

This file contains behavioral constraints and reference information for the Othrhalff codebase, database, and migration details.

## 1. Project Reference Keys
- **Old Supabase Project ID:** `htepqqigtzmllailykas`
- **New Supabase Project ID:** `cthyiegohnvqtepzoqjf`
- **Rule:** When updating environment configurations, preserve the old project URLs and anon/service keys by commenting them out at the bottom of the `.env` files. Do not delete them.

## 2. Database Migration Cheatsheet
When executing queries or data transfers between the environments:
- **Pagination Limit:** Supabase's PostgREST API restricts SELECT results to 1,000 rows by default. To dump or select large tables (like `swipes` or `notifications`), use offset-based pagination in a loop (`limit=1000&offset=N`) to avoid silent truncation.
- **Orphaned Row Handling:** Pre-filter foreign key relationships (e.g., `user_id` in `notifications`) to exclude records pointing to non-existent profiles, avoiding constraint errors during batch insertion.
- **Dashboard Visibility:** Any directly inserted user in `auth.users` must have their `instance_id` column explicitly set to `'00000000-0000-0000-0000-000000000000'` (all zeros) for the Supabase Auth Dashboard to index and display them.

## 3. General constraints
- **Emojis:** Do not write emojis in code, commits, pull requests, comments, or logs.
- **Workspace cleanliness:**
  - Database JSON backups must reside in `db_backup/`, which is ignored by Git.
  - Custom assets must reside in `othrhalff_assets/` (using underscores instead of spaces to avoid shell scripting path escape errors).
  - Use the utility script at `db_backup/scripts/dump_schema.cjs` to refresh the database schema reference in `db infra.ignore` when schema changes occur.

## 4. Architecture & Design Decisions

### ForceLogoutCountdown
- The `ForceLogoutCountdown` component is **intentionally triggered on post-deploy** to force users to reload and receive the latest features. It is NOT a security logout.
- Copy must reflect this: title "New Update Available", not "Session Expired" or anything security-related.
- After the countdown completes, `AuthContext.handleCountdownComplete` navigates to `/login` via `router.push('/login')` so users are not stranded on a protected route.

### Presence System
- The keepalive beacon in `PresenceContext.tsx` (`handleBeforeUnload`) uses a hardcoded localStorage key to extract the auth token. This key must always match the **new** Supabase project: `sb-cthyiegohnvqtepzoqjf-auth-token`. Do not revert to the old key `sb-htepqqigtzmllailykas-auth-token`.
- `user_presence` RLS uses **separate INSERT and UPDATE policies** (not a single ALL policy) to avoid 42501 USING expression errors on upsert.

### University Matching
- University strings in `profiles` are stored with city suffixes (e.g. `"Amity University, Raipur"`). All campus-mode matching must use `LOWER(TRIM(split_part(university, ',', 1)))` to normalize before comparison.
- The functional index `idx_profiles_university_clean` exists on `profiles` for this exact expression. Do not bypass it with raw equality checks.
- Both `get_potential_matches` and `get_skipped_profiles` RPCs use this logic. Keep them in sync if either is modified.

### Pagination & Random Ordering
- `get_potential_matches` uses `ORDER BY random()`. Combining this with `OFFSET`-based pagination causes duplicates and skipped rows across pages because the shuffle changes on every call.
- If infinite scroll / "load more" is ever implemented, switch to a **seeded random** (pass a per-session seed from the client, call `SELECT setseed(seed)` before the query) or a stable cursor-based sort instead.

## 5. Known Security Debt

### get_skipped_profiles SECURITY DEFINER vulnerability
- **Issue:** `get_skipped_profiles` is `SECURITY DEFINER` (bypasses RLS) and accepts `current_user_id` as a client-supplied parameter. Any authenticated user can pass a foreign UUID and read another user's skipped profile list.
- **Why deferred:** UUIDs are not exposed in the client, so exploitation requires knowing a victim's UUID first. Low practical risk for now.
- **Fix when ready:** Add `AND auth.uid() = current_user_id` inside the function body, OR drop `SECURITY DEFINER` and let RLS handle it like `get_potential_matches` does.
