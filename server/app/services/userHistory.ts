import { Action, UserConnectionHistory } from '@common/connectionHistory';
import { IUser } from '@common/user';
import { Service } from 'typedi';

import { DatabaseService } from "./database.service";
@Service()
export class UserHistoryService {
    // private usersFilePath = '../server/assets/users.json';
    // user: IUser;


    constructor(private databaseService: DatabaseService) {

    }

    async connectUser(user: IUser): Promise<void> {
        // this.user = user;
        await this.addEvent('Connexion', user.username);
    }

    async disconnectUser(username: string): Promise<void> {
        // if (this.user && this.user.username === username) {
        await this.addEvent('Déconnexion', username);
        // }
    }

    private async addEvent(action: Action, username: string): Promise<void> {
        const event: UserConnectionHistory = {
            date: new Date(Date.now()),
            action,
        };

        try {
            await this.databaseService.updateUserConnectionHistory(username, event);
        } catch (error) {
            console.error('An error occurred while updating user connection history', error);
        }
    }

}
