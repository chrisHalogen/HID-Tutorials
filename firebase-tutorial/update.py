from main import firebaseApp
from pprint import pprint

result = firebaseApp.put("/students/-OHwEmqkOHwz9a8Kme9Y", "height", 3.25)

pprint(result)
