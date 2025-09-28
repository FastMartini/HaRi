import { useState } from "react";
import "./employerKey.css";

export default function EmployerKey({ onConfirmed = () => {} }) {
  const [k1, setK1] = useState("");
  const [k2, setK2] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (!k1.trim() || !k2.trim()) return setErr("Enter and confirm your key.");
    if (k1.length < 8) return setErr("Key must be at least 8 characters.");
    if (k1 !== k2) return setErr("Keys do not match.");
    // no persistence; just proceed
    onConfirmed();
  }

  return (
    <div className="key-wrap">
      <h2 className="key-title">Create your company login key</h2>
      <p className="key-sub">This key will be used to access employer tools and invite employees to use your onboarding agent.</p>

      <input
        className="key-input"
        type="password"
        placeholder="Enter key (min 8 chars)"
        value={k1}
        onChange={e=>{ setK1(e.target.value); setErr(""); }}
      />
      <input
        className="key-input"
        type="password"
        placeholder="Re-enter key"
        value={k2}
        onChange={e=>{ setK2(e.target.value); setErr(""); }}
      />

      <button className="get-started" onClick={submit}>Confirm</button>
      {err && <div className="key-err">{err}</div>}
    </div>
  );
}