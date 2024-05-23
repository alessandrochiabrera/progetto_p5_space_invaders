let menu;//immagine schermata del menu
let menuPausa;//immagine tasto menu
let riprendi;//immagine pulsante riprendi
let esci;//immagine pulsante esci
let player;//immagine giocatore
let razzoImg;//immagine del razzo "proiettile"
let selezioneLivelli;//schermata della selezione livelli
let enemyPrimoLivello;//immagine nemico primo livello
let enemySecondoLivello;//immagine nemico del secondo livello
let enemyTerzoLivello;//immagine nemico del terzo livello
let explosion;//immagine collisione tra razzo e nemico
let suonoSparo;//suono quando il razzo viene sparato
let x;//ascisse
let y;//ordinate
let playerSpeed = 12; // Velocità di movimento del giocatore
let shooting = false;//variabile che definisce se il personaggio sta sparando
let score = 0; // Punteggio
let gameState = "menu"; // Stato: menu, menuPausa, playing o selezioneLivelli
let razzi = []; // Array dei razzi sparati
let nemici = []; // Array dei nemici creati
let esplosioni = []; // Array delle esplosioni
let speedDown = 2; // Velocità iniziale dei nemici
let imgBackground;//schermata sfondo del primo livello
let imgBackgroundLivello2;//sfondo secondo livello
let imgBackgroundLivello3;//sfondo terzo livello
let temp = 0;//variabile ausiliaria utilizzata per memorizzare il livello prima di mettere in pausa (usata nel draw)
let gameOverImg;//immagine di stato gameOver
let imgLine;

// Carica le immagini e i suoni prima dell'avvio del programma
function preload() {
    menu = loadImage("./img/menuImg.png"); // Menu principale
    menuPausa = loadImage("./img/menu.png"); // Menu pausa
    riprendi = loadImage("./img/riprendi.png");//tasto riprendi
    esci = loadImage("./img/esci.png");//tasto esci
    imgBackground = loadImage("./img/background_spazio.jpg"); // Sfondo primo livello
    player = loadImage("./img/player.png"); // Giocatore
    razzoImg = loadImage("./img/razzo.png"); // Immagine razzo
    enemyPrimoLivello = loadImage("./img/enemy_lv_1.png"); // Nemico del primo livello
    explosion = loadImage("./img/esplosione.png"); // Animazione esplosione nemico
    suonoSparo = loadSound("./audio/sparo.mp3"); // Suono dello sparo
    suonoEsplosione = loadSound("./audio/esplosione.mp3"); // Suono esplosione
    selezioneLivelli = loadImage("./img/selezioneLivelli.png"); //schermata di selezione del livelloà
    imgBackgroundLivello2 = loadImage("./img/background_spazio_lv_2.jpg");//immagine di sfondo del secondo livello
    enemySecondoLivello = loadImage("./img/enemy_lv_2.png");//nemico del secondo livello
    imgBackgroundLivello3 = loadImage("./img/background_spazio_lv_3.png");//immagine di sfondo del terzo livello
    enemyTerzoLivello = loadImage("./img/enemy_lv_3.png");//nemico del terzo livello
    gameOverImg = loadImage("./img/game_over.gif");//immagine del game over
    imgLine = loadImage("./img/line.png");//mirino (immagine linea)
}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 20);
    frameRate(60);
    player.resize(100, 0);
    razzoImg.resize(60, 0);
    enemyPrimoLivello.resize(100, 0);
    explosion.resize(120, 0);
    menuPausa.resize(100, 0);
    riprendi.resize(200, 0);
    esci.resize(200, 0);
    enemySecondoLivello.resize(100, 0);
    enemyTerzoLivello.resize(200, 0);
    imgLine.resize(200, 300);

    // Inizializza le coordinate x e y del giocatore al centro dello schermo
    x = width / 2 - player.width / 2;
    y = height - height / 8 - player.height;
}

// Funzione che viene chiamata ad ogni frame
function draw() {
    switch (gameState) {
        case "menu":
            // Disegna il menu
            image(menu, 0, 0, width, height);
            break;
        case "menuPausa":
            // Disegna il menu di pausa
            pauseRiprendi();
            break;
        case "playingLevel1":
            temp = 1;
            // Disegna lo sfondo, il giocatore e il contatore dei punti
            image(imgBackground, 0, 0, width, height);
            image(player, x, y);
            image(imgLine, x - player.width/2, y - imgLine.height);
            fill(255);
            textSize(20);//stampa il punteggio
            text("Punteggio: " + score, 20, 40);

            // Sposta il giocatore a destra e sinistra
            if (keyIsDown(68)) {
                x += playerSpeed;
            }
            if (keyIsDown(65)) {
                x -= playerSpeed;
            }

            // Spara i razzi
            if (keyIsDown(ENTER)) {
                sparo();
            }

            // Gestisce i razzi
            for (let i = 0; i < razzi.length; i++) {
                let razzo = razzi[i];
                image(razzoImg, razzo.x, razzo.y);
                razzo.y -= 5;
                // Controllo se il razzo colpisce un nemico
                for (let j = 0; j < nemici.length; j++) {
                    let nemico = nemici[j];
                    if (collisioneRazzoNemico(razzo, nemico)) {
                        suonoEsplosione.play();
                        aggiungiEsplosione(razzo.x, razzo.y);//animazione esplosione
                        razzi.splice(i, 1);//enlimina il razzo
                        nemici.splice(j, 1);//elimina il nemico
                        i--; // Aggiorna l'indice dopo la rimozione del razzo
                        score += 1; // Aumenta il punteggio
                        break; // Esci dal ciclo interno per evitare la verifica di collisione con altri nemici
                    }
                }
                // Rimuovi il razzo se esce dallo schermo
                if (razzo.y < -razzoImg.height) {
                    razzi.splice(i, 1);
                    i--;
                }
            }

            // Gestisce i nemici
            for (let i = 0; i < nemici.length; i++) {
                let nemico = nemici[i];
                nemico.stampaEnemy();
                nemico.muoviEnemy();
                // Controllo se il nemico colpisce il giocatore
                if (collisioneNemicoGiocatore(nemico)) {
                    score -= 5; // Decremento dei punti di 5
                    nemici.splice(i, 1); // Rimuovi il nemico
                    i--; // Aggiorna l'indice dopo la rimozione
                } else if (nemico.y > y + player.height && !nemico.counted) { // Se il nemico supera il player e non è ancora stato contato
                    score--; // Decremento del punteggio
                    nemico.counted = true; // Imposta il flag a true per indicare che il nemico è stato contato
                }
            }

            // Disegna e gestisce le esplosioni
            gestisciEsplosioni();

            // Aggiungi nuovi nemici ogni 2 secondi (2 giri di frameTOT)
            if (frameCount % 60 === 0) {
                aggiungiNemico();
            }

            // Controllo se i punti sono meno di zero per terminare il gioco
            if (score < 0) {
                image(gameOverImg, 0, 0, width, height);
                if(keyCode === ENTER){
                    gameState = "selezioneLivelli";
                }
            }
            //fine livello 1
            break;

        case "playingLevel2" : 
        temp = 2;
        // Disegna lo sfondo, il giocatore e il contatore dei punti
        image(imgBackgroundLivello2, 0, 0, width, height);
        image(player, x, y);
        image(imgLine, x - player.width/2, y - imgLine.height);
        fill(255);
        textSize(20);//stampo il punteggio
        text("Punteggio: " + score, 20, 40);

        // Sposta il giocatore a destra e sinistra
        if (keyIsDown(68)) {
            x += playerSpeed+2;
        }
        if (keyIsDown(65)) {
            x -= playerSpeed+2;
        }

        // Spara i razzi
        if (keyIsDown(ENTER)) {
            sparo();
        }

        // Gestisce i razzi
        for (let i = 0; i < razzi.length; i++) {
            let razzo = razzi[i];
            image(razzoImg, razzo.x, razzo.y);
            razzo.y -= 5;
            // Controllo se il razzo colpisce un nemico
            for (let j = 0; j < nemici.length; j++) {
                let nemico = nemici[j];
                if (collisioneRazzoNemico(razzo, nemico)) {
                    suonoEsplosione.play();
                    aggiungiEsplosione(razzo.x, razzo.y);
                    razzi.splice(i, 1);
                    nemici.splice(j, 1);
                    i--; // Aggiorna l'indice dopo la rimozione del razzo
                    score += 1; // Aumenta il punteggio
                    break; // Esci dal ciclo interno per evitare la verifica di collisione con altri nemici
                }
            }
            // Rimuovi il razzo se esce dallo schermo
            if (razzo.y < -razzoImg.height) {
                razzi.splice(i, 1);
                i--;
            }
        }

        // Gestisce i nemici
        for (let i = 0; i < nemici.length; i++) {
            let nemico = nemici[i];
            nemico.stampaEnemy();
            nemico.muoviEnemy();
            // Controllo se il nemico colpisce il giocatore
            if (collisioneNemicoGiocatore(nemico)) {
                score -= 5; // Decremento dei punti di 5
                nemici.splice(i, 1); // Rimuovi il nemico
                i--; // Aggiorna l'indice dopo la rimozione
            } else if (nemico.y > y + player.height && !nemico.counted) { // Se il nemico supera il player e non è ancora stato contato
                score--; // Decremento del punteggio
                nemico.counted = true; // Imposta il flag a true per indicare che il nemico è stato contato
            }
        }

        // Disegna e gestisce le esplosioni
        gestisciEsplosioni();

        // Aggiungi nuovi nemici ogni 2 secondi (2 giri di frameTOT)
        if (frameCount % 60 === 0) {
            aggiungiNemico();
        }

        // Controllo se i punti sono meno di zero per terminare il gioco
        if (score < 0) {
            image(gameOverImg, 0, 0, width, height);
            if(keyCode === ENTER){
                gameState = "selezioneLivelli";
            }
        }
        break;
        //fine livello 2
    case "playingLevel3":
        temp = 3;
                // Disegna lo sfondo, il giocatore e il contatore dei punti
                image(imgBackgroundLivello3, 0, 0, width, height);
                image(player, x, y);
                image(imgLine, x - player.width/2, y - imgLine.height);
                fill(255);//stampo il punteggio
                textSize(20);
                text("Punteggio: " + score, 20, 40);
        
                // Sposta il giocatore a destra e sinistra
                if (keyIsDown(68)) {
                    x += playerSpeed+6;
                }
                if (keyIsDown(65)) {
                    x -= playerSpeed+6;
                }
        
                // Spara i razzi
                if (keyIsDown(ENTER)) {
                    sparo();
                }
        
                // Gestisce i razzi
                for (let i = 0; i < razzi.length; i++) {
                    let razzo = razzi[i];
                    image(razzoImg, razzo.x, razzo.y);
                    razzo.y -= 5;
                    // Controllo se il razzo colpisce un nemico
                    for (let j = 0; j < nemici.length; j++) {
                        let nemico = nemici[j];
                        if (collisioneRazzoNemico(razzo, nemico)) {
                            suonoEsplosione.play();
                            aggiungiEsplosione(razzo.x, razzo.y);
                            razzi.splice(i, 1);//elimino il razzo
                            nemici.splice(j, 1);//elimino il nemico
                            i--; // Aggiorna l'indice dopo la rimozione del razzo
                            score += 1; // Aumenta il punteggio
                            break; // Esci dal ciclo interno per evitare la verifica di collisione con altri nemici
                        }
                    }
                    // Rimuovi il razzo se esce dallo schermo
                    if (razzo.y < -razzoImg.height) {
                        razzi.splice(i, 1);
                        i--;
                    }
                }
        
                // Gestisce i nemici
                for (let i = 0; i < nemici.length; i++) {
                    let nemico = nemici[i];
                    nemico.stampaEnemy();
                    nemico.muoviEnemy();
                    // Controllo se il nemico colpisce il giocatore
                    if (collisioneNemicoGiocatore(nemico)) {
                        score -= 5; // Decremento dei punti di 5
                        nemici.splice(i, 1); // Rimuovi il nemico
                        i--; // Aggiorna l'indice dopo la rimozione
                    } else if (nemico.y > y + player.height && !nemico.counted) { // Se il nemico supera il player e non è ancora stato contato
                        score--; // Decremento del punteggio
                        nemico.counted = true; // Imposta il flag a true per indicare che il nemico è stato contato
                    }
                }
        
                // Disegna e gestisce le esplosioni
                gestisciEsplosioni();
        
                // Aggiungi nuovi nemici ogni 2 secondi (2 giri di frameTOT)
                if (frameCount % 60 === 0) {
                    aggiungiNemico();
                }
        
                // Controllo se i punti sono meno di zero per terminare il gioco
                if (score < 0) {
                    image(gameOverImg, 0, 0, width, height);
                    if(keyCode === ENTER){
                        gameState = "selezioneLivelli";
                    }
                }
                break;//fine livello 3
            
            //selesione livelli
        case "selezioneLivelli":
            image(selezioneLivelli, 0, 0, width, height);
            break;
    }
    if(x < 0 - player.width/2){
        x = width - player.width /2;
    }else if(x > width - player.width /2){
        x = 0;
    }
}

// Funzione per sparare un razzo
function sparo() {
    // Se è premuto il tasto Invio e non è in corso una sparatoria
    if (keyIsDown(ENTER) && !shooting) {
        // Aggiungi un razzo all'array dei razzi
        razzi.push({ x: x + player.width / 2 - razzoImg.width / 2, y: y - razzoImg.height });
        shooting = true; // Imposta il flag shooting su true per evitare troppi razzi di fila
        suonoSparo.play(); // suono dello sparo
        // Imposta un timeout per ripristinare il flag shooting dopo un intervallo di tempo
        setTimeout(function () {
            shooting = false;
        }, 450);
    }
}

// Funzione per aggiungere un nuovo nemico
function aggiungiNemico() {
    if(gameState === "playingLevel1"){
    // Calcola una posizione casuale lungo l'asse x per il nuovo nemico
    let randomX = random(width - enemyPrimoLivello.width);
    // Definisci la posizione iniziale del nemico fuori dallo schermo, in alto
    let newY = -enemyPrimoLivello.height;
    // Aggiungi il nuovo nemico all'array dei nemici
    nemici.push(new EnemyPrimo(randomX, newY, speedDown));
    }else if(gameState === "playingLevel2"){
    // Calcola una posizione casuale lungo l'asse x per il nuovo nemico
    let randomX = random(width - enemySecondoLivello.width);
    // Definisci la posizione iniziale del nemico fuori dallo schermo, in alto
    let newY = -enemySecondoLivello.height;
    // Aggiungi il nuovo nemico all'array dei nemici
    nemici.push(new EnemyPrimo(randomX, newY, speedDown));
    }else if(gameState === "playingLevel3"){
    // Calcola una posizione casuale lungo l'asse x per il nuovo nemico
    let randomX = random(width - enemyTerzoLivello.width);
    // Definisci la posizione iniziale del nemico fuori dallo schermo, in alto
    let newY = -enemyTerzoLivello.height;
    // Aggiungi il nuovo nemico all'array dei nemici
    nemici.push(new EnemyPrimo(randomX, newY, speedDown));
    }
}

// Funzione per la collisione tra nemico e giocatore
function collisioneNemicoGiocatore(nemico) {
    let playerLeft = x;
    let playerRight = x + player.width;
    let playerTop = y;
    let playerBottom = y + player.height;
    let nemicoLeft = nemico.x;
    let nemicoRight;
    let nemicoTop;
    let nemicoBottom;

    //controllo la collisione per ciascun nemico di ciascun livello (qualche size è diverso quindi meglio controllare)
    if (gameState === "playingLevel1") {
        nemicoRight = nemico.x + enemyPrimoLivello.width;
        nemicoTop = nemico.y;
        nemicoBottom = nemico.y + enemyPrimoLivello.height;
    } else if (gameState === "playingLevel2") {
        nemicoRight = nemico.x + enemySecondoLivello.width;
        nemicoTop = nemico.y;
        nemicoBottom = nemico.y + enemySecondoLivello.height;
    } else if (gameState === "playingLevel3") {
        nemicoRight = nemico.x + enemyTerzoLivello.width;
        nemicoTop = nemico.y;
        nemicoBottom = nemico.y + enemyTerzoLivello.height;
    }

    // Controllo se c'è una collisione tra il giocatore e il nemico
    if (
        playerRight > nemicoLeft &&
        playerLeft < nemicoRight &&
        playerBottom > nemicoTop &&
        playerTop < nemicoBottom
    ) {
        suonoEsplosione.play();
        return true;
    }
    return false;
}


// Funzione per la collisione tra razzo e nemico
function collisioneRazzoNemico(razzo, nemico) {
    let razzoLeft = razzo.x;
    let razzoRight = razzo.x + razzoImg.width;
    let razzoTop = razzo.y;
    let nemicoLeft = nemico.x;
    let nemicoRight = nemico.x + enemyPrimoLivello.width;
    let nemicoBottom = nemico.y + enemyPrimoLivello.height;

    // Controllo se c'è una collisione tra il razzo e il nemico
    if (
        razzoRight > nemicoLeft &&
        razzoLeft < nemicoRight &&
        razzoTop < nemicoBottom
    ) {
        return true;
    }
    return false;
}

// Funzione per aggiungere un'esplosione
function aggiungiEsplosione(x, y) {
    esplosioni.push({ x: x, y: y, tempoCreazione: millis() });
}

// Funzione per disegnare e gestire le esplosioni
function gestisciEsplosioni() {
    for (let i = 0; i < esplosioni.length; i++) {
        let esplosione = esplosioni[i];
        image(explosion, esplosione.x, esplosione.y - enemyPrimoLivello.height / 2);
        // Rimuovi l'esplosione dopo un certo intervallo di tempo (ad esempio, 500 millisecondi)
        if (millis() - esplosione.tempoCreazione > 500) {
            esplosioni.splice(i, 1);
            i--;
        }
    }
}

// Funzione per terminare il gioco
function terminaGioco() {
    window.close();
}

function keyPressed() {
    if (keyCode === ESCAPE) {
        if(gameState === "playingLevel1"){
            temp = 1;//controlla ausiliario
        }else if(gameState === "playingLevel2"){
            temp = 2;//controllo ausiliario
        }else if(gameState === "playingLevel3"){
            temp = 3;//controllo ausiliario
        }
        if (gameState === "playingLevel1" || gameState === "playingLevel2" || gameState === "playingLevel3") {
            gameState = "menuPausa";
            return;
        }
        if(gameState === "menuPausa"){
            if(temp == 1){
                gameState = "playingLevel1";
            }else if(temp == 2){
                gameState = "playingLevel2";
            }else if(temp == 3){
                gameState = "playingLevel3";
            }
        }
    }
    if(keyCode == 77){//premo m mentre sono in pausa
        if(gameState === "menuPausa"){
            gameState = "selezioneLivelli";
        }
    }
    if(keyCode === ENTER){//premo invio mentre sono in menu
        if(gameState === "menu"){
            gameState = "selezioneLivelli";
        }
    }

    if(gameState === "selezioneLivelli"){
        if(keyCode == 49){//premo 1
            gameState = "playingLevel1";
            score = 0;
            // Reimposta gli array dei nemici e dei razzi
            nemici = [];
            razzi = [];
            x = width / 2 - player.width / 2;
            y = height - height / 8 - player.height;//reimposta la posizione del player
        }else if(keyCode == 50){//premo 2
            gameState = "playingLevel2";
            score = 0;
            // Reimposta gli array dei nemici e dei razzi
            nemici = [];
            razzi = [];
            x = width / 2 - player.width / 2;
            y = height - height / 8 - player.height;//reimposta la posizione del player
        }else if(keyCode == 51){//premo 3
            gameState = "playingLevel3";
            score = 0;
            // Reimposta gli array dei nemici e dei razzi
            nemici = [];
            razzi = [];
            x = width / 2 - player.width / 2;
            y = height - height / 8 - player.height;//reimposta la posizione del player
        }
    }
    console.log(`Tasto premuto: ${keyCode}`);//debug per il tasto premuto
}


function pauseRiprendi() {
    // Se il gioco è in pausa, disegna il menu di pausa
    if (gameState === "menuPausa") {
        image(menuPausa, width / 2 - menuPausa.width / 2, height / 4 - menuPausa.height / 2);
        image(riprendi, width / 2 - riprendi.width / 2, height / 2 - riprendi.height / 2);
        image(esci, width / 2 - esci.width / 2, height / 2 + esci.height);
        return;
    }
}


function mouseClicked() {
    switch (gameState) {
        case "menu":
            // Codice per gestire il clic nel menu principale
            if (
                mouseX >= width / 2 - menu.width / 2 &&
                mouseX <= width / 2 + menu.width / 2 &&
                mouseY >= height / 2 - menu.height / 2 &&
                mouseY <= height / 2 + menu.height / 2
            ) {
                score = 0;
                gameState = "selezioneLivelli"; // Avvia il gioco e posrta a selezionare il livello
            } else if (
                mouseX >= width / 2 - selezioneLivelli.width / 2 &&
                mouseX <= width / 2 + selezioneLivelli.width / 2 &&
                mouseY >= height / 2 + 200 &&
                mouseY <= height / 2 + 200 + selezioneLivelli.height
            ) {
                score = 0;
                gameState = "selezioneLivelli"; // Vai alla selezione dei livelli
            }
            break;
        case "menuPausa":
            // Se il gioco è in pausa, controlla il clic sui pulsanti del menu di pausa
            if (//se clicca menu:
                mouseX >= width / 2 - menuPausa.width / 2 &&
                mouseX <= width / 2 + menuPausa.width / 2 &&
                mouseY >= height / 4 - menuPausa.height / 2 &&
                mouseY <= height / 4 - menuPausa.height / 2 + menuPausa.height
            ) {
                gameState = "selezioneLivelli"; // Vai alla selezione dei livelli

            }else if (//se clicca ru riprendi
                mouseX >= width / 2 - riprendi.width / 2 &&
                mouseX <= width / 2 + riprendi.width / 2 &&
                mouseY >= height / 2 - riprendi.height / 2 &&
                mouseY <= height / 2 + riprendi.height / 2
            ) {
                if(temp == 1){
                    gameState = "playingLevel1"; // riprendi il gioco nel livello 1
                    temp = 0;
                }
                if(temp == 2){
                    gameState = "playingLevel2";//riprendi il gioco nel livello 2
                    temp = 0;
                }
                if(temp == 3){
                    gameState = "playingLevel3";//riprendi il gioco nel livello 3
                    temp = 0;
                }
            } else if (//se clicchi esci:
                mouseX >= width / 2 - esci.width / 2 &&
                mouseX <= width / 2 + esci.width / 2 &&
                mouseY >= height / 2 + esci.height &&
                mouseY <= height / 2 + esci.height * 2
            ) {
                terminaGioco();
            }
            break;

            case "selezioneLivelli":
                // Codice per gestire il clic durante la selezione dei livelli
                if (// Seleziona il livello 1
                    mouseX <= width / 3 - 150 &&
                    mouseY >= height / 2 - player.height &&
                    mouseY <= height / 2 + player.height * 2
                ) {
                    gameState = "playingLevel1";
                    score = 0;
                    // Reimposta gli array dei nemici e dei razzi
                    nemici = [];
                    razzi = [];
                } else if (   // Seleziona il livello 2
                    mouseX > width / 3 - 50 &&
                    mouseX <= width * 2 / 3 &&
                    mouseY >= height / 2 - player.height &&
                    mouseY <= height / 2 + player.height*2
                ) {
                    gameState = "playingLevel2";
                    score = 0;
                    // Reimposta gli array dei nemici e dei razzi
                    nemici = [];
                    razzi = [];
                } else if (   // Seleziona il livello 3
                    mouseX > width * 2 / 3 &&
                    mouseY >= height / 2 - player.height &&
                    mouseY <= height / 2 + player.height*2
                ) {
                    gameState = "playingLevel3";
                    score = 0;
                    // Reimposta gli array dei nemici e dei razzi
                    nemici = [];
                    razzi = [];
                }
                break;            
    }
}