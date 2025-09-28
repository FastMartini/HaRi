import "./employee.css";

export default function EmployeeDashboard() {
  return (
    <div className="emp-wrap">
      <h2 className="emp-title">Welcome to your dashboard</h2>

      <div className="emp-grid">
        <section className="emp-card">
          <h3>Next Steps</h3>
          <ol>
            <li>Sign NDA</li>
            <li>Set Up Direct Deposit</li>
            <li>Training Module 1</li>
          </ol>
          <button className="get-started">Start Onboarding</button>
        </section>

        <section className="emp-card">
          <h3>Quick Help</h3>
          <p>Have a question about PTO, benefits, or payroll?</p>
          <button className="get-started">Ask a Question</button>
        </section>
      </div>
    </div>
  );
}
