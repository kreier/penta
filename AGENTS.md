# AGENTS

This project uses lightweight agents (scripts and automation services backed by AI / rule engines) to manage the Penta 5-GPU inference documentation database.

## Active Agents & Tools

### 1. `excel-ingest` (`scripts/ingest.js`)
- **Status:** Implemented (`npm run ingest`)
- **Role:** Scans `public/data/benchmarks/*.xlsx`, extracts workbook sheets, auto-detects tags and column headers, outputs structured JSON records into `public/data/records/`, and updates `public/data/files.json`.
- **Permissions:** Read/write inside `public/data/`.
- **CI/CD Integration:** Triggered automatically before build in GitHub Actions workflows (`.github/workflows/ci.yml` and `deploy.yml`).

### 2. `bench-analyzer` (`scripts/bench_analyzer.js`)
- **Status:** Implemented (`npm run analyze`)
- **Role:** Compares successive benchmark runs across models (e.g., Llama 3, Mistral, Qwen 2.5), computes throughput/latency deltas, detects performance regressions or improvements, and writes automated variance reports to `docs/reports/latest_variance_report.md`.
- **Permissions:** Read `public/data/records/`, write to `docs/reports/`.

---

## Planned Future Agents

- **`experiment-recommender`:** Analyzes GPU VRAM splits across the 5 cards (GTX 1070 + 2× P104-100 + P106-100 + iGPU) and recommends optimal Ollama `--num-gpu` and layer split boundaries.
- **`nl-query-agent`:** Natural language search agent allowing queries like *"Which model achieves over 30 tokens/sec without spilling to CPU RAM?"*
