# penta

Documentation, ingestion pipeline, and explorer UI for the **Penta GPU server** — a 5-GPU rig used for AI inference with Ollama in Docker.

## About the Machine

**"Penta"** refers to the 5 GPUs visible to the system:
- **GPU 0:** Intel HD Graphics 530 (integrated with Core i3-6100, host DDR4 RAM offload)
- **GPU 1:** NVIDIA GeForce GTX 1070 (8 GB GDDR5) — primary display & compute
- **GPU 2:** NVIDIA P104-100 (8 GB GDDR5X) — compute node
- **GPU 3:** NVIDIA P104-100 (8 GB GDDR5X) — compute node
- **GPU 4:** NVIDIA P106-100 (6 GB GDDR5) — compute node

**Total discrete VRAM:** 30 GB GDDR5/GDDR5X across 4 dedicated Pascal cards + shared system memory.  
**Target usage:** Ollama multi-GPU tensor/layer offloading inside Docker.

---

## Features

- **Spreadsheet & Record Explorer:** Search, filter, and view multi-sheet `.xlsx` benchmark collections and structured JSON records.
- **Automated Ingestion Pipeline (`excel-ingest`):** Automatically parses spreadsheets dropped into `public/data/benchmarks/`, generates structured records in `public/data/records/`, and keeps `public/data/files.json` updated with sheet metadata and auto-detected tags.
- **Run-to-Run Variance Analyzer (`bench-analyzer`):** Detects throughput and latency regressions between benchmark runs and generates markdown reports in `docs/reports/`.
- **GitHub Pages Ready:** Configured with relative asset resolution and automated CI/CD deployment.

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Generate sample benchmark workbooks for the 5-GPU setup
npm run sample-data

# 3. Run spreadsheet ingestion pipeline
npm run ingest

# 4. Run variance and regression analyzer
npm run analyze

# 5. Start development UI
npm run dev

# 6. Build production bundle
npm run build
```

---

## Contributing Benchmarks

1. Place new benchmark `.xlsx` files into `public/data/benchmarks/`.
2. Run `npm run ingest` to parse the sheets and update `public/data/files.json`.
3. Run `npm run analyze` to compare the newest run against prior baselines.
4. Open a pull request!
