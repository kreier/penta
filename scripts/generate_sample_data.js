import fs from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

const targetDir = path.resolve('public/data/benchmarks')
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// 1. 2026-10-01_penta_benchmarks.xlsx
const inferenceData = [
  {
    model: 'llama3:8b-instruct-q4_K_M',
    parameters_b: 8.03,
    quant: 'Q4_K_M',
    context_size: 4096,
    prompt_tokens: 512,
    eval_tokens: 256,
    prompt_eval_tok_per_sec: 142.8,
    eval_tok_per_sec: 38.6,
    ttft_ms: 358,
    total_duration_sec: 7.22,
    layers_offloaded: '33/33 (100%)',
    gpus_used: 'GTX 1070 + P104-100 #1',
    vram_used_mb: 5920,
    status: 'PASSED'
  },
  {
    model: 'mistral:7b-instruct-v0.3-q4_0',
    parameters_b: 7.24,
    quant: 'Q4_0',
    context_size: 4096,
    prompt_tokens: 512,
    eval_tokens: 256,
    prompt_eval_tok_per_sec: 156.4,
    eval_tok_per_sec: 42.1,
    ttft_ms: 327,
    total_duration_sec: 6.74,
    layers_offloaded: '33/33 (100%)',
    gpus_used: 'GTX 1070 + P104-100 #1',
    vram_used_mb: 5180,
    status: 'PASSED'
  },
  {
    model: 'qwen2.5:14b-instruct-q4_K_M',
    parameters_b: 14.7,
    quant: 'Q4_K_M',
    context_size: 4096,
    prompt_tokens: 512,
    eval_tokens: 256,
    prompt_eval_tok_per_sec: 84.2,
    eval_tok_per_sec: 21.7,
    ttft_ms: 608,
    total_duration_sec: 12.89,
    layers_offloaded: '49/49 (100%)',
    gpus_used: 'GTX 1070 + 2x P104-100',
    vram_used_mb: 10450,
    status: 'PASSED'
  },
  {
    model: 'deepseek-coder-v2:16b-lite-instruct-q4_K_M',
    parameters_b: 15.7,
    quant: 'Q4_K_M',
    context_size: 8192,
    prompt_tokens: 1024,
    eval_tokens: 512,
    prompt_eval_tok_per_sec: 71.5,
    eval_tok_per_sec: 19.4,
    ttft_ms: 1432,
    total_duration_sec: 28.12,
    layers_offloaded: '28/28 (100%)',
    gpus_used: 'GTX 1070 + 2x P104-100 + P106-100',
    vram_used_mb: 13200,
    status: 'PASSED'
  },
  {
    model: 'llama3:70b-instruct-q4_0',
    parameters_b: 70.6,
    quant: 'Q4_0',
    context_size: 2048,
    prompt_tokens: 256,
    eval_tokens: 128,
    prompt_eval_tok_per_sec: 18.2,
    eval_tok_per_sec: 4.8,
    ttft_ms: 14065,
    total_duration_sec: 38.45,
    layers_offloaded: '52/81 (64% partial)',
    gpus_used: 'All 4 Discrete GPUs + System RAM fallback',
    vram_used_mb: 29800,
    status: 'WARNING_VRAM_SPILL'
  }
]

const layerData = [
  {
    layer_range: 'Embedding + Layers 0-14',
    gpu_id: 1,
    gpu_name: 'GTX 1070 8GB',
    allocated_vram_mb: 7200,
    pci_bus: '01:00.0',
    bus_type: 'PCIe 3.0 x16'
  },
  {
    layer_range: 'Layers 15-28',
    gpu_id: 2,
    gpu_name: 'P104-100 8GB #1',
    allocated_vram_mb: 7650,
    pci_bus: '02:00.0',
    bus_type: 'PCIe 3.0 x4 (riser)'
  },
  {
    layer_range: 'Layers 29-42',
    gpu_id: 3,
    gpu_name: 'P104-100 8GB #2',
    allocated_vram_mb: 7600,
    pci_bus: '03:00.0',
    bus_type: 'PCIe 3.0 x1 (riser)'
  },
  {
    layer_range: 'Layers 43-51',
    gpu_id: 4,
    gpu_name: 'P106-100 6GB',
    allocated_vram_mb: 5850,
    pci_bus: '04:00.0',
    bus_type: 'PCIe 3.0 x1 (riser)'
  },
  {
    layer_range: 'Layers 52-80 + Output Head',
    gpu_id: 0,
    gpu_name: 'Host RAM / CPU + Intel HD 530 iGPU',
    allocated_vram_mb: 18200,
    pci_bus: '00:02.0',
    bus_type: 'Direct DMI 3.0'
  }
]

const wb1 = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb1, XLSX.utils.json_to_sheet(inferenceData), 'Inference Benchmarks')
XLSX.utils.book_append_sheet(wb1, XLSX.utils.json_to_sheet(layerData), 'Layer Offloading Map')
const file1Path = path.join(targetDir, '2026-10-01_penta_benchmarks.xlsx')
XLSX.writeFile(wb1, file1Path)
console.log('Created:', file1Path)

// 2. gpu_memory_summary.xlsx
const gpuInventory = [
  {
    id: 0,
    name: 'Intel HD Graphics 530',
    role: 'Host Physical Display & Desktop GUI iGPU',
    architecture: 'Skylake GT2',
    vram_type: 'Shared DDR4 System RAM',
    total_memory_mb: 16384,
    usable_vram_mb: 4096,
    idle_power_w: 4.2,
    driver: 'i915'
  },
  {
    id: 1,
    name: 'NVIDIA GeForce GTX 1070',
    role: 'Dedicated AI Compute Node (Pascal GP104)',
    architecture: 'Pascal GP104',
    vram_type: 'GDDR5',
    total_memory_mb: 8192,
    usable_vram_mb: 8110,
    idle_power_w: 12.8,
    driver: 'NVIDIA 550.120'
  },
  {
    id: 2,
    name: 'NVIDIA P104-100 #1',
    role: 'Compute Node / Mining Pascal Edition',
    architecture: 'Pascal GP104-100',
    vram_type: 'GDDR5X',
    total_memory_mb: 8192,
    usable_vram_mb: 8110,
    idle_power_w: 14.1,
    driver: 'NVIDIA 550.120'
  },
  {
    id: 3,
    name: 'NVIDIA P104-100 #2',
    role: 'Compute Node / Mining Pascal Edition',
    architecture: 'Pascal GP104-100',
    vram_type: 'GDDR5X',
    total_memory_mb: 8192,
    usable_vram_mb: 8110,
    idle_power_w: 13.9,
    driver: 'NVIDIA 550.120'
  },
  {
    id: 4,
    name: 'NVIDIA P106-100',
    role: 'Compute Node / Mining Pascal Edition',
    architecture: 'Pascal GP106-100',
    vram_type: 'GDDR5',
    total_memory_mb: 6144,
    usable_vram_mb: 6080,
    idle_power_w: 10.5,
    driver: 'NVIDIA 550.120'
  }
]

const allocationSummary = [
  {
    workload: 'Idle (Docker Ollama Daemon)',
    total_allocated_mb: 240,
    gtx_1070_mb: 60,
    p104_1_mb: 60,
    p104_2_mb: 60,
    p106_mb: 60,
    status: 'OPTIMAL'
  },
  {
    workload: 'Llama 3 8B Q4_K_M (Full Offload)',
    total_allocated_mb: 5920,
    gtx_1070_mb: 4120,
    p104_1_mb: 1800,
    p104_2_mb: 0,
    p106_mb: 0,
    status: 'OPTIMAL'
  },
  {
    workload: 'Qwen 2.5 14B Q4_K_M (Full Offload)',
    total_allocated_mb: 10450,
    gtx_1070_mb: 3900,
    p104_1_mb: 3300,
    p104_2_mb: 3250,
    p106_mb: 0,
    status: 'OPTIMAL'
  },
  {
    workload: 'DeepSeek 16B Q4_K_M (Full Offload)',
    total_allocated_mb: 13200,
    gtx_1070_mb: 3800,
    p104_1_mb: 3600,
    p104_2_mb: 3600,
    p106_mb: 2200,
    status: 'OPTIMAL'
  },
  {
    workload: 'Llama 3 70B Q4_0 (Max Offload Split)',
    total_allocated_mb: 29800,
    gtx_1070_mb: 7600,
    p104_1_mb: 7800,
    p104_2_mb: 7800,
    p106_mb: 5800,
    status: 'MAX_CAPACITY'
  }
]

const wb2 = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb2, XLSX.utils.json_to_sheet(gpuInventory), 'GPU Hardware Inventory')
XLSX.utils.book_append_sheet(wb2, XLSX.utils.json_to_sheet(allocationSummary), 'VRAM Allocation Profiles')
const file2Path = path.join(targetDir, 'gpu_memory_summary.xlsx')
XLSX.writeFile(wb2, file2Path)
console.log('Created:', file2Path)

// 3. 2026-10-05_penta_benchmarks.xlsx (Subsequent run for variance / regression comparison)
const run2Data = [
  {
    model: 'llama3:8b-instruct-q4_K_M',
    parameters_b: 8.03,
    quant: 'Q4_K_M',
    context_size: 4096,
    prompt_tokens: 512,
    eval_tokens: 256,
    prompt_eval_tok_per_sec: 148.2, // +3.8%
    eval_tok_per_sec: 41.2,          // +6.7% improvement
    ttft_ms: 341,
    total_duration_sec: 6.82,
    layers_offloaded: '33/33 (100%)',
    gpus_used: 'GTX 1070 + P104-100 #1',
    vram_used_mb: 5890,
    status: 'PASSED'
  },
  {
    model: 'mistral:7b-instruct-v0.3-q4_0',
    parameters_b: 7.24,
    quant: 'Q4_0',
    context_size: 4096,
    prompt_tokens: 512,
    eval_tokens: 256,
    prompt_eval_tok_per_sec: 161.0, // +2.9%
    eval_tok_per_sec: 43.8,          // +4.0% improvement
    ttft_ms: 312,
    total_duration_sec: 6.48,
    layers_offloaded: '33/33 (100%)',
    gpus_used: 'GTX 1070 + P104-100 #1',
    vram_used_mb: 5170,
    status: 'PASSED'
  },
  {
    model: 'qwen2.5:14b-instruct-q4_K_M',
    parameters_b: 14.7,
    quant: 'Q4_K_M',
    context_size: 4096,
    prompt_tokens: 512,
    eval_tokens: 256,
    prompt_eval_tok_per_sec: 79.1,  // -6.1% REGRESSION
    eval_tok_per_sec: 19.8,          // -8.8% REGRESSION
    ttft_ms: 647,
    total_duration_sec: 13.92,
    layers_offloaded: '49/49 (100%)',
    gpus_used: 'GTX 1070 + 2x P104-100',
    vram_used_mb: 10620,
    status: 'WARNING_REGRESSION'
  },
  {
    model: 'deepseek-coder-v2:16b-lite-instruct-q4_K_M',
    parameters_b: 15.7,
    quant: 'Q4_K_M',
    context_size: 8192,
    prompt_tokens: 1024,
    eval_tokens: 512,
    prompt_eval_tok_per_sec: 73.8,  // +3.2%
    eval_tok_per_sec: 20.1,          // +3.6% improvement
    ttft_ms: 1390,
    total_duration_sec: 27.20,
    layers_offloaded: '28/28 (100%)',
    gpus_used: 'GTX 1070 + 2x P104-100 + P106-100',
    vram_used_mb: 13180,
    status: 'PASSED'
  },
  {
    model: 'llama3:70b-instruct-q4_0',
    parameters_b: 70.6,
    quant: 'Q4_0',
    context_size: 2048,
    prompt_tokens: 256,
    eval_tokens: 128,
    prompt_eval_tok_per_sec: 19.4,  // +6.6%
    eval_tok_per_sec: 5.1,           // +6.2% improvement
    ttft_ms: 13190,
    total_duration_sec: 36.12,
    layers_offloaded: '54/81 (66% partial)',
    gpus_used: 'All 4 Discrete GPUs + System RAM fallback',
    vram_used_mb: 29950,
    status: 'WARNING_VRAM_SPILL'
  }
]

const wb3 = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb3, XLSX.utils.json_to_sheet(run2Data), 'Inference Benchmarks')
XLSX.utils.book_append_sheet(wb3, XLSX.utils.json_to_sheet(layerData), 'Layer Offloading Map')
const file3Path = path.join(targetDir, '2026-10-05_penta_benchmarks.xlsx')
XLSX.writeFile(wb3, file3Path)
console.log('Created:', file3Path)

