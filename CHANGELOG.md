# CHANGELOG

All notable changes to this project will be documented in this file.

## 0.2.0 - Automated Ingestion & Explorer Overhaul
- Added `scripts/ingest.js` (`npm run ingest`): automated `excel-ingest` pipeline converting `.xlsx` sheets to structured JSON in `public/data/records/` and synchronizing `public/data/files.json`.
- Added `scripts/bench_analyzer.js` (`npm run analyze`): variance & regression analyzer comparing benchmark runs and emitting reports to `docs/reports/`.
- Enhanced React UI in `src/App.jsx`:
  - Multi-sheet tab bar navigation for switching between sheets in any workbook.
  - Formatted data tables with header recognition, row numbering, status badge highlighting, and within-sheet row filtering.
  - Interactive tag chip filter bar with counts and quick clear.
  - Structured JSON record viewer mode.
  - Relative URL resolution supporting subpath hosting on GitHub Pages.
- Added realistic benchmark datasets for the 5-GPU server configuration (`GTX 1070 + 2× P104-100 + P106-100 + Intel iGPU`).
- Updated CI and GitHub Pages deployment workflows to run spreadsheet ingestion automatically prior to build.

## 0.1.0 - Initial
- Vite SPA to browse and preview .xlsx benchmark files
- Basic search using Fuse.js
- GitHub Actions workflows to build and deploy to GitHub Pages
- Documentation files: README, AGENTS, ROADMAP
