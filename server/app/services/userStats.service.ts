import { IUser } from "@common/user";
// import * as fs from 'fs';
// import { GameHistory } from "@common/gameHistory";
import { Service } from 'typedi';
import { Statistics } from '../../../common/userStats';
import { DatabaseService } from "./database.service";

@Service()
export class UserStatisticsService {
    // private usersFilePath = '../server/assets/users.json';

    constructor(private databaseService: DatabaseService) {}

    private initializeUserStatistics(user: IUser): void {
        if (!user.gameStatistics) {
            user.gameStatistics = {
                numberGamesPlayed: 0,
                numberGamesWon: 0,
                averageDifferencePerGame: 0,
                averageTimePerGame: 0
            };
        }
    }

    private incrementNumberGamesPlayed(user: IUser): void {
        this.initializeUserStatistics(user);
        user.gameStatistics!.numberGamesPlayed += 1;
    }

    private incrementNumberGamesWon(user: IUser): void {
        user.gameStatistics!.numberGamesWon += 1;
    }

    private updateAverageDifferencesPerGame(user: IUser, newDifferences: number): void {
        const stats: Statistics = user.gameStatistics!;
        const totalDifferences = (stats.averageDifferencePerGame * (stats.numberGamesPlayed - 1)) + newDifferences;
        stats.averageDifferencePerGame = totalDifferences / stats.numberGamesPlayed;
    }

    private updateAverageGameTime(user: IUser, newGameTime: number): void {
        const stats = user.gameStatistics!;
        const totalTime = (stats.averageTimePerGame * (stats.numberGamesPlayed - 1)) + newGameTime/1000;
        stats.averageTimePerGame = totalTime / stats.numberGamesPlayed;
    }

    async updateUserStats(user: IUser, gameWon: boolean, differencesFound: number, gameTime: number): Promise<void> {
        if (!user) return;

        this.incrementNumberGamesPlayed(user);
        if (gameWon) {
            this.incrementNumberGamesWon(user);
        }
        this.updateAverageDifferencesPerGame(user, differencesFound);

        this.updateAverageGameTime(user, gameTime);
        await this.databaseService.updateUserStats(user, user.gameStatistics!);
    }

    // private loadUsers(): IUser[] {
    //     const data = fs.readFileSync(this.usersFilePath, 'utf8');
    //     return JSON.parse(data);
    // }

    // private saveUsers(users: IUser[]): void {
    //     fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2));
    // }
}
