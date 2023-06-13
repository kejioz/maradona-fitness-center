//Dichiarazione variabili per l'utilizzo dei moduli node richiesti per creare un server
var http = require("http")
var express = require("express")
var mongoose = require("mongoose")
const exp = require("constants")
const { ok } = require("assert")
var app = express() //Crea un'applicazione Express

//Configurazione middleware
app.use(express.urlencoded({extended: true})); //Permette di ricevere i JSON come array o stringhe
app.use(express.static(__dirname+"/root_cliente")) //Setta la root di base alla directory specificata

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
    corso: {idcorso: Number, nome: String, sala: String, data: String, orario: String}
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

//Contatore per l'id delle prenotazioni
var idpren=0;

Pren.find({},(error,result)=>{
    var max=-1;
    result.forEach((el)=>{
        if (el.idpren>max){
            max=el.idpren;
        }
    });
    idpren=max;
    console.log("Maximum pren ID : "+max);
})

//Creazione connessione

http.createServer(app).listen(4000); //Creo un server sul porto 4000 e gli passo l'app express   

//Get - permette al cliente di visualizzare le news postate dall'amministratore
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

//Get - permette al cliente di visualizzare i corsi disponibili
app.get("/getCorsi", (req, res)=>{

     //Effettuo una find all'interno del database senza filtrare per predicati, al fine di ottenere tutti i corsi
     Corso.find({}).then((corsi)=>{
        if(corsi.length!=0){
            res.status(200).json(corsi);    //Se ci sono corsi mando un ack

            //Riallineo il contatore dell'id
            Pren.find({},(error,result)=>{
                var max=-1;
                result.forEach((el)=>{
                    if (el.idpren>max){
                        max=el.idpren;
                    }
                });
                idpren=max;
                console.log("Maximum pren ID : "+max);
            })

        } else{
            res.status(404).json(corsi);    //Altrimenti mando un 404
        }
    })

});

//Post - permette al cliente di aggiungere una prenotazione
app.post("/effettuaPrenotazione",(req,res)=>{

    //Effettuo una find all'interno del database filtrando per l'id del corso, al fine di ottenerne le info
    Corso.find({idcorso:req.body.idcorso}).then((corsotrovato)=>{

        //Controllo che il corso non sia già stato prenotato
        Pren.find({"corso.idcorso":corsotrovato[0].idcorso}).then((prenotazionetrovata)=>{
            if (prenotazionetrovata.length!=0){
                //Se c'è già una prenotazione mando 404
                res.status(404).json(prenotazionetrovata);
            }else{
                //Altrimenti posso creare la prenotazione
                var corso = {idcorso:corsotrovato[0].idcorso,nome:corsotrovato[0].nome,sala:corsotrovato[0].sala,data:corsotrovato[0].sala,orario:corsotrovato[0].orario}
                var newPrenotazione = new Pren({idpren:Number(++idpren),stato:'ATTESA',corso:corso});
                //Salvo la prenotazione
                console.log("Nuova prenotazione:\n" +newPrenotazione);
                newPrenotazione.save().then(()=>{
                //Una volta salvata mando un ack
                res.status(200).json(newPrenotazione);
                })
            }
        })

    })

});

//Get - permette al cliente di visualizzare lo stato delle sue prenotazioni
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

//Delete - permette al cliente di annullare una prenotazione
app.delete("/annullaPrenotazione", (req, res)=>{

    //Effettuo la find della prenotazione desiderata all'interno del database
    Pren.findOneAndDelete(req.body).then((ok)=>{

        // Ok rappresenta la prenotazione che viene cancellata, lo usiamo per il check degli errori!
        if(ok!=null){
            res.status(200).json(ok);   //Se viene trovato mando ack
        } else {
            res.status(404).json(ok);   //Altrimenti mando un messaggio di errore con stato 404
        }
    });

});