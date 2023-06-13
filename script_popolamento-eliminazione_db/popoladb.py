import pymongo

#Creo un client che si connette al db
client = pymongo.MongoClient("mongodb://localhost:27017/")

#Setto il nome dei databases da popolare

##Corsi
corsi = client["Corsi"]
corsos=corsi["corsos"]
daticorsi = [
    {"idcorso":0, "nome":"Yoga","sala":"1","data":"2023-06-15","orario":"17:30","istruttore":"Luciano Spalletti"},
    {"idcorso":1, "nome":"Pilates","sala":"2","data":"2023-06-15","orario":"18:30","istruttore":"Mario Merola"},
    {"idcorso":2, "nome":"Zumba","sala":"3","data":"2023-06-16","orario":"12:30","istruttore":"Carlo Calenda"},
    {"idcorso":3, "nome":"Functional","sala":"4","data":"2023-06-14","orario":"16:30","istruttore":"Pippo Baudo"},
    {"idcorso":4, "nome":"Dechiattimento","sala":"5","data":"2023-06-15","orario":"11:30","istruttore":"Lorenzo Insigne"},
    {"idcorso":5, "nome":"Kickboxing","sala":"6","data":"2023-06-13","orario":"08:30","istruttore":"Alberto Einstenio"},
    {"idcorso":6, "nome":"Boxe","sala":"7","data":"2023-06-19","orario":"18:30","istruttore":"Sergio Mattarella"}

]

##News
News = client["News"]
news = News["news"]
datinews = [
    {"id":0,"tipo":"GENERICA","data":"2023-06-18","testo":"Siamo falliti"},
    {"id":1,"tipo":"EVENTI","data":"2023-06-19","testo":"Ospite in palestra Diego Armando Maradona"},
    {"id":2,"tipo":"ORARI","data":"2023-06-20","testo":"Domani il centro sportivo sarà chiuso per indagare sull'omicidio nel parcheggio"},
    {"id":3,"tipo":"GENERICA","data":"2023-06-17","testo":"Cercasi receptionist da sfruttare"},
    {"id":4,"tipo":"GENERICA","data":"2023-06-18","testo":"Questo sito è veramente una schifezza"},
    {"id":5,"tipo":"EVENTI","data":"2023-06-15","testo":"Mercoledì 19 sarà organizzata una lotta clandestina negli spogliatoi degli uomini "},
    {"id":6,"tipo":"ORARI","data":"2023-06-17","testo":"La palestra chiuderà alle 18 a causa dello sciopero della fame dell'istruttore di sala"}
]

#Popolamento
corsos.insert_many(daticorsi)
news.insert_many(datinews)

#Clearo le risorse
client.close()