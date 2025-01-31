from main import firebaseApp
from pprint import pprint

result = firebaseApp.get("/students", None)

pprint(result)
