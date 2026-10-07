import fs from 'fs'
import path from 'path'

const RECORDS_DIR = path.resolve('public/data/records')
const REPORTS_DIR = path.resolve('docs/reports')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function loadBenchmarkRecords() {
  if (!fs.existsSync(RECORDS_DIR)) {
    console.error(`Records directory not found: ${RECORDS_DIR}. Run 'npm run ingest' first.`)
    process.exit(1)
  }

  const files = fs.readdirSync(RECORDS_DIR)
    .filter(f => f.includes('benchmarks') && f.endsWith('.json'))
    .sort()

  if (files.length < 2) {
    console.error(`Need at least 2 benchmark runs in ${RECORDS_DIR} to perform variance analysis. Found: ${files.length}`)
    process.exit(1)
  }

  return files.map(file => {
    const fullPath = path.join(RECORDS_DIR, file)
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
    return { filename: file, data: content }
  })
}

function analyzeVariance(runA, runB) {
  const sheetA = runA.data.sheets['Inference Benchmarks']?.rows || []
  const sheetB = runB.data.sheets['Inference Benchmarks']?.rows || []

  const mapA = new Map(sheetA.map(r => [`${r.model}_${r.quant}`, r]))
  const results = []

  for (const b of sheetB) {
    const key = `${b.model}_${b.quant}`
    const a = mapA.get(key)
    if (!a) continue

    const tpsA = Number(a.eval_tok_per_sec)
    const tpsB = Number(b.eval_tok_per_sec)
    const tpsDelta = tpsA ? (((tpsB - tpsA) / tpsA) * 100) : 0

    const promptTpsA = Number(a.prompt_eval_tok_per_sec)
    const promptTpsB = Number(b.prompt_eval_tok_per_sec)
    const promptTpsDelta = promptTpsA ? (((promptTpsB - promptTpsA) / promptTpsA) * 100) : 0

    const ttftA = Number(a.ttft_ms)
    const ttftB = Number(b.ttft_ms)
    const ttftDelta = ttftA ? (((ttftB - ttftA) / ttftA) * 100) : 0

    let classification = 'STABLE'
    if (tpsDelta < -3.0 || ttftDelta > 10.0) {
      classification = 'REGRESSION'
    } else if (tpsDelta > 3.0 || ttftDelta < -10.0) {
      classification = 'IMPROVEMENT'
    }

    results.push({
      model: b.model,
      quant: b.quant,
      prevTps: tpsA,
      currTps: tpsB,
      tpsDeltaPct: tpsDelta.toFixed(1),
      prevPromptTps: promptTpsA,
      currPromptTps: promptTpsB,
      promptTpsDeltaPct: promptTpsDelta.toFixed(1),
      prevTtft: ttftA,
      currTtft: ttftB,
      ttftDeltaPct: ttftDelta.toFixed(1),
      classification
    })
  }

  return results
}

function generateMarkdownReport(runA, runB, comparisons) {
  const dateStr = new Date().toISOString().split('T')[0]
  const regressions = comparisons.filter(c => c.classification === 'REGRESSION')
  const improvements = comparisons.filter(c => c.classification === 'IMPROVEMENT')

  let md = `# Penta Benchmark Variance Report — ${dateStr}\n\n`
  md += `**Baseline:** \`${runA.filename}\`  \n`
  md += `**Comparison:** \`${runB.filename}\`  \n\n`

  md += `### Executive Summary\n\n`
  md += `- **Total Models Analyzed:** ${comparisons.length}\n`
  md += `- **Regressions Detected:** ${regressions.length === 0 ? '✅ None' : `⚠️ **${regressions.length}**`}\n`
  md += `- **Improvements Detected:** 🚀 **${improvements.length}**\n\n`

  if (regressions.length > 0) {
    md += `> [!WARNING]\n`
    md += `> **Performance Regressions Identified:**\n`
    for (const r of regressions) {
      md += `> - **${r.model}**: Throughput shifted by ${r.tpsDeltaPct}% (${r.prevTps} → ${r.currTps} tok/s), TTFT changed by ${r.ttftDeltaPct}%\n`
    }
    md += `\n`
  }

  md += `### Detailed Model Throughput Comparison\n\n`
  md += `| Model | Quant | Eval Speed (Prev → Curr) | Delta % | TTFT (Prev → Curr) | Status |\n`
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`

  for (const c of comparisons) {
    const icon = c.classification === 'REGRESSION' ? '⚠️ REGRESSION' : c.classification === 'IMPROVEMENT' ? '🚀 IMPROVED' : '⏺ STABLE'
    const sign = Number(c.tpsDeltaPct) > 0 ? '+' : ''
    md += `| \`${c.model}\` | \`${c.quant}\` | ${c.prevTps} → ${c.currTps} tok/s | ${sign}${c.tpsDeltaPct}% | ${c.prevTtft}ms → ${c.currTtft}ms | ${icon} |\n`
  }

  md += `\n---\n*Generated automatically by Penta \`bench-analyzer\` agent tool.*\n`
  return md
}

function run() {
  console.log('--- Starting Penta bench-analyzer agent ---')
  ensureDir(REPORTS_DIR)
  const runs = loadBenchmarkRecords()

  // Compare last two runs
  const runA = runs[runs.length - 2]
  const runB = runs[runs.length - 1]

  console.log(`Comparing baseline [${runA.filename}] against [${runB.filename}]...`)
  const comparisons = analyzeVariance(runA, runB)

  console.log('\n--- Variance Results ---')
  for (const c of comparisons) {
    const badge = c.classification === 'REGRESSION' ? '⚠️ [REGRESSION]' : c.classification === 'IMPROVEMENT' ? '🚀 [IMPROVED] ' : '⏺ [STABLE]   '
    const sign = Number(c.tpsDeltaPct) > 0 ? '+' : ''
    console.log(`${badge} ${c.model.padEnd(42)} ${c.prevTps} -> ${c.currTps} tok/s (${sign}${c.tpsDeltaPct}%)`)
  }

  const reportMd = generateMarkdownReport(runA, runB, comparisons)
  const reportPath = path.join(REPORTS_DIR, 'latest_variance_report.md')
  fs.writeFileSync(reportPath, reportMd, 'utf-8')
  console.log(`\n✓ Written report to: ${reportPath}`)
  console.log('--- Analysis complete ---')
}

run()
