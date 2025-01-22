import { Game } from './game';

export enum Status {
    WAITING_PLAYER,
    FULL,
    ACTIVE,
    ENDED,
}
export class Game1v1 extends Game {
    updateStatus() {
        if (this.gameCard) {
            const threshold = Math.ceil(this.gameCard.differences.length / 2);

            if (this.counter1 >= threshold) {

                this.status = Status.ENDED;



                return { status: this.status, winner: this.getPlayer(0).name }


            } else if (this.counter2 >= threshold) {

                this.status = Status.ENDED;

                return { status: this.status, winner: this.getPlayer(1).name }

            }
        }

        return { status: Status.ACTIVE, winner: "" };
    }


}