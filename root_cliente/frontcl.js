//Dichiaro una variabile globale che mi servirà per l'operazione di notifica quando un amministratore pubblica una nuova news
var update_news=0;

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

             if($(element).parent().is(":nth-child(1)")){   //News - permette al cliente di visualizzare le news del centro

                //In questo caso la mia variabile $cont sarà un unsigned list
                $cont=$("<ul>");
                
                //Effetto una GET Ajax al porto offerto dal server_cliente per ottenere l'array di news
                $.getJSON("/getNews", (items)=>{

                    //Scorro l'array di news
                    items.forEach((el)=>{

                        //Mi porto il tipo della news nella classe, e scrivo il tipo e la data
                        $cont.append($("<li class='"+el.tipo.toString().toLowerCase()+"'>").text(el.tipo + " " + el.data));
                        //Scrivo il testo della news
                        $cont.append($("<li class ='newstext'>").text(el.testo));

                    });

                }).fail((jqXHR)=>{
                    //Se non ci sono news mando un messaggio di errore
                    $cont.append($("<li class='error'>").text("Non ci sono news pubblicate!")).hide().fadeIn(1000);
                })
            
                //Appendo il mio $cont al main
                $("main .content").append($cont);


             }
             else if($(element).parent().is(":nth-child(2)")){  //Prenota - permette al cliente di effettuare una prenotazione ad un corso
                
                //In questo caso la mia variabile $cont sarà un unsigned list
                $cont = $("<ul>");

                //Effetto una GET Ajax al porto offerto dal server_cliente per ottenere l'array di corsi
                $.getJSON("/getCorsi", (corsi)=>{

                    //Scorro l'array di corsi
                    corsi.forEach((corso)=>{
                        var $button = $("<button class='btn btn-outline-info prenota' id='"+corso.idcorso+"'>").text("Prenota Corso");
                        $cont.append($("<li class ='titolocorso'>").text(corso.nome + " del "+corso.data));
                        $cont.append($("<li class='info'>").text("Tenuto nella sala "+ corso.sala));
                        $cont.append($("<li class='info'>").text("Alle ore "+ corso.orario));
                        $cont.append($("<li class='info'>").text("Dall'istruttore "+ corso.istruttore));
                        $cont.append($button);
                    });

                    //Listener sul bottone Prenota Corso
                    document.querySelectorAll(".prenota").forEach((bottone)=>{

                        bottone.addEventListener("click", (e)=>{

                            //Passo l'id del corso da prenotare
                            var el = {idcorso:bottone.getAttribute("id")};
                            console.log(el);
                            //Effettuo POST ajax al porto offerto dal server_cliente per prenotare il corso desiderato
                            $.ajax({
                                url:"/effettuaPrenotazione",
                                type:"POST",
                                dataType:"json",
                                data:el
                            }).done(()=>{ //In caso di successo
                                $(".notify").text("Richiesta di prenotazione effettuata correttamente!").hide().fadeIn(1000).fadeOut(2000);
                            }).fail((jqXHR)=>{ //In caso di fail 
                                $(".notify").text("Richiesta di prenotazione al corso già effettuata!").hide().fadeIn(1000).fadeOut(3000);
                            });

                        })
                    });
                    
                }).fail((jqXHR)=>{
                    $cont.append($("<li class='error'>").text("Non ci sono corsi da prenotare, la preghiamo di ritornare più tardi!")).hide().fadeIn(1000); 
                });


                $("main .content").append($cont);

             } else if($(element).parent().is(":nth-child(3)")){  //Stato Prenotazioni - permette al cliente di visualizzare lo stato delle sue prenotazioni
 
                 //In questo caso la mia variabile $cont sarà una unordered list
                 $cont = $("<ul>");

                 //Effettuo una GET Ajax al porto offerto dal server_operatore per ottenere l'array di Prenotazioni nello stato ATTESA
                 $.getJSON("/getPrenotazioni",(prenotazioni)=>{
 
                     //Scorro l'array di prenotazioni
                     prenotazioni.forEach((prenotazione)=>{
                 
                         //Creo gli elementi html per la gestione della prenotazione
                         var $labeltipoprenotazione = $("<li class='"+prenotazione.stato.toString().toLowerCase()+"'>").text("Prenotazione "+prenotazione.idpren+" del corso "+prenotazione.corso.nome+" - Stato: "+prenotazione.stato);
                         
                         //Appendo al mio $content gli elementi html
                         $cont.append($labeltipoprenotazione);
                         $cont.append($("<li class ='info'>").text("Tenuto il "+prenotazione.corso.data+" alle ore "+prenotazione.corso.orario+" nella sala "+prenotazione.corso.sala))

                         //Se una prenotazione è stata accettata, permetto all'utente di annullarla
                         if (prenotazione.stato=="ACCETTATA"){
                            var $buttonannullaprenotazione = $("<button class='buttonannullaprenotazione btn btn-outline-danger' id='"+prenotazione.idpren+"'>").text("Annulla prenotazione");
                            $cont.append($buttonannullaprenotazione);
                                
                            //Seleziono tutti i bottoni
                            document.querySelectorAll("button").forEach((button)=>{

                                //Aggiungo un listener sul click
                                button.addEventListener("click",(el)=>{

                                    //Creo l'oggetto contenente l'id della prenotazione da annullare
                                    var el ={"idpren":el.target.getAttribute("id")}

                                    //Effettuo una DELETE Ajax
                                    $.ajax({
                                        url:"/annullaPrenotazione",
                                        type:"DELETE",
                                        dataType:"json",
                                        data:el
                                    }).done(()=>{ //In caso di successo
                                        $(".tabs a:nth-child(3) span").trigger("click");
                                        $(".notify").text("Prenotazione annullata correttamente!").hide().fadeIn(1000).fadeOut(2000);
                                    }).fail(()=>{ //In caso di fail 
                                        $(".notify").text("Prenotazione non annullata!").hide().fadeIn(1000).fadeOut(2000);
                                    });

                                })

                            })

                        }
 
                     })
 
                 }).fail((jqXHR)=>{
                    $cont.append($("<li class='error'>").text("Non ci sono prenotazioni effettuate!")).hide().fadeIn(1000); 
                })

                 $("main .content").append($cont);
             }
 
            return false; //Utilizzato per impedire la ripropagazione del click sui tabs

        })
     
    });

    $(".tabs a:first-child span").trigger("click"); //Trigger per settare il tab di default (News) quando viene aperta la pagina

}

//Funzione di check periodico per la notify
var check = function(firstcall){

    console.log(update_news);
    $.getJSON("/getNews",(news)=>{
        
        //Se è la prima chiamata, allora allineo semplicemente il contatore delle news con la lunghezza dell'array delle news
        if (firstcall){

            update_news = news.length;

        }

        //Altrimenti, controllo se devo aggiornare il mio contatore e nel caso mando la notifica
        else if (update_news!=news.length){

            update_news = news.length;
            var el = document.querySelector(".active");

            //Se sono già sul primo tab triggero il click
            if (el.getAttribute("id")=="newstab"){
                $(el).trigger("click");
                $(".alert").text("L'amministratore ha appena modificato le news.");
                    //Pulisco sul click
                    $(".alert").on("click",()=>{
                        $(".alert").text("");
                    })
            }

            //Altrimenti notifico che c'è stato un aggiornamento alle news
            else{

                $(".alert").text("L'amministratore ha modificato le News , controlla il tab 'News'.");
                
                //Setto un listener sull'alert che pulisce
                $(".alert").on("click",()=>{

                    $(".alert").text("");

                })
            }


        }

    })


}

//Avvio del main e della funzione di notifica (passo alla prima call true)
$(document).ready(()=>{
    main(check(true));
});

//Poi setto il check periodico passando false
setInterval(()=>{
    check(false)
},1000)

