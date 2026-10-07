# ROADMAP

Planned milestones and progress:

- [x] **v0.1: Basic UI to list and preview .xlsx**
  - Search via Fuse.js
  - GitHub Pages deployment workflow
- [x] **v0.2: Automatic Ingestion Pipeline & Enhanced Explorer**
  - `excel-ingest` pipeline (`scripts/ingest.js` / `npm run ingest`) converting workbooks into structured JSON in `data/records/`
  - Multi-sheet tab navigation and sticky data tables
  - Row filtering and tag chip filtering
  - Base URL fixes for GitHub Pages
  - CI automated ingestion before build
- [x] **v0.3 Alpha: Benchmark Analysis Agent**
  - `bench-analyzer` agent (`scripts/bench_analyzer.js` / `npm run analyze`) to compute run-to-run deltas and output markdown regression reports
  - Initial 5-GPU hardware inventory & VRAM allocation models
- [ ] **v0.3 Beta: Interactive Dashboards & Experiment Recommender**
  - Interactive charts (throughput vs. model parameter size, VRAM split visualizer)
  - Ollama layer offloading recommender script
- [ ] **v1.0: Full Documentation Database**
  - Multi-run versioning
  - Queryable by natural language / vector search
