import React, { useEffect, useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import Fuse from 'fuse.js'

function resolveAssetUrl(relPath) {
  if (!relPath) return ''
  if (relPath.startsWith('http://') || relPath.startsWith('https://')) return relPath
  const base = import.meta.env.BASE_URL || './'
  const clean = relPath.startsWith('/') ? relPath.slice(1) : relPath
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function App() {
  const [files, setFiles] = useState([])
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [activeFile, setActiveFile] = useState(null)
  const [workbook, setWorkbook] = useState(null)
  const [activeSheetName, setActiveSheetName] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table' | 'json'
  const [tableFilter, setTableFilter] = useState('')

  // Load files.json metadata
  useEffect(() => {
    fetch(resolveAssetUrl('data/files.json'))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load file index`)
        return res.json()
      })
      .then(data => {
        const fileList = data.files || []
        setFiles(fileList)
        if (fileList.length > 0) {
          openFile(fileList[0])
        }
      })
      .catch(err => {
        setError(`Failed to load catalog: ${err.message}`)
      })
  }, [])

  // Collect all unique tags and counts
  const allTags = useMemo(() => {
    const counts = {}
    files.forEach(f => {
      (f.tags || []).forEach(t => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [files])

  // Filter files by query and active tag
  const filteredFiles = useMemo(() => {
    let list = files
    if (selectedTag) {
      list = list.filter(f => (f.tags || []).includes(selectedTag))
    }

    if (query.trim()) {
      const fuse = new Fuse(list, {
        keys: ['name', 'description', 'tags', 'sheetNames'],
        threshold: 0.35
      })
      return fuse.search(query).map(res => res.item)
    }

    return list
  }, [files, query, selectedTag])

  // Open & parse spreadsheet
  async function openFile(fileEntry) {
    setActiveFile(fileEntry)
    setLoading(true)
    setError(null)
    setTableFilter('')

    try {
      const fileUrl = resolveAssetUrl(fileEntry.path)
      const res = await fetch(fileUrl)
      if (!res.ok) throw new Error(`Failed to load workbook (${res.status} ${res.statusText})`)

      const ab = await res.arrayBuffer()
      const wb = XLSX.read(new Uint8Array(ab), { type: 'array' })

      const sheetNames = wb.SheetNames || []
      const sheetsData = {}

      sheetNames.forEach(sheetName => {
        const sheet = wb.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
        const headers = rawRows.length > 0 ? rawRows[0] : []
        const dataRows = rawRows.slice(1)
        sheetsData[sheetName] = { headers, rows: dataRows }
      })

      setWorkbook({
        fileName: fileEntry.name,
        sheetNames,
        sheets: sheetsData
      })
      setActiveSheetName(sheetNames[0] || null)
    } catch (e) {
      setError(e.message)
      setWorkbook(null)
    } finally {
      setLoading(false)
    }
  }

  // Active sheet data
  const currentSheetData = useMemo(() => {
    if (!workbook || !activeSheetName || !workbook.sheets[activeSheetName]) {
      return { headers: [], rows: [] }
    }
    const { headers, rows } = workbook.sheets[activeSheetName]

    if (!tableFilter.trim()) {
      return { headers, rows }
    }

    const q = tableFilter.toLowerCase()
    const filteredRows = rows.filter(row =>
      row.some(cell => String(cell).toLowerCase().includes(q))
    )
    return { headers, rows: filteredRows }
  }, [workbook, activeSheetName, tableFilter])

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand-group">
          <h1>penta <span className="badge-beta">v0.2</span></h1>
          <p className="subtitle">5-GPU Server Benchmark & Ingested Documentation Explorer</p>
        </div>
        <div className="hardware-pill">
          <span className="dot online"></span>
          <span className="hw-info">
            <strong>Penta Host:</strong> i3-6100 iGPU (Display) • 4× Dedicated Pascal GPUs (30GB AI VRAM)
          </span>
        </div>
      </header>

      {/* Search and Tag filter controls */}
      <section className="search-section">
        <div className="search-bar">
          <input
            type="search"
            placeholder="Search benchmarks, models, sheets, tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && <button className="clear-btn" onClick={() => setQuery('')}>×</button>}
        </div>

        {allTags.length > 0 && (
          <div className="tags-bar">
            <span className="tags-label">Tags:</span>
            {selectedTag && (
              <button
                className="tag-chip active"
                onClick={() => setSelectedTag(null)}
                title="Clear tag filter"
              >
                ✕ {selectedTag}
              </button>
            )}
            {allTags.map(([tag, count]) => (
              <button
                key={tag}
                className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                #{tag} <span className="tag-count">{count}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <main className="explorer-layout">
        {/* Left Sidebar: File List */}
        <aside className="file-sidebar">
          <div className="panel-header">
            <h2>Workbooks ({filteredFiles.length})</h2>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="empty-state">No matching benchmark files found.</div>
          ) : (
            <ul className="file-list">
              {filteredFiles.map((f, i) => {
                const isSelected = activeFile && activeFile.name === f.name
                return (
                  <li
                    key={i}
                    className={`file-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => openFile(f)}
                  >
                    <div className="file-item-header">
                      <strong className="file-name">{f.name}</strong>
                      <span className="file-size">{formatBytes(f.fileSize)}</span>
                    </div>

                    <p className="file-desc">{f.description}</p>

                    <div className="file-meta-row">
                      <span className="meta-badge">
                        {f.sheets ? `${f.sheets.length} sheets` : 'xlsx'}
                      </span>
                      {f.totalRows ? (
                        <span className="meta-badge">{f.totalRows} rows</span>
                      ) : null}
                    </div>

                    <div className="item-tags">
                      {(f.tags || []).slice(0, 4).map(t => (
                        <span key={t} className="mini-tag">#{t}</span>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        {/* Right Main Panel: Workbook Previewer */}
        <section className="preview-panel">
          {!activeFile ? (
            <div className="empty-state">Select a file from the left to view data.</div>
          ) : (
            <>
              <div className="preview-toolbar">
                <div className="workbook-info">
                  <h2>{activeFile.name}</h2>
                  <span className="file-subtext">
                    {activeFile.description}
                  </span>
                </div>
                <div className="toolbar-actions">
                  <div className="view-toggle">
                    <button
                      className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      Table
                    </button>
                    <button
                      className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
                      onClick={() => setViewMode('json')}
                    >
                      JSON
                    </button>
                  </div>
                  <a
                    className="action-btn download-btn"
                    href={resolveAssetUrl(activeFile.path)}
                    download={activeFile.name}
                  >
                    Download .xlsx
                  </a>
                </div>
              </div>

              {loading && <div className="loading-state">Parsing spreadsheet data...</div>}
              {error && <div className="error-banner">⚠️ {error}</div>}

              {/* Sheet navigation tabs */}
              {workbook && workbook.sheetNames && workbook.sheetNames.length > 0 && (
                <div className="sheet-tabs-container">
                  <div className="sheet-tabs">
                    {workbook.sheetNames.map(sheetName => (
                      <button
                        key={sheetName}
                        className={`sheet-tab ${activeSheetName === sheetName ? 'active' : ''}`}
                        onClick={() => {
                          setActiveSheetName(sheetName)
                          setTableFilter('')
                        }}
                      >
                        📊 {sheetName}
                        <span className="sheet-row-count">
                          {workbook.sheets[sheetName]?.rows.length || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  {viewMode === 'table' && (
                    <div className="sheet-filter">
                      <input
                        type="text"
                        placeholder="Filter rows in sheet..."
                        value={tableFilter}
                        onChange={e => setTableFilter(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Table Mode */}
              {viewMode === 'table' && workbook && activeSheetName && (
                <div className="table-wrapper">
                  {currentSheetData.rows.length === 0 ? (
                    <div className="empty-rows">
                      {tableFilter ? 'No rows match filter.' : 'Sheet is empty.'}
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th className="col-idx">#</th>
                          {currentSheetData.headers.map((h, hi) => (
                            <th key={hi}>{String(h || `Col ${hi + 1}`)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentSheetData.rows.map((row, ri) => (
                          <tr key={ri}>
                            <td className="col-idx">{ri + 1}</td>
                            {currentSheetData.headers.map((_, ci) => {
                              const val = row[ci] ?? ''
                              const strVal = String(val)
                              const isStatus = strVal === 'PASSED' || strVal === 'OPTIMAL' || strVal.includes('WARNING')
                              return (
                                <td
                                  key={ci}
                                  className={typeof val === 'number' ? 'num-cell' : ''}
                                >
                                  {isStatus ? (
                                    <span className={`status-pill ${strVal.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                                      {strVal}
                                    </span>
                                  ) : (
                                    strVal
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* JSON Mode */}
              {viewMode === 'json' && activeFile && (
                <div className="json-wrapper">
                  <div className="json-header">
                    <span>Structured record preview (generated by <code>excel-ingest</code>)</span>
                  </div>
                  <pre className="json-code">
                    {JSON.stringify(
                      workbook?.sheets[activeSheetName] || activeFile,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>Penta GPU Rig</strong> — Intel i3-6100 HD 530 (Display) + 4× Dedicated Pascal GPUs: GTX 1070 8GB + 2× P104-100 8GB + P106-100 6GB (30GB AI VRAM)
        </div>
        <div>
          Automated by <code>scripts/ingest.js</code> (excel-ingest pipeline)
        </div>
      </footer>
    </div>
  )
}
