import { useState } from "react";
import "./employerTest.css";
import EmployerProgress from "./EmployerProgress";
import EmployerComms from "./EmployerComms";
import EmployerDocs from "./EmployerDocs";
import EmployerKeyRotate from "./EmployerKeyRotate";
import AdkConsole from "./AdkConsole"; // <-- add

export default function EmployerTest() {
  const [view, setView] = useState("main"); // 'main' | 'progress' | 'comms' | 'docs' | 'keys' | 'adk'

  if (view === "progress") return <EmployerProgress onBack={() => setView("main")} />;
  if (view === "comms")    return <EmployerComms onBack={() => setView("main")} />;
  if (view === "docs")     return <EmployerDocs onBack={() => setView("main")} />;
  if (view === "keys")     return <EmployerKeyRotate onBack={() => setView("main")} />;
  if (view === "adk")      return <AdkConsole onBack={() => setView("main")} />; // <-- show console

  return (
    <div className="emp-wrap">
      <h2 className="emp-title">You’re all set!</h2>
      <p className="emp-sub">
        Share your company key with employees so they can begin their onboarding process.
      </p>

      <div className="emp-actions">
        <h3 className="actions-title">What you can do next:</h3>
        <div className="actions-buttons">
          <button className="action-btn" onClick={() => setView("adk")}>
            Test your onboarding agents
          </button>
          <button className="action-btn" onClick={() => setView("progress")}>
            View employees and track their progress
          </button>
          <button className="action-btn" onClick={() => setView("docs")}>
            Upload or manage documents/modules
          </button>
          <button className="action-btn" onClick={() => setView("keys")}>
            Update or rotate your company login key
          </button>
          <button className="action-btn" onClick={() => setView("comms")}>
            Communicate with employees for support
          </button>
        </div>
      </div>
    </div>
  );
}
