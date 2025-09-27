import "./roleselect.css";

export default function RoleSelect({ onSelect = () => {} }) {
  return (
    <div className="role-wrap">
      <h2 className="role-title">Are you an employer or an employee?</h2>
      <div className="role-buttons">
        <button className="get-started" onClick={() => onSelect('employer')}>I’m an Employer</button>
        <button className="get-started" onClick={() => onSelect('employee')}>I’m an Employee</button>
      </div>
    </div>
  );
}
