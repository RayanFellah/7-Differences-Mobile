import { ActiveUser } from '@app/classes/user';
import { UserConnectionHistory } from '@common/connectionHistory';
import { GameHistory, GameHistoryEntry } from '@common/gameHistory';
import { Item } from '@common/items';
import { IUser } from '@common/user';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import { UserHistoryService } from './userHistory';
import { UserStatisticsService } from './userStats.service';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

@Service()
export class UserService {
    usersFilePath = '../server/assets/users.json';
    activeUsers: ActiveUser[] = [];
    userHistoryService: UserHistoryService;
    userStats: UserStatisticsService;
    constructor(private databaseService: DatabaseService) {
        console.log(this.activeUsers);
        this.userHistoryService = new UserHistoryService(databaseService);
        this.userStats = new UserStatisticsService(databaseService);

        const tenSeconds = 10000;
        setInterval(() => {
            // console.log('checking active users last ping');
            // console.log(this.activeUsers);
            this.activeUsers.forEach((user) => {
                if (!user.isUserActive()) {
                    this.logoutUser(user.username);
                    // user.emitSessionExpired();
                }
            });
        }, tenSeconds);
    }
    /* async getAllUsers(): Promise<IUser[] | []> {
         return new Promise((resolve, reject) => {
             fs.promises
                 .readFile(this.usersFilePath, 'utf8')
                 .then((fileData) => {
                     resolve(JSON.parse(fileData.toString()).users);
                 })
                 .catch(() => {
                     reject([]);
                 });
         });
     }*/

    async addSocketToActiveUser(username: string, socket: io.Socket): Promise<void> {
        const user = this.activeUsers.find((activeUser: ActiveUser) => activeUser.username === username);
        if (user) {
            console.log('Adding socket to user');
            user.addSocket(socket);
        }
    }

    async validateUser(username: string, password: string): Promise<{ isValid: boolean; message: string; user?: IUser }> {
        if ((await this.findUserByUsername(username, this.activeUsers)) !== undefined) {
            console.log('User is already logged in');
            return { isValid: false, message: 'Utilisateur déjà connecté' };
        }

        const user = await this.databaseService.getUser(username);
        console.log(user, 'user');
        if (user && (await bcrypt.compare(password, user.password))) {
            if (!this.activeUsers.some((user) => user.username === username)) {
                // Si aucun utilisateur actif avec ce nom d'utilisateur n'existe, ajoutez-en un nouveau
                this.activeUsers.push(new ActiveUser(username));
            }
            this.userHistoryService.connectUser(user);
            return { isValid: true, message: 'Utilisateur valide', user };
        }
        return { isValid: false, message: "Mauvais mot de passe ou nom d'utilisateur" };
    }
    /*  async findIUserByUsername(username: string, users: IUser[]): Promise<IUser | undefined> {
          try {
              const user = users.find((u: IUser) => u.username === username);
              return user;
          } catch (error) {
              console.error('Error reading the users file:', error);
              throw error;
          }
      }*/

    async findUserByUsername(username: string, users: ActiveUser[]): Promise<ActiveUser | undefined> {
        try {
            console.log('Finding user by username', users);
            const user = users.find((u: ActiveUser) => u.username === username);
            return user;
        } catch (error) {
            console.error('Error reading the users file:', error);
            throw error;
        }
    }

    async createUser(user: IUser): Promise<IUser | undefined> {
        try {
            // const users: User[] = await this.getAllUsers();

            if (!(await this.databaseService.verifyUsernameAvailability(user.username))) {
                console.log('User already exists');
                return undefined;
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            user.password = hashedPassword;
            // this.userHistoryService.user = user;
            user.connectionHistory = [{ date: new Date(Date.now()), action: 'Connexion' }];
            user.isLanguageFrench = true;
            user.isThemeDark = true;
            user.gameHistory = [];
            user.gameStatistics = {
                numberGamesPlayed: 0,
                numberGamesWon: 0,
                averageDifferencePerGame: 0,
                averageTimePerGame: 0,
            };
            user.friends = [];
            user.submittedRequests = [];
            user.receivedRequests = [];
            const id = await this.databaseService.createUser(user);
            user.id = id;
            user.replays = [];
            this.activeUsers.push(new ActiveUser(user.username));

            console.log('User created', this.activeUsers);
            return user;
        } catch (error) {
            console.error('Error creating the user:', error);
            throw error;
        }
    }

    generateToken(username: string): string {
        const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1h' });
        return token;
    }

    async logoutUser(username: string): Promise<boolean> {
        const user = await this.findUserByUsername(username, this.activeUsers);
        if (user !== undefined) {
            const index = this.activeUsers.indexOf(user);
            if (index > -1) {
                this.activeUsers.splice(index, 1);
                this.userHistoryService.disconnectUser(user.username);
                console.log('true', this.activeUsers);
                return true;
            }
        }
        return false;
    }

    async getUserConnectionHistory(username: string): Promise<UserConnectionHistory[] | null> {
        return this.databaseService.getUserConnectionHistory(username);
    }

    async getUserGameHistory(username: string): Promise<GameHistory | null> {
        return await this.databaseService.getUserGameHistory(username);
    }

    async updateUserGameHistory(username: string, gameHistory: GameHistoryEntry) {
        try {
            await this.databaseService.updateUserGameHistory(username, gameHistory);
        } catch (error) {
            console.error('Error updating the user game history:', error);
            throw error;
        }
    }

    async updateUserAvatar(username: string, newAvatar: string): Promise<boolean> {
        console.log('Updating user avatar');
        try {
            /* const users: IUser[] = await this.getAllUsers();
            const user = users.find((u: IUser) => u.username === username);

            if (!user) {
                console.log('User not found');
                return false;
            }

            // Update the avatar
            user.avatar = newAvatar;

            // Write the updated users data back to the file
            fs.writeFileSync(this.usersFilePath, JSON.stringify({ users }), 'utf-8');*/
            await this.databaseService.updateUserAvatar(username, newAvatar);
            console.log('User avatar updated');
            return true;
        } catch (error) {
            console.error('Error updating the user avatar:', error);
            throw error;
        }
    }

    async updateUserLanguage(username: string, isLanguageFrench: boolean): Promise<boolean> {
        try {
            await this.databaseService.updateUserLanguage(username, isLanguageFrench);
            console.log('User language updated');
            return true;
        } catch (error) {
            console.error('Error updating the user language:', error);
            throw error;
        }
    }

    async updateUserTheme(username: string, isThemeDark: boolean): Promise<boolean> {
        try {
            await this.databaseService.updateUserTheme(username, isThemeDark);
            console.log('User theme updated');
            return true;
        } catch (error) {
            console.error('Error updating the user theme:', error);
            throw error;
        }
    }

    async updateUserUsername(currentUsername: string, newUsername: string): Promise<boolean> {
        try {
            if (!(await this.databaseService.verifyUsernameAvailability(newUsername))) {
                console.log('User already exists');
                return false;
            }
            await this.databaseService.updateUserUsername(currentUsername, newUsername);
            const activeUser = this.activeUsers.find((u) => u.username === currentUsername);
            if (activeUser) {
                activeUser.username = newUsername;
            }
            console.log('User username updated');
            return true;
        } catch (error) {
            console.error('Error updating the user username:', error);
            throw error;
        }
    }

    async updateUserStats(username: string, gameWon: boolean, differencesFound: number, gameTime: number) {
        const user = await this.databaseService.getUser(username);
        await this.userStats.updateUserStats(user, gameWon, differencesFound, gameTime);
    }

    async purchaseItem(username: string, item: Item) {
        const user = await this.databaseService.getUser(username);
        if (user.dinars !== undefined && user.boughtItems) { // a changer une fois que on aura fait que le nbre de dinar est de 0 par defaut
            if (user.dinars >= item.price) {
                user.dinars -= item.price;
                user.boughtItems.push(item);
                await this.databaseService.updateUserDinarsAndBoughtItems(username, user.dinars, user.boughtItems);
                return true;
            }
        }
        return false
    }

    async wheelSpin(username: string, hasWonGameMultiplier: boolean | string) {
        const user = await this.databaseService.getUser(username);
        if (hasWonGameMultiplier && hasWonGameMultiplier !== 'false') {
            await this.purchaseItem(username, { name: 'Multiplicateur x2', type: 'Point Multiplier', price: 5 });
        } else {
            console.log(user.dinars);
            const newDinars = user.dinars ? user.dinars - 5 : 0;
            this.databaseService.updateUserDinars(username, newDinars);
        }
        return user.dinars;
    }

    async getBoughtItems(username: string) {
        return await this.databaseService.getUser(username).then((user) => user.boughtItems);
    }

    async getBoughtAvatars(username: string) {
        const user = await this.databaseService.getUser(username);
        const userBoughtItems = user.boughtItems;
        const boughtAvatars = userBoughtItems?.filter((item) => item.type === 'Avatar');
        return boughtAvatars ? boughtAvatars : [];
    };

    async getBoughtMedals(username: string) {
        const user = await this.databaseService.getUser(username);
        const userBoughtItems = user.boughtItems;
        const boughtMedals = userBoughtItems?.filter((item) => item.type === 'Medal');
        return boughtMedals ? boughtMedals : [];
    }


    // async hasGameMultiplier(username: string) {
    //     const user = await this.databaseService.getUser(username);
    //     const userBoughtItems = user.boughtItems;
    //     return userBoughtItems?.some((item) => item.type === 'GameMultiplier');
    // }

    async getUserGameStats(username: string) {
        const user = await this.databaseService.getUser(username);
        const userStats = user.gameStatistics ? user.gameStatistics : { gamesPlayed: 0, gamesWon: 0, differencesFound: 0, gameTime: 0 };
        return userStats;
    }
}
