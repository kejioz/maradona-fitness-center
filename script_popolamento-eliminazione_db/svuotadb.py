import pymongo

#Creo un client che si connette al db
client = pymongo.MongoClient("mongodb://localhost:27017/")

#Setto il nome dei databases da svuotare

##Corsi
corsi = client["Corsi"]
corsos=corsi["corsos"]

##News
News = client["News"]
news = News["news"]

##Prenotazioni
Prenotazioni = client["Prenotazioni"]
prens = Prenotazioni["prens"]

corsos.delete_many({})
news.delete_many({})
prens.delete_many({})