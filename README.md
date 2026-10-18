# MyMathSteps

MyMathSteps is a parent-focused math assessment and improvement portal for middle school students. The prototype focuses on identifying learning gaps, translating assessment scores into specific skill recommendations, and helping parents understand what their child should practice next.

## Product concept

Mathematics is cumulative. Students often appear to be doing fine in class while still missing foundational skills that affect later success in algebra and more advanced math. MyMathSteps helps reveal those gaps early by combining:

- skill-based assessments
- clear parent-facing reporting
- targeted learning recommendations
- progress tracking over time

## Current prototype

This repository contains a working front-end prototype of the portal, including:

- a landing page and portal-style UI
- a student assessment flow
- topic-based scoring
- personalized next-step recommendations
- a parent dashboard summary

## Tech stack

- React
- Vite
- CSS modules / custom styling

## Local development

From the project directory:

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

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
6. deployment for a real mymathsteps.com product experience

## Repository status

This repo is the current working prototype for the MyMathSteps concept and is intended to evolve into a full SaaS product.
