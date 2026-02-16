# investing-tips

Interactive GitHub Pages web app for generating projected ASX investment tips.

## What it does
- Shows a **Generate Tips** button on load.
- Analyses a broad list of ASX companies (excluding airlines, hospitality, fast food and ETFs).
- Uses a blend of:
  - recent price performance (momentum),
  - public sentiment proxy signals (news/blog),
  - report-style weighting.
- Outputs **3 strong buy ideas** with projected sell values for a **$500 investment** at 3, 6, 9 and 12 months.

> Projections are estimates and not guarantees or financial advice.

## Local run
```bash
npm test
npm run start
```
Then open http://localhost:4173.

## GitHub Pages
A workflow is included at `.github/workflows/deploy-pages.yml`.
To publish:
1. Push to `main`.
2. In GitHub repo settings, ensure Pages source is **GitHub Actions**.
