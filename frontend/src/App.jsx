import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

const STUDY_TIME = [
  { value: 1, label: "Less than 2 hours" },
  { value: 2, label: "2 to 5 hours" },
  { value: 3, label: "5 to 10 hours" },
  { value: 4, label: "More than 10 hours" },
];
const EDUCATION = [
  { value: 0, label: "None" },
  { value: 1, label: "Primary (4th grade)" },
  { value: 2, label: "5th to 9th grade" },
  { value: 3, label: "Secondary education" },
  { value: 4, label: "Higher education" },
];
const GO_OUT = [
  { value: 1, label: "1 - Very low" },
  { value: 2, label: "2 - Low" },
  { value: 3, label: "3 - Medium" },
  { value: 4, label: "4 - High" },
  { value: 5, label: "5 - Very high" },
];
const HEALTH = [
  { value: 1, label: "1 - Very bad" },
  { value: 2, label: "2 - Bad" },
  { value: 3, label: "3 - Average" },
  { value: 4, label: "4 - Good" },
  { value: 5, label: "5 - Very good" },
];
const TRAVEL_TIME = [
  { value: 1, label: "Less than 15 minutes" },
  { value: 2, label: "15 to 30 minutes" },
  { value: 3, label: "30 minutes to 1 hour" },
  { value: 4, label: "More than 1 hour" },
];

const FIELDS = [
  { name: "student_name", label: "Student name", type: "text" },
  { name: "age", label: "Age", type: "number", min: 15, max: 22 },
  { name: "sex", label: "Sex", type: "select", options: ["F", "M"] },
  { name: "address", label: "Address (U = urban, R = rural)", type: "select", options: ["U", "R"] },
  { name: "studytime", label: "Weekly study time", type: "select", numeric: true, options: STUDY_TIME },
  { name: "failures", label: "Past failures (0-4)", type: "number", min: 0, max: 4 },
  { name: "traveltime", label: "Travel time from home to school", type: "select", numeric: true, options: TRAVEL_TIME },
  { name: "activities", label: "Extra-curricular activities", type: "select", options: ["yes", "no"] },
  { name: "schoolsup", label: "Extra school support", type: "select", options: ["yes", "no"] },
  { name: "famsup", label: "Family support", type: "select", options: ["yes", "no"] },
  { name: "higher", label: "Wants higher education", type: "select", options: ["yes", "no"] },
  { name: "internet", label: "Internet at home", type: "select", options: ["yes", "no"] },
  { name: "goout", label: "Going out with friends", type: "select", numeric: true, options: GO_OUT },
  { name: "health", label: "Health", type: "select", numeric: true, options: HEALTH },
  { name: "absences", label: "Absences", type: "number", min: 0, max: 100 },
  { name: "G1", label: "First period grade (0-20)", type: "number", min: 0, max: 20 },
];

const EMPTY = {
  student_name: "", age: 17, sex: "F", address: "U", studytime: 2,
  failures: 0, traveltime: 1, activities: "no", schoolsup: "no", famsup: "yes",
  higher: "yes", internet: "yes", goout: 3, health: 3, absences: 0, G1: 10,
};

const ROLES = {
  teacher: { label: "Teacher", tabs: ["predict"], text: "Enter a student's details and get a risk score." },
  advisor: { label: "Advisor", tabs: ["predict", "history", "dashboard"], text: "Predict, review the history and follow up on at-risk students." },
};

export default function App() {
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("predict");

  if (!role) {
    return (
      <div className="app">
        <h1 className="center">Student Risk Early Warning</h1>
        <p className="center muted">Choose how you want to continue</p>
        <div className="roles">
          {Object.entries(ROLES).map(([key, r]) => (
            <button key={key} className="role-card" onClick={() => { setRole(key); setTab("predict"); }}>
              <b>Continue as {r.label}</b>
              <span>{r.text}</span>
            </button>
          ))}
        </div>
        <Note />
      </div>
    );
  }

  const tabs = ROLES[role].tabs;
  return (
    <div className="app">
      <header>
        <h1>Student Risk Early Warning</h1>
        <nav>
          {tabs.map((t) => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
          <span className="role-badge">{ROLES[role].label}</span>
          <button className="switch" onClick={() => setRole(null)}>Switch role</button>
        </nav>
      </header>
      <main>
        {tab === "predict" && <Predict />}
        {tab === "history" && <History />}
        {tab === "dashboard" && <Dashboard />}
      </main>
      <Note />
    </div>
  );
}

function Note() {
  return (
    <p className="note">
      Prototype trained on public secondary-school data (UCI Student Performance).
      The risk score is a model output, not a true probability, and is meant to
      support advisors, not to label students. Roles are simulated (no login).
    </p>
  );
}

function Predict() {
  const [form, setForm] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    const payload = { ...form };
    FIELDS.filter((f) => f.type === "number" || f.numeric).forEach((f) => (payload[f.name] = Number(payload[f.name])));
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Cannot reach the backend. Is Flask running on port 5000?" : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <form onSubmit={submit} className="grid">
        {FIELDS.map((f) => (
          <label key={f.name}>
            {f.label}
            {f.type === "select" ? (
              <select value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                {f.options.map((o) => {
                  const value = typeof o === "object" ? o.value : o;
                  const label = typeof o === "object" ? o.label : o;
                  return <option key={value} value={value}>{label}</option>;
                })}
              </select>
            ) : (
              <input
                type={f.type} min={f.min} max={f.max} required
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              />
            )}
          </label>
        ))}
        <button type="submit" disabled={loading}>{loading ? "Analyzing..." : "Predict risk"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className={`result ${result.risk_level}`}>
          <h2>{result.risk_level} risk: {result.risk_percent}%</h2>
          <p>{result.recommendation}</p>
        </div>
      )}
    </div>
  );
}

function History() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const load = () =>
    fetch(`${API}/predictions`).then((r) => r.json()).then(setRows).catch(() => setError("Cannot reach the backend."));
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    await fetch(`${API}/predictions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const shown = rows.filter((r) => filter === "All" || r.risk_level === filter);
  return (
    <div className="card">
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        {["All", "High", "Medium", "Low"].map((o) => <option key={o}>{o}</option>)}
      </select>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Student</th><th>Risk</th><th>Level</th><th>Date</th><th>Follow-up</th></tr></thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id}>
              <td>{r.student_name}</td>
              <td>{r.risk_percent}%</td>
              <td><span className={`badge ${r.risk_level}`}>{r.risk_level}</span></td>
              <td>{r.created_at}</td>
              <td>
                <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                  {["Open", "In Progress", "Resolved"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {shown.length === 0 && <p>No records yet.</p>}
    </div>
  );
}

function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { fetch(`${API}/stats`).then((r) => r.json()).then(setS).catch(() => { }); }, []);
  if (!s) return <div className="card">Loading... (is the backend running?)</div>;
  const bar = (n) => (s.total ? (n / s.total) * 100 : 0);
  return (
    <div className="card">
      <div className="stats">
        <div><b>{s.total}</b><span>Students analyzed</span></div>
        <div><b>{s.high}</b><span>High risk</span></div>
        <div><b>{s.open_followups}</b><span>Open follow-ups</span></div>
      </div>
      {[["High", s.high], ["Medium", s.medium], ["Low", s.low]].map(([label, n]) => (
        <div key={label} className="barrow">
          <span>{label} ({n})</span>
          <div className="track"><div className={`fill ${label}`} style={{ width: `${bar(n)}%` }} /></div>
        </div>
      ))}
    </div>
  );
}