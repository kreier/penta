import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import Fuse from 'fuse.js'

export default function App(){
  const [files, setFiles] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [preview, setPreview] = useState(null)

  useEffect(()=>{
    fetch('/data/files.json')
      .then(r=>r.json())
      .then(data=>{
        setFiles(data.files || [])
        setResults(data.files || [])
      })
  },[])

  useEffect(()=>{
    if(!files.length) return
    const fuse = new Fuse(files, { keys: ['name','description','tags'], includeScore: true })
    if(query.trim()){
      const r = fuse.search(query).map(x=>x.item)
      setResults(r)
    } else {
      setResults(files)
    }
  },[query, files])

  async function openFile(entry){
    try{
      const res = await fetch(entry.path)
      if(!res.ok) throw new Error('Failed to fetch')
      const ab = await res.arrayBuffer()
      const wb = XLSX.read(new Uint8Array(ab), {type:'array'})
      const first = wb.SheetNames[0]
      const data = XLSX.utils.sheet_to_json(wb.Sheets[first], {header:1})
      setPreview({file: entry, sheet: first, rows: data.slice(0,50)})
    }catch(e){
      setPreview({error: String(e)})
    }
  }

  return (
    <div className="app">
      <header>
        <h1>penta — Benchmark & Documentation Explorer</h1>
        <p>Search, preview and browse xlsx benchmark collections stored in /data.</p>
      </header>

      <div className="controls">
        <input placeholder="search files, tags, descriptions" value={query} onChange={e=>setQuery(e.target.value)} />
      </div>

      <main>
        <section className="list">
          <h2>Files</h2>
          {results.length===0 && <p>No files found.</p>}
          <ul>
            {results.map((f,i)=> (
              <li key={i}>
                <div className="meta">
                  <strong>{f.name}</strong>
                  <div className="desc">{f.description}</div>
                  <div className="tags">{(f.tags||[]).join(', ')}</div>
                </div>
                <div className="actions">
                  <button onClick={()=>openFile(f)}>Preview</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="preview">
          <h2>Preview</h2>
          {preview === null && <p>Select a file to preview first sheet (first 50 rows).</p>}
          {preview && preview.error && <pre className="error">{preview.error}</pre>}
          {preview && preview.rows && (
            <div>
              <h3>{preview.file.name} — {preview.sheet}</h3>
              <table>
                <tbody>
                  {preview.rows.map((r,ri)=>(
                    <tr key={ri}>{r.map((c,ci)=>(<td key={ci}>{String(c)}</td>))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer>
        <small>penta — 5 GPUs (incl. integrated) — AI inference bench explorer</small>
      </footer>
    </div>
  )
}
