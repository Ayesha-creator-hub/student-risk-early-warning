import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

from db import get_connection, init_db
from predict import predict_student

app = Flask(__name__)
CORS(app)
init_db()

RANGES = {"age": (15, 22), "Medu": (0, 4), "Fedu": (0, 4), "studytime": (1, 4),
          "failures": (0, 4), "goout": (1, 5), "health": (1, 5),
          "absences": (0, 100), "G1": (0, 20)}
CATS = {"sex": ["F", "M"], "address": ["U", "R"], "schoolsup": ["yes", "no"],
        "famsup": ["yes", "no"], "higher": ["yes", "no"], "internet": ["yes", "no"]}

def validate(data):
    for k, (lo, hi) in RANGES.items():
        if k not in data or not isinstance(data[k], (int, float)):
            return f"'{k}' is required and must be a number"
        if not lo <= data[k] <= hi:
            return f"'{k}' must be between {lo} and {hi}"
    for k, options in CATS.items():
        if data.get(k) not in options:
            return f"'{k}' must be one of {options}"
    return None

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    name = str(data.pop("student_name", "")).strip()
    if not name:
        return jsonify({"error": "Student name is required"}), 400
    error = validate(data)
    if error:
        return jsonify({"error": error}), 400

    result = predict_student(data)

    conn = get_connection()
    cur = conn.execute(
        "INSERT INTO predictions (student_name, inputs, risk_percent, risk_level, recommendation, created_at) "
        "VALUES (?,?,?,?,?,?)",
        (name, json.dumps(data), result["risk_percent"], result["risk_level"],
         result["recommendation"], datetime.now().strftime("%Y-%m-%d %H:%M")))
    conn.commit()
    result["id"] = cur.lastrowid
    conn.close()
    return jsonify(result)

@app.route("/predictions", methods=["GET"])
def list_predictions():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM predictions ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/predictions/<int:pid>", methods=["PATCH"])
def update_status(pid):
    status = (request.get_json(silent=True) or {}).get("status")
    if status not in ["Open", "In Progress", "Resolved"]:
        return jsonify({"error": "Invalid status"}), 400
    conn = get_connection()
    conn.execute("UPDATE predictions SET status=? WHERE id=?", (status, pid))
    conn.commit()
    conn.close()
    return jsonify({"id": pid, "status": status})

@app.route("/stats", methods=["GET"])
def stats():
    conn = get_connection()
    rows = conn.execute("SELECT risk_level, status FROM predictions").fetchall()
    conn.close()
    return jsonify({
        "total": len(rows),
        "high": sum(r["risk_level"] == "High" for r in rows),
        "medium": sum(r["risk_level"] == "Medium" for r in rows),
        "low": sum(r["risk_level"] == "Low" for r in rows),
        "open_followups": sum(r["status"] != "Resolved" and r["risk_level"] != "Low" for r in rows),
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)