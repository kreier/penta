# CHANGELOG

All notable changes to this project will be documented in this file.

## 0.2.1 - GitHub Pages Workflow Fix & Hardware Topology Update
- Fixed broken GitHub Pages deployment workflow (`.github/workflows/deploy.yml`):
  - Repository uses GitHub Actions Pages source (`build_type: workflow`); added `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4` so live website is deployed directly instead of returning 404.
  - Retained `peaceiris/actions-gh-pages@v3` synchronization as a dual fallback to keep `gh-pages` branch up to date.
  - Added `.nojekyll` to `public/` to prevent Jekyll processing on GitHub Pages.
  - Added `workflow_dispatch` trigger for manual deployment triggers.
- Updated hardware configuration and topology documentation:
  - Clarified that the physical display is connected to the motherboard video output powered by the **integrated Intel HD Graphics 530 (i3-6100)**.
  - All **4 discrete NVIDIA Pascal GPUs** (GTX 1070 8GB + 2× P104-100 8GB + P106-100 6GB = 30GB discrete VRAM) are 100% dedicated to AI LLM inference workloads with zero display framebuffer overhead.
  - Updated `README.md`, `docs/hardware/penta.yaml`, `AGENTS.md`, and React UI status banners (`src/App.jsx`).
  - Updated benchmark dataset generator (`scripts/generate_sample_data.js`) to reflect headless compute role and full 8GB usable VRAM for the GTX 1070.

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
