# Supabase setup for parent accounts

1. Create a Supabase project and keep its service-role key private.
2. In the Supabase SQL editor, run `migrations/202610180001_family_profiles.sql`.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the Supabase project API settings.
4. In Supabase Auth settings, enable email confirmation and configure the site's redirect URLs.
5. Restart the Vite development server after editing `.env.local`.

The browser uses only the public anon key and the signed-in user's access token. Row Level Security limits child profiles and visible entitlements to the owning parent. Never put a Supabase service-role key or PayPal client secret in a `VITE_` variable.

## Data and consent safeguards

Child profile records contain only a parent-selected nickname and grade. Do not add a child's full name, birth date, school, email, or other identifiers without a privacy/legal review and appropriate parental consent. These implementation notes do not establish COPPA compliance.

The parent email/password are managed by Supabase Auth; this app does not store the password. The current parent access/refresh tokens are held in browser `sessionStorage` and are removed on sign-out or when the browser session ends. `child_profiles` stores the parent user ID, nickname, grade, and creation time. `test_entitlements` stores the parent/child/grade relationship, fixed amount and currency, PayPal order/capture IDs, and purchase time. The current assessment answers remain in React page memory only and are not written to Supabase.

## PayPal/Venmo purchase flow

PayPal Checkout is the selected processor; Venmo is requested as an alternate funding source and may appear for eligible US merchant/buyer sessions. The client-side amount is informational only. The Edge Function `functions/paypal-checkout` fixes and verifies USD 4.99, authenticates the parent, checks child ownership and grade, and writes the entitlement only after a completed PayPal capture. The `test_entitlements` and `test_checkout_attempts` tables have no client write policies.

To deploy checkout:

1. Create a PayPal Business account and a PayPal Developer app. Start with sandbox credentials.
2. Set Supabase Edge Function secrets `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENVIRONMENT=sandbox`, and `APP_ALLOWED_ORIGIN=https://mymathsteps.com`. Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions.
3. Deploy the `paypal-checkout` function from the Supabase project root.
4. Set the public PayPal client ID as `VITE_PAYPAL_CLIENT_ID` in `.env.local` for local testing and in the website host's build environment. Never put the PayPal secret or Supabase service-role key in a `VITE_` variable.
5. Test successful, cancelled, declined, repeated, and expired checkouts in PayPal sandbox before considering live mode.

The payment entitlement covers one child and one grade; retakes are included. This check-in is still a syllabus-informed practice snapshot, not a validated standardized test. Do not market it as standardized or enable live charges until the assessment, standards mapping, privacy/consent flow, and policies have been reviewed.
