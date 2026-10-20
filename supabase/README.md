# Inactive future scaffold: parent accounts and payments

The current public launch uses free Grade 6 and Grade 7 check-ins without requiring accounts. This Supabase schema and PayPal/Venmo function are not configured or used by the live check-in. No payments are taken. Do not deploy these services or collect child data until privacy, parental-consent, security, assessment-validation, and business decisions are complete.

1. Create a Supabase project and keep its service-role key private.
2. In the Supabase SQL editor, run `migrations/202610180001_family_profiles.sql`.
3. In Supabase Auth → URL Configuration, set the site URL to `https://mymathsteps.com` and add `https://mymathsteps.com/account/` to allowed redirect URLs. Keep email confirmation enabled.
4. In the public `mymathsteps-site` repository, open Settings → Secrets and variables → Actions → New repository secret. Add `VITE_SUPABASE_URL` (Supabase Project URL) and `VITE_SUPABASE_ANON_KEY` (the publishable/anon key). These two values are intentionally public browser configuration, not service-role secrets.
5. To enable payment buttons too, add `VITE_PAYPAL_CLIENT_ID` using your PayPal sandbox app client ID. Do not add `PAYPAL_CLIENT_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` as `VITE_` variables or expose them in a static-site workflow.
6. Push a change to the website repo or manually run Actions → Deploy MyMathSteps site to GitHub Pages → Run workflow. Confirm the deployment succeeds, then reload `/account/`.
7. For local development only, copy `.env.example` to `.env.local`, enter the same public Supabase values, and restart Vite.

The browser uses only the public anon key and the signed-in user's access token. Row Level Security limits child profiles and visible entitlements to the owning parent. Never put a Supabase service-role key or PayPal client secret in a `VITE_` variable.

## Data and consent safeguards

Child profile records contain only a parent-selected nickname and grade. Do not add a child's full name, birth date, school, email, or other identifiers without a privacy/legal review and appropriate parental consent. These implementation notes do not establish COPPA compliance.

The parent email/password are managed by Supabase Auth; this app does not store the password. The current parent access/refresh tokens are held in browser `sessionStorage` and are removed on sign-out or when the browser session ends. `child_profiles` stores the parent user ID, nickname, grade, and creation time. `test_entitlements` stores the parent/child/grade relationship, fixed amount and currency, PayPal order/capture IDs, and purchase time. The current assessment answers remain in React page memory only and are not written to Supabase.

## Deferred PayPal/Venmo payment scaffold

The following describes dormant, unconfigured code only. There is no price shown in the live experience, no checkout button, and no active payment processing. If payments are considered later, first revisit pricing, policies, and consent. The code currently demonstrates server-side PayPal order/capture with Venmo funding where eligible; the client does not write entitlements.

Do not deploy this checkout during the free launch. If deliberately approved in a later phase, the old test setup notes are:

1. Create a PayPal Business account and a PayPal Developer app. Start with sandbox credentials.
2. Set Supabase Edge Function secrets `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENVIRONMENT=sandbox`, and `APP_ALLOWED_ORIGIN=https://mymathsteps.com`. Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions.
3. Deploy the `paypal-checkout` function from the Supabase project root.
4. Set the public PayPal client ID as `VITE_PAYPAL_CLIENT_ID` in `.env.local` for local testing and in the website host's build environment. Never put the PayPal secret or Supabase service-role key in a `VITE_` variable.
5. Test successful, cancelled, declined, repeated, and expired checkouts in PayPal sandbox before considering live mode.

The check-in is a syllabus-informed practice snapshot, not a validated standardized test. Do not market it as standardized or enable live charges until assessment validation, standards mapping, privacy/consent flow, and applicable policies have been reviewed.
