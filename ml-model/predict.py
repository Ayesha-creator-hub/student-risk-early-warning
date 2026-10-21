import json
import joblib
import pandas as pd
import tensorflow as tf

_model = _pre = _cols = None

def _load():
    global _model, _pre, _cols
    if _model is None:
        _model = tf.keras.models.load_model("risk_model.keras")
        _pre = joblib.load("preprocessor.joblib")
        with open("feature_columns.json") as f:
            _cols = json.load(f)
    return _model, _pre, _cols

def predict_student(data: dict):
    model, pre, cols = _load()
    row = pd.DataFrame([data])[cols]
    x = pre.transform(row).astype("float32")
    p = float(model.predict(x, verbose=0)[0][0])

    if p >= 0.7:
        level, advice = "High", "Arrange an advisor meeting and academic support now."
    elif p >= 0.4:
        level, advice = "Medium", "Monitor closely and encourage tutoring."
    else:
        level, advice = "Low", "No action needed."

    return {"risk_percent": round(p * 100, 1), "risk_level": level, "recommendation": advice}

if __name__ == "__main__":
    sample = {"age": 17, "Medu": 2, "Fedu": 2, "studytime": 1, "failures": 2,
              "goout": 4, "health": 3, "absences": 12, "G1": 7,
              "sex": "M", "address": "R", "schoolsup": "no",
              "famsup": "no", "higher": "yes", "internet": "no"}
    print(predict_student(sample))