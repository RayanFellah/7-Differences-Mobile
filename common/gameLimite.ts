import { Game } from './game';
import { GameCardTemplate } from './game-card-template';


export enum Status {
    WAITING_PLAYER,
    FULL,   // 4 joueurs
    ACTIVE,
    ENDED,
    VALIDE  // 2 ou 3 joueurs
}
export class GameLimite extends Game {
    currentIndex=0;
    maxIndex=0;

    queue: GameCardTemplate[] = [];
    updateStatus() {
         // check if 2 or more players are still active
         let actifPlayers = 0;
         let actifIndex=0;
         for (let i = 0; i < this.actifPlayers.length; i++) {
             if (this.actifPlayers[i] === 1) {
                 actifPlayers++;
                 actifIndex = i;
             }
         }
         if (actifPlayers < 2) {
             this.status = Status.ENDED;
             return { status: this.status, winner: this.getPlayer(actifIndex).name }
         }
         //

        
        if (this.currentIndex >= this.maxIndex) {
            const scores = [this.counter1, this.counter2, this.counter3, this.counter4];
            const max = Math.max(...scores);
            const indexWin = scores.indexOf(max);
            return { status: Status.ENDED, winner: this.getPlayer(indexWin).name};


        }else{
            return { status: Status.ACTIVE, winner: "" };
        }


    }

  
    next(): any {
       
        let currentCard = this.queue[this.currentIndex];
        let randomIndex = this.random_number_in_range(0, currentCard.differences.length - 1);
        let difference = currentCard.differences[randomIndex];
        currentCard.differences.splice(randomIndex, 1);
        const reste = currentCard.differences;
        currentCard.differences=[difference];
        this.currentIndex++;
       
        console.log("currentCard", currentCard);
        return {card:currentCard, remove:reste};

    }


    addCardToQueue(card: GameCardTemplate) {
        console.log("addCardToQueue", card);
        this.queue.push(card);
    }

    clearQueue() {
        this.queue = [];
    }



    shuffle(array: any) {
        for (let i = array.length - 1; i > 0; i--) {
            // Generate a random index between 0 and i (inclusive)
            const j = Math.floor(Math.random() * (i + 1));
            // Swap elements at indices i and j
            [array[i], array[j]] = [array[j], array[i]];
        }
        this.maxIndex = array.length;

        return array;
    }
    random_number_in_range(min:number, max:number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


}


