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

## GitHub Pages (required settings)
A workflow is included at `.github/workflows/deploy-pages.yml`.

### 1) Required repo settings
In **GitHub → Settings → Pages**:
- **Build and deployment / Source**: set to **GitHub Actions**.

In **GitHub → Settings → Actions → General**:
- Workflow permissions should allow deployment using the provided Pages actions.

### 2) Required branch flow
- The workflow deploys on pushes to **`main`**.
- If you are developing on another branch (e.g. `work`), merge to `main` to publish.

### 3) Expected Pages URL
After first successful deployment, the URL should be:
- Project site (most common): `https://<OWNER>.github.io/investing-tips/`
- User/Org site (only if repo is literally `<OWNER>.github.io`): `https://<OWNER>.github.io/`

You can also confirm the exact live URL from:
- the workflow run output (`deploy-pages` step), or
- **Settings → Pages** where GitHub shows the published address.
