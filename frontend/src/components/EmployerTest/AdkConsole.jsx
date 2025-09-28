import { useEffect, useState } from "react";
import "./adkConsole.css";

const API = "http://localhost:7999";

export default function AdkConsole({ onBack = () => {} }) {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);   // [{role:'user'|'agent', text:string}]
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${API}/session`)
      .then(r => r.json())
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  async function send() {
    const q = query.trim();
    if (!q || loading) return;
    setErr(""); setLoading(true);
    setHistory(h => [...h, { role: "user", text: q }]);
    setQuery("");

    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setHistory(h => [...h, { role: "agent", text: data.response ?? "(no response)" }]);
    } catch (e) {
      setErr("Could not reach ADK API on http://localhost:7999. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adk-wrap">
      <h2 className="adk-title">Test your onboarding agent</h2>
      <button className="back-btn" onClick={onBack}>← Back</button>

      {session && (
        <div className="session-chip">
          session: <code>{session?.session?.session_id ?? "unknown"}</code>
        </div>
      )}

      <div className="adk-console">
        <div className="adk-history">
          {history.map((m, i) => (
            <div key={i} className={`adk-msg ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="adk-input-row">
          <input
            className="adk-input"
            placeholder="Ask the onboarding agent…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => (e.key === "Enter" ? send() : null)}
          />
          <button className="send-btn" onClick={send} disabled={loading}>
            {loading ? "Sending…" : "Send"}
          </button>
        </div>

        {err && <div className="adk-err">{err}</div>}
      </div>
    </div>
  );
}
