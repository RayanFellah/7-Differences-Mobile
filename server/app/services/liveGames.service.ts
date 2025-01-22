import { Game, Status } from '@common/game';
import { Service } from 'typedi';

@Service()
export class LiveGamesService {

    LiveGamesService() {};
    current: Game[] = [];

    add(game: Game) {
        this.current.push(game);
    }

    getPlayers(gameId: string) {
        const game = this.getGameById(gameId);
        return game?.getPlayers();
    }
    removeGame(gameId: string) {
        this.current = this.current.filter((e) => { e.gameId != gameId });
    }

    updateStatus(gameId: string) {
        const game = this.getGameById(gameId) as Game;
        if (game) return game.updateStatus();

        return { status: Status.ACTIVE, winner: "" };
    }

    incrementCounter(gameId: string, playerId: string) {

        const game = this.getGameById(gameId);



        if (game) {

            const players = this.getPlayers(gameId);
            if (!players) {
                return -1;

            }
            /*
            const counters = [game.counter1, game.counter2, game.counter3, game.counter4];
            for (let i = 0; i < players.length; i++) {
                if (players[i].id === playerId) {
                    counters[i]++;
                    console.log("incrementCounter");
                    console.log(counters);
                    return i;
                }
            }
            */
            if (players[0].id === playerId) {
                game.counter1++;
                const counters = [game.counter1, game.counter2, game.counter3, game.counter4];
                return counters;
            }
            if (players[1].id === playerId) {
                game.counter2++;
                const counters = [game.counter1, game.counter2, game.counter3, game.counter4];
                return counters;

            }
            if (players[2].id === playerId) {
                game.counter3++;
                const counters = [game.counter1, game.counter2, game.counter3, game.counter4];
                return counters;
            }
            if (players[3].id === playerId) {
                game.counter4++;
                const counters = [game.counter1, game.counter2, game.counter3, game.counter4];
                return counters;
            }



        }
        return -1;
    }
    getGameById(gameId: string): Game | undefined {
        return this.current.find((game: Game) => game.gameId === gameId);
    }


}
