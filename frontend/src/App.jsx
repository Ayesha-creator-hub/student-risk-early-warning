import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

const FIELDS = [
  { name: "student_name", label: "Student name", type: "text" },
  { name: "age", label: "Age", type: "number", min: 15, max: 22 },
  { name: "sex", label: "Sex", type: "select", options: ["F", "M"] },
  { name: "address", label: "Address", type: "select", options: ["U", "R"] },
  { name: "Medu", label: "Mother's education (0-4)", type: "number", min: 0, max: 4 },
  { name: "Fedu", label: "Father's education (0-4)", type: "number", min: 0, max: 4 },
  { name: "studytime", label: "Weekly study time (1-4)", type: "number", min: 1, max: 4 },
  { name: "failures", label: "Past failures (0-4)", type: "number", min: 0, max: 4 },
  { name: "schoolsup", label: "Extra school support", type: "select", options: ["yes", "no"] },
  { name: "famsup", label: "Family support", type: "select", options: ["yes", "no"] },
  { name: "higher", label: "Wants higher education", type: "select", options: ["yes", "no"] },
  { name: "internet", label: "Internet at home", type: "select", options: ["yes", "no"] },
  { name: "goout", label: "Going out (1-5)", type: "number", min: 1, max: 5 },
  { name: "health", label: "Health (1-5)", type: "number", min: 1, max: 5 },
  { name: "absences", label: "Absences", type: "number", min: 0, max: 100 },
  { name: "G1", label: "First period grade (0-20)", type: "number", min: 0, max: 20 },
];

const EMPTY = {
  student_name: "", age: 17, sex: "F", address: "U", Medu: 2, Fedu: 2, studytime: 2,
  failures: 0, schoolsup: "no", famsup: "yes", higher: "yes", internet: "yes",
  goout: 3, health: 3, absences: 0, G1: 10,
};

export default function App() {
  const [tab, setTab] = useState("predict");
  return (
    <div className="app">
      <header>
        <h1>Student Risk Early Warning</h1>
        <nav>
          {["predict", "history", "dashboard"].map((t) => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === "predict" && <Predict />}
        {tab === "history" && <History />}
        {tab === "dashboard" && <Dashboard />}
      </main>
    </div>
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
    FIELDS.filter((f) => f.type === "number").forEach((f) => (payload[f.name] = Number(payload[f.name])));
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
                {f.options.map((o) => <option key={o}>{o}</option>)}
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
  useEffect(() => { fetch(`${API}/stats`).then((r) => r.json()).then(setS).catch(() => {}); }, []);
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