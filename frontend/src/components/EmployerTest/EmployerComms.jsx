import { useState } from "react";
import "./employerComms.css";

const EMPLOYEES = [
  "Ava Thompson","Liam Rivera","Noah Patel","Emma Chen","Mason Garcia",
  "Olivia Kim","Ethan Wright","Sophia Lopez","Jack Nguyen","Mia Johnson"
];

export default function EmployerComms({ onBack = () => {} }) {
  const [selected, setSelected] = useState(EMPLOYEES[0]);
  const [input, setInput] = useState("");
  const [threads, setThreads] = useState(
    Object.fromEntries(EMPLOYEES.map(n => [n, [
      { from: "HR", text: `Welcome ${n.split(" ")[0]}! Let us know if you need help.` }
    ]]))
  );

  function send() {
    const msg = input.trim();
    if (!msg) return;
    setThreads(t => ({
      ...t,
      [selected]: [...t[selected], { from: "HR", text: msg }]
    }));
    setInput("");
  }

  return (
    <div className="comms-wrap">
      <h2 className="comms-title">Communicate with Employees</h2>
      <button className="back-btn" onClick={onBack}>← Back</button>

      <div className="comms-grid">
        {/* Left: roster */}
        <aside className="roster">
          {EMPLOYEES.map(n => (
            <button
              key={n}
              className={`roster-item ${selected === n ? "active" : ""}`}
              onClick={() => setSelected(n)}
            >
              <span className="avatar">{n[0]}</span>
              <span className="name">{n}</span>
            </button>
          ))}
        </aside>

        {/* Right: thread */}
        <section className="thread">
          <header className="thread-head">
            <div className="avatar big">{selected[0]}</div>
            <div className="who">
              <div className="n">{selected}</div>
              <div className="sub">Direct message</div>
            </div>
          </header>

          <div className="msgs">
            {threads[selected].map((m, i) => (
              <div key={i} className={`msg ${m.from === "HR" ? "out" : "in"}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="composer">
            <input
              className="compose-input"
              placeholder={`Message ${selected.split(" ")[0]}…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => (e.key === "Enter" ? send() : null)}
            />
            <button className="send-btn" onClick={send}>Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}
