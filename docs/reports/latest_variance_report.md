# Penta Benchmark Variance Report — 2026-10-07

**Baseline:** `2026-10-01_penta_benchmarks.json`  
**Comparison:** `2026-10-05_penta_benchmarks.json`  

### Executive Summary

- **Total Models Analyzed:** 5
- **Regressions Detected:** ⚠️ **1**
- **Improvements Detected:** 🚀 **4**

> [!WARNING]
> **Performance Regressions Identified:**
> - **qwen2.5:14b-instruct-q4_K_M**: Throughput shifted by -8.8% (21.7 → 19.8 tok/s), TTFT changed by 6.4%

### Detailed Model Throughput Comparison

| Model | Quant | Eval Speed (Prev → Curr) | Delta % | TTFT (Prev → Curr) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `llama3:8b-instruct-q4_K_M` | `Q4_K_M` | 38.6 → 41.2 tok/s | +6.7% | 358ms → 341ms | 🚀 IMPROVED |
| `mistral:7b-instruct-v0.3-q4_0` | `Q4_0` | 42.1 → 43.8 tok/s | +4.0% | 327ms → 312ms | 🚀 IMPROVED |
| `qwen2.5:14b-instruct-q4_K_M` | `Q4_K_M` | 21.7 → 19.8 tok/s | -8.8% | 608ms → 647ms | ⚠️ REGRESSION |
| `deepseek-coder-v2:16b-lite-instruct-q4_K_M` | `Q4_K_M` | 19.4 → 20.1 tok/s | +3.6% | 1432ms → 1390ms | 🚀 IMPROVED |
| `llama3:70b-instruct-q4_0` | `Q4_0` | 4.8 → 5.1 tok/s | +6.2% | 14065ms → 13190ms | 🚀 IMPROVED |

---
*Generated automatically by Penta `bench-analyzer` agent tool.*
