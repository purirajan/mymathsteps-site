# MyMathSteps

MyMathSteps is a parent-focused math assessment and improvement portal for middle school students. The prototype focuses on identifying learning gaps, translating assessment scores into specific skill recommendations, and helping parents understand what their child should practice next.

## Product concept

Mathematics is cumulative. Students often appear to be doing fine in class while still missing foundational skills that affect later success in algebra and more advanced math. MyMathSteps helps reveal those gaps early by combining:

- skill-based assessments
- clear parent-facing reporting
- targeted learning recommendations
- progress tracking over time

## Current prototype

This project contains the public-facing MyMathSteps homepage and a transparent assessment entry page. The interactive math check-in, student accounts, database, and saved progress are not implemented yet.

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

The website-only repository deploys through the GitHub Actions workflow in `.github/workflows/deploy-pages.yml`. The production custom domain is declared in `public/CNAME`.

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
6. implement the assessment flow after product, privacy, and child-data requirements are defined

## Repository status

This repo is the current working prototype for the MyMathSteps concept and is intended to evolve into a full SaaS product.
