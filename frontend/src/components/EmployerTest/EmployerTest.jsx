import "./employerTest.css";

export default function EmployerTest() {
  return (
    <div className="emp-wrap">
      <h2 className="emp-title">You’re all set!</h2>
      <p className="emp-sub">
        Share your company key with employees so they can begin their onboarding process.
      </p>

      <div className="emp-actions">
        <h3 className="actions-title">What you can do next:</h3>
        <div className="actions-buttons">
          <button className="action-btn">Test your onboarding agents</button>
          <button className="action-btn">View employees and track their progress</button>
          <button className="action-btn">Upload or manage documents/modules</button>
          <button className="action-btn">Update or rotate your company login key</button>
          <button className="action-btn">Communicate with employees for support</button>
        </div>
      </div>
    </div>
  );
}
