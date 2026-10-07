# penta

Documentation, ingestion pipeline, and explorer UI for the **Penta GPU server** — a 5-GPU rig used for AI inference with Ollama in Docker.

🔗 **Live Benchmark Explorer:** [https://kreier.github.io/penta/](https://kreier.github.io/penta/)

## About the Machine

**"Penta"** refers to the 5 GPUs visible to the system:
- **GPU 0:** Intel HD Graphics 530 (integrated with Core i3-6100) — **primary display output & host GUI**
- **GPU 1:** NVIDIA GeForce GTX 1070 (8 GB GDDR5) — **dedicated AI compute node**
- **GPU 2:** NVIDIA P104-100 (8 GB GDDR5X) — **dedicated AI compute node**
- **GPU 3:** NVIDIA P104-100 (8 GB GDDR5X) — **dedicated AI compute node**
- **GPU 4:** NVIDIA P106-100 (6 GB GDDR5) — **dedicated AI compute node**

### Display & VRAM Topology
The monitor display is connected directly to the motherboard video output driven by the **integrated Intel HD Graphics 530 of the i3-6100**.

Because display server tasks (desktop composition, window manager, and framebuffer memory) run exclusively on the Intel iGPU:
- **Zero VRAM** on the discrete GeForce GTX 1070 is occupied by desktop rendering.
- All **4 discrete NVIDIA Pascal GPUs** run completely headless and are **100% dedicated to AI LLM inference workloads**.
- The server provides a full **30 GB discrete VRAM pool** (8 + 8 + 8 + 6 GB) for multi-GPU layer/tensor offloading with Ollama inside Docker.

---

## Features

- **Spreadsheet & Record Explorer:** Search, filter, and view multi-sheet `.xlsx` benchmark collections and structured JSON records.
- **Automated Ingestion Pipeline (`excel-ingest`):** Automatically parses spreadsheets dropped into `public/data/benchmarks/`, generates structured records in `public/data/records/`, and keeps `public/data/files.json` updated with sheet metadata and auto-detected tags.
- **Run-to-Run Variance Analyzer (`bench-analyzer`):** Detects throughput and latency regressions between benchmark runs and generates markdown reports in `docs/reports/`.
- **GitHub Pages Ready:** Automated CI/CD deployment via GitHub Actions artifact publishing with relative asset resolution.

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
