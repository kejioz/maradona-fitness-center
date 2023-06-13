//Dichiaro una variabile globale che verrà utilizzata per l'operazione di notifica quando un cliente effettua una richiesta di prenotazione
var update_prenotazioni=0;

var main = function(){

   //"use strict"; //Permette di non utilizzare body empty e variabili non inizializzate

   //Dichiaro una variabile $cont che mi servirà per l'append del content in base alla tab selezionata
   var $cont; 

   //Trasformo i tabs in un array che scorro con un for each
    $(".tabs a span").toArray().forEach((element)=>{

        //Per ogni tab, setto un handler del click
        $(element).on("click", ()=>{

            //Rimuovo la classe active da tutti i tab al fine di gestire l'highlighting css
            $(".tabs a span").removeClass("active");
            $(element).addClass("active");  //Ed aggiungo la classe active soltanto all' element (tab) clickato
            $("main .content").empty(); //Pulisco il content

            //Utilizzo il metodo .parent() in combinazione con nth-child per individuare l'anchor clickato
            //In base al tab clickato, ho vari comportamenti

            if($(element).parent().is(":nth-child(1)")){        //Gestisci Prenotazioni - permette all'amministratore di gestire le prenotazioni richieste dai clienti

                //In questo caso la mia variabile $cont sarà una unordered list
                $cont = $("<ul>");

                //Effettuo una GET Ajax al porto offerto dal server_operatore per ottenere l'array di Prenotazioni nello stato ATTESA
                $.getJSON("/getPrenotazioni/attesa",(prenotazioni)=>{

                    //Scorro l'array di prenotazioni
                    prenotazioni.forEach((prenotazione)=>{
                
                        //Creo gli elementi html per la gestione della prenotazione
                        var $labeltipoprenotazione = $("<li class='labelprenotazione' id='"+prenotazione.stato+"'>").text("Prenotazione "+prenotazione.idpren+" del corso "+prenotazione.corso.nome+" - Stato: "+prenotazione.stato);
                        var $buttonaccept = $("<button name='accetta' id='bottoneaccettaprenotazione' class='"+prenotazione.idpren+"'>").text("Accetta");
                        var $buttonreject = $("<button name='rifiuta' id='bottonerifiutaprenotazione' class='"+prenotazione.idpren+"'>").text("Rifiuta");

                        //Appendo al mio $content gli elementi html
                        $cont.append($labeltipoprenotazione).append($buttonaccept).append($buttonreject);

                    })

                }).then(()=>{

                    //Seleziono tutti i bottoni
                    document.querySelectorAll("button").forEach((button)=>{

                        //Aggiungo un listener sul click del bottone differenziando per la classe
                        button.addEventListener("click",(el)=>{

                            //Se è un bottone accetta faccio una put cambiando stato in accettata
                            if (el.target.getAttribute("name")=="accetta"){

                                //Creo un oggetto contenente l'id della prenotazione target
                                var el = {"idpren":el.target.getAttribute("class")}
                                //Call ajax
                                $.ajax({
                                    url:"accettaPrenotazione",
                                    type:"PUT",
                                    dataType:"json",
                                    data:el
                                }).done(()=>{   //In caso di successo refresho
                                    $(".tabs a:nth-child(1) span").trigger("click");
                                    $(".notify").text("Stato della prenotazione cambiato correttamente!").hide().fadeIn(1000).fadeOut(2000);
                                }).fail(()=>{
                                    $(".notify").text("Errore nella gestione della prenotazione").hide().fadeIn(1000).fadeOut(2000);
                                })

                            }
                            //Se è un bottone rifiuta faccio una put cambiando stato in rifiutata
                            else if (el.target.getAttribute("name")=="rifiuta"){

                                //Creo un oggetto contenente l'id della prenotazione target
                                var el = {"idpren":el.target.getAttribute("class")}
                                //Call ajax
                                $.ajax({
                                    url:"rifiutaPrenotazione",
                                    type:"PUT",
                                    dataType:"json",
                                    data:el
                                }).done(()=>{   //In caso di successo refresho
                                    $(".tabs a:nth-child(1) span").trigger("click");
                                    $(".notify").text("Stato della prenotazione cambiato correttamente!").hide().fadeIn(1000).fadeOut(2000);
                                }).fail(()=>{
                                    $(".notify").text("Errore nella gestione della prenotazione").hide().fadeIn(1000).fadeOut(2000);
                                })

                            }

                        })

                    })

                }).fail((jqXHR)=>{
                    $cont.append($("<li class='error'>").text("Non ci sono prenotazioni da gestire!")).hide().fadeIn(1000); 
                })

                //Appendo il mio $cont al content
                $("main .content").append($cont);
            }
            else if($(element).parent().is(":nth-child(2)")){   //Gestisci Corsi - permette all'amministratore di modificare i corsi

                //In questo caso la mia variabile $cont sarà una unordered list
                $cont = $("<ul>");

                //Effetto una GET Ajax al porto offerto dal server_operatore per ottenere l'array di corsi
                $.getJSON("/getCorsi", (corsi)=>{

                    //Scorro l'array di corsi
                    corsi.forEach((corso)=>{
                        //Creo un bottone nel quale porto l'id del corso, al fine di gestire l'eliminazione, e setto la classe 'eliminacorso'
                        var $button = $("<button class='eliminacorso btn btn-outline-danger' id='"+corso.idcorso+"'>").text("Elimina Corso");
                        $cont.append($("<li class ='titolocorso'>").text(corso.nome + " del "+corso.data));
                        $cont.append($("<li class='info'>").text("Tenuto nella sala "+ corso.sala));
                        $cont.append($("<li class='info'>").text("Alle ore "+ corso.orario));
                        $cont.append($("<li class='info'>").text("Dall'istruttore "+ corso.istruttore));
                        $cont.append($button);
                    });

                    //Seleziono tutti i bottoni della classe .eliminacors in cui ho salvato l'id dei corsi
                    document.querySelectorAll(".eliminacorso").forEach((bottone)=>{

                        //Aggiungo il listener sul click ai bottoni
                        bottone.addEventListener("click", (e)=>{

                            //Creo un oggetto con l'id del corso contenuto nell'attributo id del bottone
                            var el = {idcorso: e.target.getAttribute('id')};

                            //Effetto una DELETE Ajax al porto offerto dal server_operatore passando l'oggetto contenente l'id del corso da cancellare
                            $.ajax({
                                url: "/deleteCorso", 
                                type:"DELETE",
                                dataType:"json",
                                data:el
                            }).done(()=>{ //In caso di successo
                                $(".tabs a:nth-child(2) span").trigger("click");
                                $(".notify").text("Corso eliminato correttamente!").hide().fadeIn(1000).fadeOut(2000);
                            }).fail(()=>{ //In caso di fail 
                                $(".notify").text("Corso non eliminato!").hide().fadeIn(1000).fadeOut(2000);
                            });

                        })
                    });
                    
                }).fail(()=>{   //Se non ci sono corsi mando un messaggio di errore
                    $cont.append($("<li class='error'>").text("Non ci sono corsi da gestire!")).hide().fadeIn(1000); 
                });

                //Appendo il mio $cont al content
                $("main .content").append($cont);

            }
            else if($(element).parent().is(":nth-child(3)")){   //Inserisci News - permette all'amministratore di pubblicare una news

                //In questo caso la mia variabile $cont sarà un <div>
                $cont = $("<div>");

                //Variabili label da appendere
                var $labeldate=$("<p class='labeldate'>").text("Data");
                var $labeltext=$("<p class='labeltext'>").text("Contenuto");
                
                //Variabili input da appendere
                var $inputdate = $("<input type='date' class = 'calendar'>");
                var $tbox = $("<textarea class = 'textbox' placeholder = 'Inserisci il testo della news...'>");
                var $select = $("<select class= 'selezione' name='choice'> <option value='GENERICA'>Generica</option> <option value='ORARI' selected>Orari</option> <option value='EVENTI'>Eventi</option> </select>");

                //Bottone da appendere
                var $button = $("<button class ='publish btn btn-outline-info'>").text("Pubblica");

                //Listener sul click
                $button.on("click", ()=>{

                    //Controllo che l'amministratore abbia selezionato una data ed abbia scritto qualcosa
                    if($tbox.val()!="" && $inputdate.val()!=""){

                        //Creo l'oggetto news con gli input dati dall'amministratore
                        var el = {data:$inputdate.val(), tipo: $select.val(), testo: $tbox.val()};

                        //Effetto una POST Ajax al porto offerto dal server_operatore per passare la news sotto forma di JSON
                        $.ajax({ 
                            url: "/inserisciNews", 
                            type:"POST",
                            dataType:"json",
                            data:el
                        }).done(()=>{
                            //Appendo un messaggio di avvenuta pubblicazione e pulisco gli inputboxes
                            $("p.notify").text("News Inserita!").hide().fadeIn(1000).fadeOut(2000); 
                            $tbox.val("");
                            $inputdate.val("");
                        })

                    }
                    //Se l'amministratore non ha inserito correttamente gli input
                    else{
                        $("p.notify").text("Compila tutti i campi!").hide().fadeIn(1000).fadeOut(2000); 
                    }

                });

                //Aggiungo i listener sul keypress agli input per impostare il focus

                $inputdate.on("keypress", (event)=>{
                    if(event.key==="Enter"){
                        $tbox.focus();
                    }
                });

                $tbox.on("keypress", (event)=>{
                    if(event.key==="Enter"){
                        $select.focus();
                    }
                });


                $select.on("keypress", (event)=>{
                    if(event.key==="Enter"){
                        $button.focus();
                    }
                });

                //Appendo alla variabile $div i vari elementi html
                $cont.append($labeldate).append($inputdate).append($labeltext).append($tbox).append($select).append($button);

                //Appendo tutti gli elementi html contenuti in $cont al mio content
                $("main .content").append($cont);

            }
            else if($(element).parent().is(":nth-child(4)")){   //Prenotazioni - permette all'amministratore di visualizzare le prenotazioni effettuate

                //In questo caso la mia variabile $cont sarà un <div>
                $cont = $("<div>");

                //Dichiaro booleane per check dei fail
                var trovato1=true;
                var trovato2=true;

               //Effettuo una GET Ajax per ottenere le prenotazioni accettate
               $.getJSON("/getPrenotazioni/accettata",(prenotazioni)=>{

                var $labelaccettate = $("<ul class='labelprenotazioniaccettate'>").text("PRENOTAZIONI ACCETTATE");
                $cont.append($labelaccettate);
                    prenotazioni.forEach((prenotazione)=>{

                        var $listitemidprenotazione = $("<li class='listitemidprenotazione'>").text("Prenotazione "+prenotazione.idpren);
                        var $infoprenotazione = $("<li class='infoprenotazione'>").text("Corso di "+prenotazione.corso.nome+" del "+prenotazione.corso.data+" alle ore "+prenotazione.corso.orario+ " tenuto nella sala "+prenotazione.corso.sala);
                        $cont.append($listitemidprenotazione).append($infoprenotazione);
                    })

                }).fail((jqXHR)=>{
                    trovato1=false;
                    })
        
               //Effettuo una GET Ajax per ottenere le prenotazioni rifiutate
               $.getJSON("/getPrenotazioni/rifiutata",(prenotazioni)=>{

                var $labelrifiutate = $("<ul class='labelprenotazionirifiutate'>").text("PRENOTAZIONI RIFIUTATE");
                $cont.append($labelrifiutate);
                    prenotazioni.forEach((prenotazione)=>{

                        var $listitemidprenotazione = $("<li class='listitemidprenotazione'>").text("Prenotazione "+prenotazione.idpren);
                        var $infoprenotazione = $("<li class='infoprenotazione'>").text("Corso di "+prenotazione.corso.nome+" del "+prenotazione.corso.data+" alle ore "+prenotazione.corso.orario+ " tenuto nella sala "+prenotazione.corso.sala);
                        $cont.append($listitemidprenotazione).append($infoprenotazione);
                    })

                }).fail((jqXHR)=>{
                    trovato2=false;
                    console.log(trovato1);
                    console.log(trovato2);
                    //Se non vengono trovate appendo un messaggio
                    if (trovato1==false && trovato2==false){
                        console.log("nntrv")
                        $cont.append($("<li class='error'>").text("Non ci sono prenotazioni effettuate!")).hide().fadeIn(1000); 
                    }
                    })


               //Appendo i miei elementi html al content
               $("main .content").append($cont);
            }
            else if($(element).parent().is(":nth-child(5)")){   //Inserisci corsi - permette all'amministratore di inserire un nuovo corso

                //In questo caso la mia variabile $cont sarà un <div>
                $cont = $("<div>");

                //Creo gli oggetti utili all-inserimento delle informazioni del corso
                var $nome = $("<input class ='inputcorsi' placeholder='Inserisci il nome del corso...'>");
                var $sala = $("<input class ='inputcorsi' placeholder='Inserisci la sala del corso...'>");
                var $data = $("<input class='calendar' type='date'>");
                var $ora = $("<input class ='inputcorsi' type='time'>");
                var $istr = $("<input class = 'inputcorsi' placeholder='Inserisci istruttore del corso...'>");
                var $button = $("<button class ='addcourse btn btn-outline-info'>").text("Aggiungi Corso");


                //Creo le label
                var $nomelab = $("<p class ='labeldate'>").text("Nome"); //Classi usate per lo styling css
                var $salalab= $("<p class ='labeltext'>").text("Sala");
                var $datalab = $("<p class = 'labeltext'>").text("Data");
                var $oralab = $("<p class ='labeltext'>").text("Ora");
                var $istrlab = $("<p class='labeltext'>").text("Istruttore");


                //Listener sul bottone Aggiungi Corso
                $button.on("click", ()=>{

                    //Se tutti i campi sono compilati
                    if($nome.val()!="" && $sala.val()!="" && $data.val()!="" && $ora.val()!="" && $istr.val()!=""){
                       
                        //Creo l'oggetto corso con gli input dell'amministratore
                        var el = {nome: $nome.val(), sala:$sala.val(), data:$data.val(), orario:$ora.val(), istruttore: $istr.val()};

                        //Effetto una POST Ajax al porto offerto dal server_operatore per passare il corso sotto forma di JSON
                        $.ajax({
                            url: "/inserisciCorso", 
                            type:"POST",
                            dataType:"json",
                            data:el
                        }).done(()=>{
                            //Appendo un messaggio di avvenuta pubblicazione e pulisco gli inputboxes
                            $("p.notify").text("Corso inserito!").hide().fadeIn(1000).fadeOut(2000); 
                            $nome.val("");
                            $sala.val("");
                            $data.val("");
                            $ora.val("");
                            $istr.val("");
                        }).fail((jqXHR)=>{
                            //Se la chiamata non va a buon fine
                            $("p.notify").text("Corso non inserito, riprovare più tardi!").hide().fadeIn(1000).fadeOut(2000); 

                        })

                    }else{
                        //Se l'amministratore non ha compilato tutti i campi
                        $("p.notify").text("Compila tutti i campi!").hide().fadeIn(1000).fadeOut(2000); 
                    }

                });

                //Aggiungo i listener sul keypress agli input per impostare il focus

                $nome.on("keypress", (event)=>{
                    if(event.key==="Enter"){
                        $sala.focus();
                    }
                });

                $sala.on("keypress", (event)=>{
                    if(event.key==="Enter"){
                        $data.focus();
                    }
                });

                $data.on("keypress", (event)=>{
                    if(event.key==="Enter"){
                        $ora.focus();
                    }
                });

                $ora.on("keypress", (event)=>{
                    if(event.key==="Enter"){
                        $istr.focus();
                    }
                });

                $istr.on("keypress", (event)=>{
                    if(event.key==="Enter"){
                        $button.focus();
                    }
                });

                //Appendo alla variabile $div i vari elementi html
                $cont.append($nomelab).append($nome).append($salalab).append($sala).append($datalab).append($data).append($oralab).append($ora).append($istrlab).append($istr).append($button);
                
                //Appendo tutti gli elementi html contenuti in $cont al mio content
                $("main .content").append($cont);
                
            }
            else if($(element).parent().is(":nth-child(6)")){    //News - permette all'amministratore di visualizzare le news pubblicate

                //In questo caso la mia variabile $cont sarà un' unsigned list
                $cont=$("<ul>");
                
                //Effetto una GET Ajax al porto offerto dal server_operatore per ottenere l'array di news
                $.getJSON("/getNews", (items)=>{

                    //Scorro l'array di news
                    items.forEach((el)=>{ 

                        //Creo un bottone nel quale porto l'id della news, al fine di gestire l'eliminazione, e setto la classe 'deletenews'
                        var $button = $("<button class='deletenews btn btn-outline-danger' id='"+el.id+"'>").text("Elimina");
                        // Crea un div con display flex per gestire lo spacing dei bottoni
                        var $div = $("<div class='d-flex gap-2'>")
                        // Aggiungo il li col testo della news
                        var $newsText = $("<li class='newstext'>").text(el.testo);
                        //Mi porto il tipo della news nella classe, e scrivo il tipo e la data
                        $cont.append($("<li class='"+el.tipo.toString().toLowerCase()+"'>").text(el.tipo + " " + el.data));
                        
                        //Appendo
                        $div.append($newsText).append($button);
                        $cont.append($div); 

                    });

                    //Seleziono tutti i bottoni della classe .deletenews in cui ho salvato l'id della news
                    document.querySelectorAll('button.deletenews').forEach((pulsante)=>{ 
                        
                        //Aggiungo un listener
                        pulsante.addEventListener("click", (e)=>{

                            //Creo un oggetto nel quale salvo l'id della news target, da cancellare
                            var el ={id:e.target.getAttribute('id')}
                            console.log(el);
                            
                            //Effetto una DELETE Ajax al porto offerto dal server_operatore passando l'oggetto contenente l'id della news da cancellare
                            $.ajax({
                                url:"/deleteNews",
                                type:"DELETE",
                                dataType:"json",
                                data:el
                            }).done(()=>{
                                //Una volta fatto refresho la pagina e mando un messaggio di successo
                                $(".tabs a:nth-child(6) span").trigger("click");
                                $(".notify").text("News eliminata correttamente!").hide().fadeIn(1000).fadeOut(2000);
                            }).fail((jqXHR)=>{
                                //Se c'è un errore nella cancellazione mando un messaggio di errore
                                $(".notify").text("News non eliminata!").hide().fadeIn(1000).fadeOut(2000);
                            })
                           
    
                        });

                    });

                }).fail((jqXHR)=>{
                    //Se non ci sono news mando un messaggio di errore
                    $cont.append($("<li class='error'>").text("Non ci sono news pubblicate!")).hide().fadeIn(1000); 
                });
                
                //Appendo il mio $cont al main
                $("main .content").append($cont);

            }  

            return false; //Utilizzato per impedire la ripropagazione del click sui tabs

        })

        
    });

    $(".tabs a:first-child span").trigger("click"); //Trigger per settare il tab di default (Gestisci prenotazioni) quando viene aperta la pagina

}

//Funzione di alert per notificare una nuova prenotazione effettuata dal cliente
var check = function(firstcall){
    
    //Effettuo una GET Ajax delle prenotazioni in attesa
    $.getJSON("/getPrenotazioni/attesa", (prenotazioni)=>{
        
        //Se è la prima chiamata alla funzione, semplicemente allineo il contatore passando true
        if (firstcall){

            update_prenotazioni=prenotazioni.length;

        }

        //Altrimenti controllo se il contatore è cambiato e nel caso mando la notifica

        else if (update_prenotazioni!=prenotazioni.length){

            update_prenotazioni=prenotazioni.length;
            var el = document.querySelector(".active");

            //Se sono già sul primo tab triggero il click
            if (el.getAttribute("id")=="gestisciprenotazionitab"){
                $(el).trigger("click");
                $(".alert").text("C'è stata una modifica alle prenotazioni ");
                    //Pulisco sul click
                    $(".alert").on("click",()=>{
                        $(".alert").text("");
                    })
            }

            //Altrimenti notifico che c'è stato un aggiornamento alle prenotazioni
            else{

                $(".alert").text("Aggiornate le richieste di prenotazione.");
                
                //Setto un listener sull'alert che pulisce
                $(".alert").on("click", ()=>{

                    $(".alert").text("");
    

                });
            }

        }
    
     });

}


//Avvio del main e della funzione di notifica (passo alla prima call true)

$(document).ready(()=>{
    main(check(true));
});

setInterval(()=>{
    check(false);
}, 1000);
