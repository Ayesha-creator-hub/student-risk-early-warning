import requests

body = {
    "student_name": "Test Student",
    "age": 17, "studytime": 1, "failures": 2, "traveltime": 3,
    "goout": 4, "health": 3, "absences": 12, "G1": 7,
    "sex": "M", "address": "R", "schoolsup": "no", "famsup": "no",
    "higher": "yes", "internet": "no", "activities": "no",
}

r = requests.post("http://localhost:5000/predict", json=body)
print(r.status_code, r.json())

bad = dict(body, age=40)
r = requests.post("http://localhost:5000/predict", json=bad)
print(r.status_code, r.json())