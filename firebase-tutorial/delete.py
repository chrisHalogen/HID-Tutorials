from main import firebaseApp
from pprint import pprint

result = firebaseApp.delete("/students", "-OHwEmqkOHwz9a8Kme9Y")

print("Record Deleted")
