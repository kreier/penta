import fs from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

const BENCHMARKS_DIR = path.resolve('public/data/benchmarks')
const RECORDS_DIR = path.resolve('public/data/records')
const FILES_META_PATH = path.resolve('public/data/files.json')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function autoExtractTags(filename, sheetNames, dataSample) {
  const tags = new Set(['penta'])
  const lowerName = filename.toLowerCase()

  if (lowerName.includes('gpu') || lowerName.includes('memory')) {
    tags.add('gpu')
    tags.add('memory')
    tags.add('vram')
  }
  if (lowerName.includes('bench')) {
    tags.add('benchmark')
    tags.add('inference')
    tags.add('ollama')
  }

  sheetNames.forEach(s => {
    const ls = s.toLowerCase()
    if (ls.includes('inference')) tags.add('inference')
    if (ls.includes('offload')) tags.add('offloading')
    if (ls.includes('inventory')) tags.add('hardware')
    if (ls.includes('allocation')) tags.add('allocation')
  })

  // Check sample rows for known keywords
  for (const row of dataSample.slice(0, 10)) {
    const str = JSON.stringify(row).toLowerCase()
    if (str.includes('llama')) tags.add('llama')
    if (str.includes('mistral')) tags.add('mistral')
    if (str.includes('qwen')) tags.add('qwen')
    if (str.includes('deepseek')) tags.add('deepseek')
    if (str.includes('gtx 1070') || str.includes('1070')) tags.add('gtx1070')
    if (str.includes('p104')) tags.add('p104')
    if (str.includes('p106')) tags.add('p106')
  }

  return Array.from(tags)
}

function runIngest() {
  console.log('--- Starting Penta excel-ingest pipeline ---')
  ensureDir(BENCHMARKS_DIR)
  ensureDir(RECORDS_DIR)

  let existingMeta = { files: [] }
  if (fs.existsSync(FILES_META_PATH)) {
    try {
      existingMeta = JSON.parse(fs.readFileSync(FILES_META_PATH, 'utf-8'))
    } catch (e) {
      console.warn('Could not read existing files.json, initializing fresh metadata.')
    }
  }

  const existingMap = new Map((existingMeta.files || []).map(f => [f.name, f]))

  const fileNames = fs.readdirSync(BENCHMARKS_DIR).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))
  console.log(`Found ${fileNames.length} spreadsheet(s) in ${BENCHMARKS_DIR}`)

  const updatedFiles = []

  for (const fileName of fileNames) {
    const filePath = path.join(BENCHMARKS_DIR, fileName)
    const stats = fs.statSync(filePath)
    const fileBuffer = fs.readFileSync(filePath)
    const wb = XLSX.read(fileBuffer, { type: 'buffer' })

    const recordData = {
      filename: fileName,
      parsedAt: new Date().toISOString(),
      fileSize: stats.size,
      sheets: {}
    }

    const sheetSummaries = []
    let allSampleRows = []

    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null })
      const rawMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      const headers = rawMatrix.length > 0 ? rawMatrix[0] : []

      recordData.sheets[sheetName] = {
        rowCount: rows.length,
        headers,
        rows
      }

      sheetSummaries.push({
        name: sheetName,
        rowCount: rows.length,
        columnCount: headers.length
      })

      allSampleRows = allSampleRows.concat(rows.slice(0, 5))
    }

    // Write structured JSON record
    const baseName = fileName.replace(/\.[^/.]+$/, '')
    const recordFileName = `${baseName}.json`
    const recordFilePath = path.join(RECORDS_DIR, recordFileName)
    fs.writeFileSync(recordFilePath, JSON.stringify(recordData, null, 2), 'utf-8')
    console.log(`  ✓ Processed ${fileName} -> records/${recordFileName} (${wb.SheetNames.length} sheets)`)

    // Preserve existing description/tags if user specified them
    const existing = existingMap.get(fileName) || {}
    const autoTags = autoExtractTags(fileName, wb.SheetNames, allSampleRows)
    const mergedTags = Array.from(new Set([...(existing.tags || []), ...autoTags]))

    const fileMeta = {
      name: fileName,
      path: `data/benchmarks/${fileName}`,
      recordPath: `data/records/${recordFileName}`,
      description: existing.description || `Benchmark workbook containing ${wb.SheetNames.join(', ')}.`,
      tags: mergedTags,
      sheetNames: wb.SheetNames,
      sheets: sheetSummaries,
      totalRows: sheetSummaries.reduce((sum, s) => sum + s.rowCount, 0),
      fileSize: stats.size,
      lastModified: stats.mtime.toISOString()
    }

    updatedFiles.push(fileMeta)
  }

  // Update public/data/files.json
  const finalMeta = {
    updatedAt: new Date().toISOString(),
    totalFiles: updatedFiles.length,
    files: updatedFiles
  }

  fs.writeFileSync(FILES_META_PATH, JSON.stringify(finalMeta, null, 2), 'utf-8')
  console.log(`  ✓ Updated ${FILES_META_PATH}`)
  console.log('--- Ingest pipeline completed successfully! ---')
}

runIngest()
