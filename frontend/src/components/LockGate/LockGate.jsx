import { useState } from "react";
import "./lockgate.css";

export default function LockGate({ onUnlock = () => {} }) {
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (!key.trim()) {
      setErr("Enter your login key to continue.");
      return;
    }
    // No saving to localStorage — just unlock for this session
    onUnlock();
  }

  return (
    <div className="gate-wrap">
      <h2 className="gate-title">Enter your company login key</h2>
      <p className="gate-sub">This verifies you with your employer's onboarding agent.</p>
      <input
        className="gate-input"
        type="password"
        placeholder="••••••••"
        value={key}
        onChange={e => { setKey(e.target.value); setErr(""); }}
      />
      <button className="get-started" onClick={submit}>Unlock Dashboard</button>
      {err && <div className="gate-err">{err}</div>}
    </div>
  );
}
