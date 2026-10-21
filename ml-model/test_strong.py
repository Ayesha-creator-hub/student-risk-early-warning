from predict import predict_student

weak = {"age": 17, "studytime": 1, "failures": 2, "traveltime": 3,
        "goout": 4, "health": 3, "absences": 12, "G1": 7,
        "sex": "M", "address": "R", "schoolsup": "no", "famsup": "no",
        "higher": "yes", "internet": "no", "activities": "no"}

middle = {"age": 17, "studytime": 2, "failures": 0, "traveltime": 2,
          "goout": 3, "health": 3, "absences": 4, "G1": 10,
          "sex": "M", "address": "U", "schoolsup": "no", "famsup": "yes",
          "higher": "yes", "internet": "yes", "activities": "no"}

strong = {"age": 17, "studytime": 3, "failures": 0, "traveltime": 1,
          "goout": 2, "health": 4, "absences": 0, "G1": 16,
          "sex": "F", "address": "U", "schoolsup": "no", "famsup": "yes",
          "higher": "yes", "internet": "yes", "activities": "yes"}

print("strong:", predict_student(strong))
print("middle:", predict_student(middle))
print("weak:", predict_student(weak))