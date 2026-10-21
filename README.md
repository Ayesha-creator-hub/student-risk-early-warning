# Student Risk Early Warning System

A web system that predicts whether a student is at risk of failing, using an
Artificial Neural Network (MLP). Advisors enter a student's details, get a risk
score and a recommendation, and track follow-up on flagged students.

## How it works
Colab notebook (training) -> Keras model -> Flask API + SQLite -> React frontend

## Features
- Risk prediction from 15 student features, returning a risk score, level (Low / Medium / High) and recommendation
- History of all predictions with a follow-up status (Open / In Progress / Resolved)
- Dashboard with totals and risk distribution
- Input validation on the API

## Model
- Dataset: UCI Student Performance (Math course, 395 students), CC BY 4.0
- Target: at risk = final grade (G3) below 10 out of 20
- G2 (second period grade) is deliberately excluded so the system works as an early warning
- Architecture: Dense(64) -> Dropout(0.3) -> Dense(32) -> Dropout(0.2) -> Dense(1, sigmoid), with class weights and early stopping

### Results (20% test set, 79 students)
| Model | At-risk precision | At-risk recall | At-risk F1 | Accuracy |
|---|---|---|---|---|
| Logistic regression (baseline) | 0.82 | 0.69 | 0.75 | 0.85 |
| ANN | 0.69 | 0.85 | 0.76 | 0.82 |

The ANN catches more at-risk students (higher recall), at the cost of more false
alarms, which suits an early warning use case.

## Run it

Backend (Python 3.13 was used; TensorFlow 2.21, scikit-learn 1.6.1):

    cd ml-model
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    python app.py

Frontend (in a second terminal):

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173. The backend runs on http://localhost:5000 and
creates `risk.db` on first run.

## Retrain
Open `notebooks/train.ipynb` in Google Colab, upload `ml-model/data/student-mat.csv`,
run all cells, and copy the three downloaded files (`risk_model.keras`,
`preprocessor.joblib`, `feature_columns.json`) into `ml-model/`.
Use the same scikit-learn version as in requirements.txt.


## Data source
P. Cortez and A. Silva. Using Data Mining to Predict Secondary School Student
Performance. FUBUTEC 2008. https://archive.ics.uci.edu/dataset/320/student+performance

### Experiment 2: higher-education dataset
UCI "Predict Students' Dropout and Academic Success" (4,424 undergraduate
students, 885 in the test set). At risk = Dropout. Second-semester
information excluded; first-semester information included.

| Model | At-risk precision | At-risk recall | At-risk F1 | Accuracy |
|---|---|---|---|---|
| Logistic regression | 0.85 | 0.70 | 0.77 | 0.87 |
| ANN | 0.79 | 0.74 | 0.76 | 0.85 |

The ANN identified 210 of 284 dropouts (74 missed, 56 false alarms). Overall
performance is similar to logistic regression; the ANN trades some precision
for higher recall. The web app uses the model from the first experiment.