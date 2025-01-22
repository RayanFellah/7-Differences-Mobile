import { Game } from './game';

export enum Status {
    WAITING_PLAYER,
    FULL,   // 4 joueurs
    ACTIVE,
    ENDED,
    VALIDE  // 2 ou 3 joueurs
}
export class GameMulti extends Game {
    updateStatus() {
        if (this.gameCard) {
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


            const threshold = Math.ceil(this.gameCard.differences.length / 4);

            if (this.counter1 >= threshold || this.counter2 >= threshold || this.counter3 >= threshold || this.counter4 >= threshold) {

                const scores = [this.counter1, this.counter2, this.counter3, this.counter4];
                const max = Math.max(...scores);
                const indexWin = scores.indexOf(max);

                scores[indexWin] = -1;

                const secondMax = Math.max(...scores);
                // const indexFollow = scores.indexOf(secondMax);

                const sum = this.counter1 + this.counter2 + this.counter3 + this.counter4;

                if (max > (secondMax + this.gameCard.differences.length - sum)) { // gagnant
                    this.status = Status.ENDED;
                    return { status: this.status, winner: this.getPlayer(indexWin).name }
                }
                if (this.gameCard.differences.length - sum === 0) { // egalite

                    if (max === secondMax) {
                        this.status = Status.ENDED;
                        return { status: this.status, winner: "No winner" }
                    } else { // if bug or glitch


                        this.status = Status.ENDED;
                        return { status: this.status, winner: this.getPlayer(indexWin).name }



                    }


                }


            }
        }

        return { status: Status.ACTIVE, winner: "" };
    }


}