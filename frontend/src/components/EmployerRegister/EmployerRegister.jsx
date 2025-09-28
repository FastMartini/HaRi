import { useState } from "react";
import "./employerRegister.css";

export default function EmployerRegister({ onContinue = () => {} }) {
  const [form, setForm] = useState({
    company: "",
    domain: "",
    size: "",
    industry: "",
    contactName: "",
    contactEmail: ""
  });
  const [err, setErr] = useState("");

  function update(k, v){ setForm(f => ({ ...f, [k]: v })); }

  function submit(){
    if (!form.company.trim()) return setErr("Please enter your company name.");
    if (!form.domain.trim()) return setErr("Please enter your company email domain.");
    if (!form.size.trim()) return setErr("Please select a company size.");
    if (!form.industry.trim()) return setErr("Please select a company type.");
    if (!form.contactName.trim()) return setErr("Enter a contact name.");
    if (!form.contactEmail.trim()) return setErr("Enter a contact email.");
    // POC: no persistence, just continue
    onContinue();
  }

  return (
    <div className="reg-wrap">
      <h2 className="reg-title">Register your company</h2>
      <p className="reg-sub">We’ll link your employer tools to this company profile.</p>

      <div className="reg-grid">
        <input
          className="reg-input"
          placeholder="Company name"
          value={form.company}
          onChange={e=>{update("company", e.target.value); setErr("");}}
        />

        <input
          className="reg-input"
          placeholder="Company email domain (e.g. company.com)"
          value={form.domain}
          onChange={e=>{update("domain", e.target.value); setErr("");}}
        />

        <select
          className="reg-input"
          value={form.size}
          onChange={e=>update("size", e.target.value)}
        >
          <option value="">Company size</option>   {/* placeholder */}
          <option>1-10</option>
          <option>11-50</option>
          <option>51-200</option>
          <option>201-500</option>
          <option>501-1000</option>
          <option>1000+</option>
        </select>

        <select
          className="reg-input"
          value={form.industry}
          onChange={e=>update("industry", e.target.value)}
        >
          <option value="">Company type</option>   {/* placeholder */}
          <option>Technology</option>
          <option>Finance</option>
          <option>Healthcare</option>
          <option>Education</option>
          <option>Retail</option>
          <option>Other</option>
        </select>

        <input
          className="reg-input"
          placeholder="Primary contact name"
          value={form.contactName}
          onChange={e=>{update("contactName", e.target.value); setErr("");}}
        />

        <input
          className="reg-input"
          placeholder="Primary contact email"
          value={form.contactEmail}
          onChange={e=>{update("contactEmail", e.target.value); setErr("");}}
        />
      </div>

      <button className="get-started" onClick={submit}>Continue</button>
      {err && <div className="reg-err">{err}</div>}
    </div>
  );
}
