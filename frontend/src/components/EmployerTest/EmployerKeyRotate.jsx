import { useMemo, useState } from "react";
import "./employerKeyRotate.css";

function genKey() {
  // 4 blocks of 4: XXXX-XXXX-XXXX-XXXX (A–Z, 2–9, no confusing chars)
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${block()}-${block()}-${block()}-${block()}`;
}

function mask(k) {
  if (!k) return "••••-••••-••••-••••";
  // show last block only
  const parts = k.split("-");
  return `••••-••••-••••-${parts[3] ?? "••••"}`;
}

export default function EmployerKeyRotate({ onBack = () => {} }) {
  // POC: we don't persist any key; treat "current" as unknown/masked
  const [newKey, setNewKey] = useState("");
  const [confirm, setConfirm] = useState("");
  const [copied, setCopied] = useState(false);
  const [rotated, setRotated] = useState(false);
  const strength = useMemo(() => {
    // Simple strength hint based on variety and blocks
    if (!newKey) return 0;
    const uniq = new Set(newKey.replace(/-/g, "").split("")).size;
    return Math.min(100, Math.round((uniq / 20) * 100));
  }, [newKey]);

  function handleGenerate() {
    setRotated(false);
    setCopied(false);
    const k = genKey();
    setNewKey(k);
    setConfirm("");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  function rotate() {
    if (!newKey || confirm !== newKey) return;
    // POC: pretend we rotated; in real app, POST to backend then store server-issued key
    setRotated(true);
  }

  const canRotate = newKey && confirm === newKey;

  return (
    <div className="key-wrap">
      <h2 className="key-title">Update or rotate your company login key</h2>
      <button className="back-btn" onClick={onBack}>← Back</button>

      <div className="key-card">
        <div className="row">
          <div className="label">Current active key</div>
          <div className="value mono">{mask("")}</div>
        </div>

        <div className="divider" />

        <div className="row">
          <div className="label">Generate a new key</div>
          <div className="value">
            <div className="gen-row">
              <input className="key-input mono" readOnly value={newKey} placeholder="Click generate to create a new key" />
              <button className="outline-btn" onClick={handleGenerate}>Generate</button>
              <button className="outline-btn" onClick={copy} disabled={!newKey}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="row stack">
          <label className="label">Confirm new key</label>
          <input
            className="key-input mono"
            placeholder="Re-enter the new key exactly"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.toUpperCase())}
          />
          <div className="note">For security, the new key must be confirmed before rotation.</div>
        </div>

        <div className="actions">
          <button className={`rotate-btn ${canRotate ? "enabled" : ""}`} onClick={rotate} disabled={!canRotate}>
            Rotate Key
          </button>
        </div>

        {rotated && (
          <div className="success">
            ✅ Key rotated. Share this new key with your employees to access employer tools and invite new hires.
          </div>
        )}
      </div>

      <div className="key-help">
        <p>Best practices:</p>
        <ul>
          <li>Rotate keys when team members change or every 90 days.</li>
          <li>Distribute keys via secure channels only.</li>
          <li>Revoke older keys server-side (not shown in this POC).</li>
        </ul>
      </div>
    </div>
  );
}
