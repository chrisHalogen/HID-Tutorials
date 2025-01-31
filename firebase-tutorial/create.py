from main import firebaseApp
from pprint import pprint

# Create Function

data = {"name": "Emmanuel", "age": 24, "height": 3.86, "school": "LASU"}

result = firebaseApp.post("/students", data)

pprint(result)
