import "./employerProgress.css";

const EMPLOYEES = [
  { name: "Ava Thompson", progress: 80 },
  { name: "Liam Rivera", progress: 60 },
  { name: "Noah Patel", progress: 100 },
  { name: "Emma Chen", progress: 45 },
  { name: "Mason Garcia", progress: 70 },
  { name: "Olivia Kim", progress: 90 },
  { name: "Ethan Wright", progress: 55 },
  { name: "Sophia Lopez", progress: 85 },
  { name: "Jack Nguyen", progress: 30 },
  { name: "Mia Johnson", progress: 65 },
];

export default function EmployerProgress({ onBack }) {
  return (
    <div className="progress-wrap">
      <h2 className="progress-title">Employee Onboarding Progress</h2>
      <button className="back-btn" onClick={onBack}>← Back</button>

      <div className="employee-list">
        {EMPLOYEES.map((e, i) => (
          <div key={i} className="employee-row">
            <span className="emp-name">{e.name}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${e.progress}%` }}
              />
            </div>
            <span className="progress-text">{e.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
