# WebApp ACP - Docente De Simone
## Giovanni Ciccarelli N46005832
## Francesco Brunello N46006794

Web Application di un centro sportivo per il corso di ACP <br>
Sono state implementate la vista dell'amministratore e di un cliente <br><br>
Un **cliente** può visualizzare le _news_, richiedere la _prenotazione_ ad un _corso_,visualizzare lo stato delle sue _prenotazioni_ ed annullare quelle accettate. <br><br>
Un **amministratore** può inserire e gestire le _news_ , inserire e gestire i _corsi_, visualizzare e gestire le _prenotazioni_ effettuate dai clienti <br>

## SPECIFICHE TECNICHE

E' stata utilizzata la seguente versione di MONGODB:

> _MONGODB_ : 6.0.6

Sono state utilizzate le seguenti versioni dei pacchetti NODE:

> _express_ : 4.18.2\
> _mongoose_ : 5.13.17\
> _nodemon_ : 2.0.22

In caso di problemi controllare che il _package.json_ contenga le versioni citate sopra

## GUIDA ALL' AVVIO DELL'APPLICAZIONE

1. Avviare da shell il servizio **mongodb**
2. Eseguire nella directory del progetto i seguenti comandi:

> **npm run starto** -- Avvia la vista dell'**operatore** sul localhost:4002\
> **npm run startc** -- Avvia la vista del **cliente** sul localhost:4000

    In caso di errori al lancio dei comandi accertarsi che sia presente nodemon nelle dev-dependencies del package.json
    

## TEST DELL'APPLICAZIONE

1. Recarsi nella directory **script_popolamento-eliminazione_db**
2. Eseguire da terminale il comando:

> **pip install pymongo** -- Installa un driver python per la comunicazione con mongodb

3. Per popolare il database:

> **python3 popoladb.py**

4. Per svuotare il database:

> **python3 svuotadb.py**

### IN CASO DI PROBLEMI CON GLI SCRIPT
1. Inserire una news di ogni tipo nella vista amministratore.
2. Controllare l'update delle news nella vista cliente.
3. Inserire uno o più corsi nella vista amministratore.
4. Effettuare una o più prenotazioni nella vista cliente. (Non è consentito prenotare più volte lo stesso corso)
5. Gestire le prenotazioni nella vista amministratore.
6. Controllare nelle rispettive viste che lo stato delle prenotazioni è stato aggiornato.
