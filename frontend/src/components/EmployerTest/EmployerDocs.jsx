import { useState, useRef } from "react";
import "./employerDocs.css";

const PURPOSES = [
  "NDA Template",
  "Direct Deposit Form",
  "Training Module",
  "Employee Handbook",
  "Policy / FAQ",
];

export default function EmployerDocs({ onBack = () => {} }) {
  const [items, setItems] = useState([]); // {id,name,size,type,purpose,status}
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  function handleFiles(fileList) {
    const next = Array.from(fileList).map((f, i) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type || "application/octet-stream",
      purpose: guessPurpose(f.name),
      status: "Uploaded", // "Uploaded" | "Ready for Agent"
      file: f,            // kept in memory for POC
    }));
    setItems(prev => [...prev, ...next]);
  }

  function onDrop(e) {
    e.preventDefault(); e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function guessPurpose(name) {
    const n = name.toLowerCase();
    if (n.includes("nda")) return "NDA Template";
    if (n.includes("deposit") || n.includes("payroll")) return "Direct Deposit Form";
    if (n.includes("train") || n.endsWith(".mp4") || n.endsWith(".pdf")) return "Training Module";
    if (n.includes("handbook")) return "Employee Handbook";
    if (n.includes("policy") || n.includes("faq")) return "Policy / FAQ";
    return "Training Module";
  }

  function setPurpose(id, purpose) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, purpose } : it));
  }

  function ingest(id) {
    // POC: flag as ready; in real life, POST to backend to index/file store
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: "Ready for Agent" } : it));
  }

  function removeItem(id) {
    setItems(prev => prev.filter(it => it.id !== id));
    // clear the hidden file input so the user can re-select the same file name
    try {
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      // ignore - some browsers may throw when clearing programmatically
    }
  }

  return (
    <div className="docs-wrap">
      <h2 className="docs-title">Upload or manage documents & modules</h2>
      <button className="back-btn" onClick={onBack}>← Back</button>

      <div
        className={`dropzone ${drag ? "drag" : ""}`}
        onDragOver={(e)=>{e.preventDefault(); setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={onDrop}
        onClick={()=>inputRef.current?.click()}
      >
        <div className="dz-inner">
          <div className="dz-head">Drag & drop files here</div>
          <div className="dz-sub">or click to browse (PDF, DOCX, CSV, MP4)</div>
          <button className="get-started dz-btn">Select files</button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept=".pdf,.doc,.docx,.csv,.mp4,.txt"
          onChange={(e)=>{
            if (e.target.files && e.target.files.length) handleFiles(e.target.files);
            // reset the input so selecting the same file again will trigger onChange
            try { e.target.value = ""; } catch (err) { /* ignore */ }
          }}
        />
      </div>

      {!!items.length && (
        <div className="docs-list">
          {items.map(it => (
            <div className="doc-card" key={it.id}>
              <div className="doc-row">
                <div className="doc-name">{it.name}</div>
                <div className={`status ${it.status === "Ready for Agent" ? "ready" : ""}`}>
                  {it.status}
                </div>
              </div>

              <div className="doc-meta">
                <span className="badge">{humanSize(it.size)}</span>
                <span className="badge">{extFromName(it.name)}</span>
                <span className="badge dim">{it.type || "unknown"}</span>
              </div>

              <div className="doc-actions">
                <label className="purpose-label">Use as:</label>
                <select
                  className="purpose-select"
                  value={it.purpose}
                  onChange={(e)=> setPurpose(it.id, e.target.value)}
                >
                  {PURPOSES.map(p => <option key={p}>{p}</option>)}
                </select>

                <button className="ingest-btn" onClick={()=>ingest(it.id)}>
                  Mark as “Ready for Agent”
                </button>

                <button className="remove-btn" onClick={()=>removeItem(it.id)}>
                  Remove
                </button>
              </div>

              <div className="doc-help">
                {it.purpose === "NDA Template" && "This will be offered to new hires during onboarding."}
                {it.purpose === "Direct Deposit Form" && "Agent will request this after NDA is signed."}
                {it.purpose === "Training Module" && "Becomes available once payroll info is complete."}
                {it.purpose === "Employee Handbook" && "Used to answer policy/benefits questions in Q&A."}
                {it.purpose === "Policy / FAQ" && "Indexed for instant answers in the FAQ / Policy Agent."}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function humanSize(bytes){
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`;
  if (bytes < 1024*1024*1024) return `${(bytes/1024/1024).toFixed(1)} MB`;
  return `${(bytes/1024/1024/1024).toFixed(1)} GB`;
}
function extFromName(name){
  const i = name.lastIndexOf(".");
  return i > -1 ? name.slice(i+1).toUpperCase() : "FILE";
}
