# MyMathSteps

MyMathSteps is a parent-focused math assessment and improvement portal for middle school students. The prototype focuses on identifying learning gaps, translating assessment scores into specific skill recommendations, and helping parents understand what their child should practice next.

## Product concept

Mathematics is cumulative. Students often appear to be doing fine in class while still missing foundational skills that affect later success in algebra and more advanced math. MyMathSteps helps reveal those gaps early by combining:

- skill-based assessments
- clear parent-facing reporting
- targeted learning recommendations
- progress tracking over time

## Current prototype

This project contains the public-facing MyMathSteps homepage and free Grade 6/Grade 7 syllabus-informed Math Readiness Check-ins. Each check-in includes one representative question per major area in the supplied topic outlines and ends with a printable MyMathSteps summary card. Answers and results exist only in page memory and reset when the page is refreshed or closed. Check-ins require no login and do not collect personal information. This is not a diagnostic or validated standardized test, nor a formal Common Core or state standards crosswalk.

Parent accounts, child profiles, and payment code are dormant future scaffolding and are not part of the public check-in flow. No checkout is shown and no payments are taken. Grade 8 check-ins are unavailable until that syllabus and question set are added.

### Data and privacy

The free check-in stores answers only in page memory; it does not collect logins, child profiles, or assessment results. The Supabase and PayPal/Venmo files are retained as inactive scaffolding only. Do not activate data collection or payment until privacy, parental consent, security, standards validation, and applicable child-privacy requirements have been reviewed.

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

## Future account/payment scaffolding

Supabase and PayPal/Venmo setup notes are for possible future work only; they are not needed to use the free check-ins. Do not configure live payment or collect child data from this scaffold yet.

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
