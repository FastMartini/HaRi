import { useState } from "react";
import "./employer.css";

const AGENTS = [
  "Contract Agreement Agent",
  "Direct Deposit Agent",
  "Training Orchestrator",
  "FAQ / Policy Agent",
  "Background Check Agent",
  "Equipment Provisioning Agent"
];

export default function EmployerDashboard({ onConfirm = () => {} }) {
  const [selected, setSelected] = useState(new Set());

  function toggle(name) {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelected(next);
  }

  return (
    <div className="emp-wrap">
      <h2 className="emp-title">Configure your onboarding agents</h2>

      <div className="agents-grid">
        {AGENTS.map(name => (
          <button
            key={name}
            className={`get-started agent-btn ${selected.has(name) ? 'selected' : ''}`}
            onClick={() => toggle(name)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>

      {/* Confirm navigates to the test dashboard */}
      <button className="confirm-btn" onClick={onConfirm}>Confirm?</button>
    </div>
  );
}