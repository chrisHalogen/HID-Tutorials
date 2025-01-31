from main import firebaseApp
from pprint import pprint

result = firebaseApp.get("/students", "-OHwEmqkOHwz9a8Kme9Y")

pprint(result)
