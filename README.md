# penta

Documentation and an early UI for the Penta GPU server — a 5-GPU box used for AI inference with ollama in Docker.

This repository contains a Vite-based single page app that exposes a folder (/public/data) where you can place .xlsx benchmark collections. The UI lets you search and preview the first sheet of those files and is intended to become a documentation database over time.

Getting started

- Install dependencies: npm ci
- Run dev server: npm run dev
- Build: npm run build
- Deploy: CI/CD workflows are provided to deploy to GitHub Pages (gh-pages branch)

About the machine

'penta' refers to the 5 GPUs visible to the system: the integrated GPU of an Intel i3-6100 plus four discrete GPUs (GTX 1070 8GB, two P104-100, one P106-100). The target usage is to run ollama inside Docker and use the combined VRAM for model inference.

Contributing

Add your benchmark .xlsx files to public/data/benchmarks and update public/data/files.json with metadata (name, path, tags, description). Over time we'll add ingestion, conversion to structured docs and agents to help analyze results.
