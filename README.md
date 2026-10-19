# MyMathSteps

MyMathSteps is a parent-focused math assessment and improvement portal for middle school students. The prototype focuses on identifying learning gaps, translating assessment scores into specific skill recommendations, and helping parents understand what their child should practice next.

## Product concept

Mathematics is cumulative. Students often appear to be doing fine in class while still missing foundational skills that affect later success in algebra and more advanced math. MyMathSteps helps reveal those gaps early by combining:

- skill-based assessments
- clear parent-facing reporting
- targeted learning recommendations
- progress tracking over time

## Current prototype

This project contains the public-facing MyMathSteps homepage, parent account UI, parent-managed child profiles, and Grade 6/Grade 7 syllabus-informed Math Readiness Check-ins. Each check-in includes one representative question per major area in the supplied syllabus. Answers and results exist only in page memory and reset when the page is refreshed or closed. This is not a diagnostic or validated standardized test, nor a formal Common Core or state standards crosswalk. The source outline is saved in `../Grade_6-7_Mathematics_Syllabus.txt`.

Parent login and child profiles use Supabase Auth and row-level-secured tables; they remain inactive until a Supabase project is configured. PayPal Checkout is prepared for $4.99 once per child and grade, with retakes included; Venmo can appear through PayPal for eligible US transactions. Payment requires Supabase Edge Function secrets and deployment. The client never writes purchase entitlements. Grade 8 check-ins are unavailable until that syllabus and question set are added.

### Account data and storage

- Supabase Auth manages the parent email and password (the app does not store the password).
- Supabase `child_profiles` stores only a parent ID, nickname, grade, and creation time. Use a nickname, not a child's legal name or school details.
- Supabase `test_entitlements` stores the child/grade purchase entitlement and PayPal order/capture IDs. These tables are protected by row-level security; entitlement writes are server-only.
- The current browser session token is held in `sessionStorage` and expires with the browser session. Do not collect or store assessment answers; the current check-in keeps answers in page memory only.
- Do not enter real child data until an accurate privacy notice, parental-consent flow, security review, and applicable child-privacy requirements have been addressed.

## Tech stack

- React
- Vite
- CSS modules / custom styling

## Local development

From the project directory:

```bash
pnpm install
pnpm dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
pnpm build
```

## GitHub Pages deployment

The website-only repository deploys through the GitHub Actions workflow in `.github/workflows/deploy-pages.yml`. The production custom domain is declared in the root `CNAME` file and copied into the build output.

## Parent accounts and payments

See `supabase/README.md` for Supabase Auth setup, database migration, and PayPal/Venmo sandbox setup. Do not use real child identifiers in the prototype. Review privacy, parental-consent, standards mapping, and payment policies before enabling live purchases.

## Project structure

```bash
mathpath-platform/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Roadmap

Planned next steps include:

1. student login and parent accounts
2. real assessment question banks
3. saved progress and historical reporting
4. practice lesson content tied to skill gaps
5. exportable parent reports
6. expand and review the question bank after product, privacy, and child-data requirements are defined

## Repository status

This repo is the current working prototype for the MyMathSteps concept and is intended to evolve into a full SaaS product.
