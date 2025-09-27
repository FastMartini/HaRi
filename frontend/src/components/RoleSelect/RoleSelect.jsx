import "./roleselect.css";

export default function RoleSelect() {
  return (
    <div className="role-wrap">
      <h2 className="role-title">Are you an employer or an employee?</h2>
      <div className="role-buttons">
        <button className="get-started">I’m an Employer</button>
        <button className="get-started">I’m an Employee</button>
      </div>
    </div>
  );
}