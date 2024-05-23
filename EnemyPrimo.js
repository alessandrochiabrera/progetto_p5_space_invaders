class EnemyPrimo {
    constructor(x, y, speedDown) {
        this.speedDown = speedDown;
        this.x = x;
        this.y = y;
        this.width = enemyPrimoLivello.width;
        this.height = enemyPrimoLivello.height;
    }

    stampaEnemy() {
        if(gameState === "playingLevel1"){
            image(enemyPrimoLivello, this.x, this.y);
        }else if(gameState === "playingLevel2"){
            image(enemySecondoLivello, this.x, this.y);
        }else if(gameState === "playingLevel3"){
            image(enemyTerzoLivello, this.x, this.y);
        }
    }

    muoviEnemy() {
        this.y += this.speedDown;
        if(gameState === "playingLevel2"){
            this.y += this.speedDown+3;
        }else if(gameState === "playingLevel3"){
            this.y += this.speedDown+5;
        }
    }
}
