//Dichiarazione variabili per l'utilizzo dei moduli node richiesti per creare un server
var http = require("http")
var express = require("express")
var mongoose = require("mongoose")
const exp = require("constants")
const { ok } = require("assert")
var app = express() //Crea un'applicazione Express

//Configurazione middleware
app.use(express.urlencoded({extended: true})); //Permette di ricevere i JSON come array o stringhe
app.use(express.static(__dirname+"/root_admin")) //Setta la root di base alla directory specificata


//Creazioni database Mongo
const news = mongoose.createConnection("mongodb://127.0.0.1:27017/News"); //Creo la connessione per l'istanza del database News

const pren= mongoose.createConnection("mongodb://127.0.0.1:27017/Prenotazioni"); //Creo la connessione per l'istanza del database Prenotazioni

const corsi = mongoose.createConnection("mongodb://127.0.0.1:27017/Corsi"); //Creo la connessione per l'istanza del database Corsi

//Definizione schema Mongoose per le News
var newsSchema = mongoose.Schema({ //Una news ha un id (contatore automatico),una data, un testo e un tipo per differenziare ognuna.
    id: Number,
    data: String, 
    tipo: {
        type: [String],
        enum: ["EVENTI", "ORARI", "GENERICA"],
        default: 'GENERICA'
    }, 
    testo: String
})

//Definizione schema Mongoose per le prenotazioni
var prenSchema = mongoose.Schema({  //Una prenotazione ha un id (contatore automatico), uno stato che viene gestito dall'operatore, ed un corso a cui si riferisce
    idpren: Number, 
    stato: {
        type: [String],
        enum: ["ACCETTATA", "RIFIUTATA", "ATTESA"],
        default: 'ATTESA'
    },
    corso: {idcorso: Number, nome:String, sala: String, data: String, orario: String}
})


//Definizione schema Mongoose per i corsi
var corsiSchema = mongoose.Schema({  //Un corso ha un id (contatore automatico), un nome, una sala in cui viene svolto, una data ed un orario, ed un istruttore
    idcorso: Number,
    nome: String,
    sala: String, 
    data: String,
    orario: String, 
    istruttore: String
})

//Creazione modelli per gli schemi
var Corso = corsi.model("Corso", corsiSchema);

var News = news.model("News", newsSchema);

var Pren = pren.model("Pren", prenSchema);

//Contatori per automatizzare l'incremento degli id delle news e dei corsi
var idnews=0;
var idcourse=0;

News.find({},(err,result)=>{    //Trovo l'id massimo delle news
    var max =-1;
    result.forEach((el)=>{
        if (el.id>max){
            max=el.id;
        }
    });
    idnews=max;
    console.log("Maximum news ID : "+max);
})

Corso.find({},(err,result)=>{    //Trovo l'id massimo dei corsi
    var max =-1;
    result.forEach((el)=>{
        if (el.idcorso>max){
            max=el.idcorso;
        }
    });
    idcourse=max;
    console.log("Maximum course ID : "+max);
})

//Creazione connessione

http.createServer(app).listen(4002);    //Creo un server sul porto 4002 e gli passo l'app express

//Operazioni e metodi


//Post - permette all'operatore di aggiungere delle news
app.post("/inserisciNews", (req, res)=>{

    //Creo un oggetto news secondo il modello definito
    var newNews = new News({id: Number(++idnews), data:req.body.data, tipo: req.body.tipo, testo:req.body.testo});

    //Salvo la news
    newNews.save().then(()=>{
        //Una volta salvata mando un ack
        res.status(200).json(newNews);
    })

});

//Get - permette all'operatore di visualizzare le news postate
app.get("/getNews", (req, res)=>{

    //Effettuo una find all'interno del database senza filtrare per predicati, al fine di ottenere tutte le news
    News.find({}).then((ok)=>{
        //Ok rappresenta un array di news che viene ritornato
        if(ok.length!=0){
            res.status(200).json(ok)    //Se ci sono news mando un ack
        } else {
            res.status(404).json(ok);   //Altrimenti mando un 404
        }
    })
    
});

//Delete - permette all'operatore di cancellare una news dalla lista delle news postate
app.delete("/deleteNews", (req, res)=>{

    //Effettuo la find della news desiderata all'interno del database
    News.findOneAndDelete(req.body).then((ok)=>{
        //Ok rappresenta la news che viene cancellata, mi serve per la diagnostica
        if(ok!=null){
            res.status(200).json(ok);   //Se viene trovata mando ack
        } else {
            res.status(404).json(ok);   //Altrimenti mando un 404
        }
    });

});

//Post - permette all'operatore di aggiungere un corso
app.post("/inserisciCorso", (req, res)=>{

    //Creo un oggetto corso secondo il modello definito
    var newCorso = new Corso({idcorso:Number(++idcourse), nome:req.body.nome, sala:req.body.sala, data:req.body.data, orario: req.body.orario, istruttore: req.body.istruttore});

    //Salvo il corso
    newCorso.save().then(()=>{
        //Una volta salvato mando un ack
        res.status(200).json(newCorso);
    });

});

//Get - permette all'operatore di visualizzare i corsi
app.get("/getCorsi", (req, res)=>{

     //Effettuo una find all'interno del database senza filtrare per predicati, al fine di ottenere tutti i corsi
    Corso.find({}).then((corsi)=>{
        if(corsi.length!=0){
            res.status(200).json(corsi);    //Se ci sono corsi mando un ack
        } else{
            res.status(404).json(corsi);    //Altrimenti mando un 404
        }
    })

});

//Delete - permette all'operatore di cancellare un corso dalla lista dei corsi
app.delete("/deleteCorso", (req, res)=>{

    //Effettuo la find del corso desiderato all'interno del database
    Corso.findOneAndDelete(req.body).then((ok)=>{
        // Ok rappresenta il corso che viene cancellato, lo usiamo per il check degli errori!
        console.log(ok);
        if(ok!=null){
            //Quando viene cancellato un corso bisogna cancellare anche la relativa prenotazione
            Pren.findOneAndDelete({"corso.idcorso":ok.idcorso}).then(()=>{
                res.status(200).json(ok);   //Se viene trovato mando ack
            })

        } else {
            res.status(404).json(ok);   //Altrimenti mando un messaggio di errore con stato 404
        }
    });

});

//Get - permette all'operatore di visualizzare le prenotazioni filtrando per lo status
app.get("/getPrenotazioni/:status",(req,res)=>{

    //Effettuo la find delle prenotazioni nello stato richiesto all'interno del database 
    Pren.find({"stato":req.params.status.toString().toUpperCase()}).then((prenotazioni)=>{
        if (prenotazioni.length!=0){
            res.status(200).json(prenotazioni);     //Se ci sono prenotazioni con quello status mando un ack
        }else{
            res.status(404).json(prenotazioni);     //Altrimenti mando un 404
        }
    })

})

//Get - permette all'operatore di visualizzare tutte le prenotazioni
app.get("/getPrenotazioni",(req,res)=>{

    //Effettuo la find delle prenotazioni all'interno del database 
    Pren.find({}).then((prenotazioni)=>{
        if (prenotazioni.length!=0){
            res.status(200).json(prenotazioni);     //Se ci sono prenotazioni mando un ack
        }else{
            res.status(404).json(prenotazioni);     //Altrimenti mando un 404
        }
    })

})

//Put - permette all'operatore di cambiare lo stato di una prenotazione in accettata
app.put("/accettaPrenotazione",(req,res)=>{

    //Cerco la prenotazione nel database e cambio lo stato in accettata
    Pren.findOneAndUpdate({"idpren":req.body.idpren},{"stato":"ACCETTATA"},(ok)=>{
        res.status(200).json(req.body);
    })


})

//Put - permette all'operatore di cambiare lo stato di una prenotazione in rifiutata
app.put("/rifiutaPrenotazione",(req,res)=>{

    //Cerco la prenotazione nel database e cambio lo stato in accettata
    Pren.findOneAndUpdate({"idpren":req.body.idpren},{"stato":"RIFIUTATA"},(ok)=>{
        res.status(200).json(req.body);
    })


})