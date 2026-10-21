from predict import predict_student

strong = {"age": 17, "Medu": 4, "Fedu": 4, "studytime": 3, "failures": 0,
          "goout": 2, "health": 4, "absences": 0, "G1": 16,
          "sex": "F", "address": "U", "schoolsup": "no",
          "famsup": "yes", "higher": "yes", "internet": "yes"}

middle = {"age": 17, "Medu": 2, "Fedu": 2, "studytime": 2, "failures": 0,
          "goout": 3, "health": 3, "absences": 4, "G1": 10,
          "sex": "M", "address": "U", "schoolsup": "no",
          "famsup": "yes", "higher": "yes", "internet": "yes"}

print("strong:", predict_student(strong))
print("middle:", predict_student(middle))