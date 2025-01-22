/* eslint-disable no-underscore-dangle */
/* eslint-disable max-lines */
import { Chat } from '@common/chat';
import { UserConnectionHistory } from '@common/connectionHistory';
import { Constants, GameEnded, GameMode, NewTime } from '@common/game-classes';
import { GameHistory, GameHistoryEntry } from '@common/gameHistory';
import { Item } from '@common/items';
import { Message } from '@common/message';
import { Replay } from '@common/replay';
import { IUser } from '@common/user';
import { Statistics } from '@common/userStats';
import { Db, MongoClient, UpdateFilter } from 'mongodb';
import { Service } from 'typedi';
import { MessengerService } from './messenger.service';

@Service()
export class DatabaseService {
    private uri = 'mongodb+srv://logdeuxneufneufzeroequipedeuxc:LC3EwlaWUaFVuPZ2@cluster0.p9aptjl.mongodb.net/?retryWrites=true&w=majority';
    private client = new MongoClient(this.uri);
    private DATABASE_NAME = '7Differences';
    private database: Db = this.client.db(this.DATABASE_NAME);
    private HISTORY_COLLECTION = 'history';
    private BEST_TIME_COLLECTION = 'bestTime';
    private CONSTANTS_COLLECTION = 'constant';
    private CHAT_COLLECTION = 'chat';
    private USER_COLLECTION = 'User';

    // Need to init database before, also made it public for direct use in friendsService
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userCollection = this.database.collection(this.USER_COLLECTION);

    constructor(private messengerService: MessengerService) { }

    async start(): Promise<void> {
        try {
            await this.client.connect();
        } catch {
            throw new Error('Database connection error');
        }


    }
    async saveMessage(message: Message): Promise<void> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        await collection.insertOne({
            sender: message.sender,
            senderType: message.senderType,
            body: message.body,
            time: message.time,
            avatar: message.avatar
        });
    }

    async getMessage(): Promise<Message[]> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        const messsages = await collection.find({}).toArray();
        return messsages.map((message) => ({
            sender: message.sender,
            senderType: message.senderType,
            body: message.body,
            time: message.time,
            currentTime: message.time,
            avatar: message.avatar
        }));
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    // join logique 

    async joinChannel(username: string, channelName: string): Promise<void> {
        const usersCollection = this.database.collection(this.USER_COLLECTION);
        const chatCollection = this.database.collection(this.CHAT_COLLECTION);
        await usersCollection.updateOne(
            { username: username },
            { $push: { channelsAndMuted: { channelName: channelName, mutedPlayers: [] } } }
        );
        const chatUpdateResult = await chatCollection.updateOne(
            { name: channelName },
            { $push: { playersInChat: username } }
        );
        console.log('Résultat de mise à jour de chat:', chatUpdateResult);
        console.log('nom du channel from db', channelName);
        console.log('join called from db');
    }

    async leaveChannel(channelName: string, username: string): Promise<void> {
        const userCollection = this.database.collection(this.USER_COLLECTION);
        const chatCollection = this.database.collection(this.CHAT_COLLECTION);

        const updateResult = await userCollection.updateOne(
            { username: username },
            { $pull: { channelsAndMuted: { channelName: channelName } } }
        );
        await chatCollection.updateOne(
            { name: channelName },
            { $pull: { playersInChat: username } }
        );

        if (updateResult.matchedCount === 0) {
            console.error('Utilisateur non trouvé lors de la tentative de quitter le canal.');
        } else if (updateResult.modifiedCount === 0) {
            console.log('Le canal n\'était pas dans la liste de l\'utilisateur.');
        } else {
            console.log('Canal retiré de la liste');
        }
    }

    //supprimer un canal

    async deleteChannel(channelName: string): Promise<void> {
        try {
            const chatResult = await this.database.collection(this.CHAT_COLLECTION).deleteOne({ name: channelName });

            if (chatResult.deletedCount === 0) {
                console.log(`Aucun canal trouvé avec le nom ${channelName} pour la suppression.`);
                return;
            }

            console.log(`Canal ${channelName} supprimé.`);
            await this.database.collection('User').updateMany(
                {},
                { $pull: { channelsAndMuted: { channelName: channelName } } } as unknown as UpdateFilter<any> // seule solution pour eviter l erreur de typage
            );
            console.log(`Canal ${channelName} retiré de chatNameList de tous les utilisateurs concernés.`);
        } catch (error) {
            console.error('Erreur lors de la suppression', error);
            throw error;
        }
    }


    //sourdine 

    async mutePlayerInChannel(username: string, channelName: string, playerToMute: string): Promise<void> {
        const userCollection = this.database.collection(this.USER_COLLECTION);
        // Trouver l'utilisateur par son nom d'utilisateur
        const user = await userCollection.findOne({ username: username });
        console.log('player data from server', username, channelName, playerToMute, user?.channelsAndMuted);

        if (user) {
            const channelIndex = user.channelsAndMuted.findIndex((c: { channelName: string; }) => c.channelName === channelName);

            if (channelIndex !== -1) {
                if (!user.channelsAndMuted[channelIndex].mutedPlayers.includes(playerToMute)) {
                    user.channelsAndMuted[channelIndex].mutedPlayers.push(playerToMute);

                    await userCollection.updateOne(
                        { username: username },
                        { $set: { channelsAndMuted: user.channelsAndMuted } }
                    );
                    console.log(`Joueur ${playerToMute} muet dans le canal ${channelName} pour l'utilisateur ${username}.`);
                } else {
                    console.log(`Joueur ${playerToMute} est déjà muet dans le canal ${channelName}.`);
                }
            } else {
                console.log(`Canal ${channelName} non trouvé pour l'utilisateur ${username}.`);
            }
        } else {
            console.log(`Utilisateur ${username} non trouvé.`);
        }
    }



    async unmutePlayerInChannel(username: string, channelName: string, playerToUnmute: string): Promise<void> {
        const userCollection = this.database.collection(this.USER_COLLECTION);
        await userCollection.updateOne(
            { username: username, "channelsAndMuted.channelName": channelName },
            { $pull: { "channelsAndMuted.$.mutedPlayers": playerToUnmute } }
        );
    }

    async getPlayersInChat(channelName: string): Promise<string[]> {
        const chatCollection = this.database.collection(this.CHAT_COLLECTION);
        const chat = await chatCollection.findOne({ name: channelName });
        if (chat && chat.playersInChat) {
            console.log('from db playersInChat', chat.playersInChat);
            return chat.playersInChat;
        }
        return [];
    }

    async getMutedPlayers(username: string): Promise<string[]> {
        const user = await this.database.collection(this.USER_COLLECTION).findOne({ username });
        if (!user) {
            return [];
        }
        console.log('from db mutedPlayers', user.channelsAndMuted);
        return user.channelsAndMuted.flatMap((channel: { mutedPlayers: any; }) => channel.mutedPlayers);
    }

    async getMutedPlayersInChannel(username: string): Promise<{ [channelName: string]: string[] }> {
        const user = await this.database.collection(this.USER_COLLECTION).findOne({ username });
        if (!user || !user.channelsAndMuted) {
            return {};
        }
        const mutedPlayersPerChannel = user.channelsAndMuted.reduce((acc: { [x: string]: any; }, channel: { channelName: string | number; mutedPlayers: any; }) => {
            if (channel.channelName && Array.isArray(channel.mutedPlayers)) {
                acc[channel.channelName] = channel.mutedPlayers;
            }
            return acc;
        }, {});
        console.log('from db mutedPlayersPerChannel', mutedPlayersPerChannel);
        return mutedPlayersPerChannel;
    }


    async getChatList(): Promise<Chat[]> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        const chatList = await collection.find({}).toArray();
        return chatList.map((chat) => ({
            name: chat.name,
            history: chat.history,
            creatorName: chat.creatorName,
            playersInChat: chat.playersInChat,
        }));
    }

    async getMyChatList(username: string): Promise<Chat[]> {
        const user = await this.database.collection(this.USER_COLLECTION).findOne({ username });
        if (!user || !user.channelsAndMuted) {
            return [];
        }
        const channelsAndMuted = user.channelsAndMuted;
        // Extrait uniquement les noms des canaux
        const channelNames = channelsAndMuted.map((channel: { channelName: any; }) => channel.channelName);
        const collection = this.database.collection(this.CHAT_COLLECTION);
        const chatList = await collection.find({ name: { $in: channelNames } }).toArray();
        return chatList.map((chat) => ({
            name: chat.name,
            history: chat.history,
            creatorName: chat.creatorName,
            playersInChat: chat.playersInChat,
        }));
    }


    async createGameChat(username: string, channelName: string) {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        await collection.insertOne({
            name: channelName,
            history: [{
                sender: 'SYSTEM',
                body: `Welcome to the game ${channelName} chat!`,
                senderType: 0,
                time: Message.currentTime(),
            }],
            playersInChat: [username]
        });

        console.log('created chat by player', username);
        this.addChannelToUser(username, channelName);
    }


    async joinGameChat(username: string, channelName: string) {
        const usersCollection = this.database.collection(this.USER_COLLECTION);
        const chatCollection = this.database.collection(this.CHAT_COLLECTION);
        await usersCollection.updateOne(
            { username: username },
            { $push: { channelsAndMuted: { channelName: channelName, mutedPlayers: [] } } }
        );
        const chatUpdateResult = await chatCollection.updateOne(
            { name: channelName },
            { $push: { playersInChat: username } }
        );
        console.log('Résultat de mise à jour de chat:', chatUpdateResult);
        console.log('nom du channel from db', channelName);
        console.log('joingamechat called from db', username);
    }

    async leaveGameChat(username: string, channelName: string) {
        console.log('called leavegamechat form db', username, 'channe;', channelName);
        const userCollection = this.database.collection(this.USER_COLLECTION);
        const chatCollection = this.database.collection(this.CHAT_COLLECTION);

        const updateResult = await userCollection.updateOne(
            { username: username },
            { $pull: { channelsAndMuted: { channelName: channelName } } }
        );
        await chatCollection.updateOne(
            { name: channelName },
            { $pull: { playersInChat: username } }

        );

        if (updateResult.matchedCount === 0) {
            console.error('Utilisateur non trouvé lors de la tentative de quitter le canal.');
        } else if (updateResult.modifiedCount === 0) {
            console.log('Le canal n\'était pas dans la liste de l\'utilisateur.');
        } else {
            console.log('Canal retiré de la liste');
        }
        //delete le channel si c le dernier player 
        const chat = await chatCollection.findOne({ name: channelName });
        if (chat && chat.playersInChat.length === 0) {
            await this.deleteChannel(channelName);
            console.log(`Le chat ${channelName} a été supprimé car il n'y a plus de joueurs.`);
        }


    }


    async createChat(chat: Chat): Promise<void> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        await collection.insertOne({
            name: chat.name,
            history: chat.history,
            creatorName: chat.creatorName,
            playersInChat: chat.playersInChat,


        });
        this.addChannelToUser(chat.creatorName, chat.name);

    }

    async addChannelToUser(username: string, channelName: string) {
        const userCollection = this.database.collection('User');
        const user = await userCollection.findOne({ username: username, "channelsAndMuted.channelName": channelName });
        if (!user) {
            await userCollection.updateOne(
                { username: username },
                { $addToSet: { channelsAndMuted: { channelName: channelName, mutedPlayers: [] } } }
            );
            const updatedUser = await userCollection.findOne({ username: username });
            console.log(`Channel "${channelName}" added to user "${username}". New channelsAndMuted: `, updatedUser?.channelsAndMuted);
        } else {
            console.log(`Channel "${channelName}" already exists for user "${username}".`);
        }
    }

    async updateChatHistory(message: Message, chatName: string): Promise<void> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        console.log('calling from updatedhistory db', chatName);
        const chat = await collection.find({ name: chatName }).toArray();
        console.log('chat before', chat[0]);

        if (!chat[0].history) {
            chat[0].history = [];
        }
        console.log('chat history db', chat[0].history);

        chat[0].history.push(message);
        console.log('chat', chat[0]);
        await collection.replaceOne({ name: chatName }, chat[0]);
    }


    async getSingleChat(chatName: string): Promise<Chat> {
        const collection = this.database.collection(this.CHAT_COLLECTION);
        const chat = await collection.find({ name: chatName }).toArray();
        return chat.map((chat) => ({
            name: chat.name,
            history: chat.history,
            creatorName: chat.creatorName,
            playersInChat: chat.playersInChat,
        }))[0];
    }

    async verifyUsernameAvailability(username: string): Promise<boolean> {
        const collection = this.database.collection(this.USER_COLLECTION);
        return (await collection.find({ username }).toArray()).length === 0;
    }

    async createUser(user: IUser): Promise<string> {
        const collection = this.database.collection(this.USER_COLLECTION);
        const result = await collection.insertOne(user);
        this.joinChannel(user.username, 'general');
        return result.insertedId.toHexString();
    }

    async getUser(username: string): Promise<IUser> {
        const collection = this.database.collection(this.USER_COLLECTION);
        const dbUser = await collection.find({ username }).toArray();
        return dbUser.map((user) => ({
            username: user.username,
            password: user.password,
            email: user.email,
            channelsAndMuted: user.channelsAndMuted,
            avatar: user.avatar,
            connectionHistory: user.connectionHistory,
            gameHistory: user.gameHistory,
            isLanguageFrench: user.isLanguageFrench,
            isThemeDark: user.isThemeDark,
            dinars: user.dinars,
            boughtItems: user.boughtItems ? user.boughtItems : [],
            gameStatistics: user.gameStatistics,
            id: user._id.toHexString(),
            replays: user.replays,
        }))[0];
    }

    async updateUserConnectionHistory(username: string, history: UserConnectionHistory): Promise<void> {
        const collection = this.database.collection(this.USER_COLLECTION);
        const user = await collection
            .find({ username })
            .toArray()
            .then((user) => user[0]);
        user.connectionHistory.push(history);
        await collection.replaceOne({ username }, user);
    }

    async getUserConnectionHistory(username: string): Promise<UserConnectionHistory[]> {
        const collection = this.database.collection(this.USER_COLLECTION);
        const user = await collection
            .find({ username })
            .toArray()
            .then((user) => user[0]);
        return user.connectionHistory;
    }

    //TODO: updating userStats at the end of the game
    async updateUserStats(user: IUser, gameStatistics: Statistics): Promise<void> {
        const collection = this.database.collection(this.USER_COLLECTION);
        // const user = await collecltion
        //     .find({ username: username })
        //     .toArray()
        //     .then((user) => user[0]);
        await collection.replaceOne({ username: user.username }, user);
    }

    async updateUserAvatar(username: string, newAvatar: string): Promise<boolean> {
        const collection = this.database.collection(this.USER_COLLECTION);
        const user = await collection
            .find({ username })
            .toArray()
            .then((user) => user[0]);
        user.avatar = newAvatar;
        await collection.replaceOne({ username }, user);
        return true;
    }

    async updateUserGameHistory(username: string, history: GameHistoryEntry): Promise<void> {
        await this.userCollection.updateOne({ username }, { $push: { gameHistory: history } });
    }

    async getUserGameHistory(username: string): Promise<GameHistory | null> {
        const user = await this.userCollection.findOne({ username }, { projection: { gameHistory: 1, _id: 0 } });
        if (user) {
            return user.gameHistory as GameHistory;
        }
        return null;
    }

    async getUserAverages(username: string): Promise<{ averageDifferencePerGame: number; averageTimePerGame: number }> {
        const user = await this.userCollection.findOne({ username }, { projection: { gameStatistics: 1, _id: 0 } });
        if (user) {
            return {
                averageDifferencePerGame: user.gameStatistics.averageDifferencePerGame,
                averageTimePerGame: user.gameStatistics.averageTimePerGame,
            };
        }
        return { averageDifferencePerGame: 0, averageTimePerGame: 0 };
    }

    async updateUserUsername(username: string, newUsername: string): Promise<boolean> {
        const collection = this.database.collection(this.USER_COLLECTION);
        const user = await collection
            .find({ username })
            .toArray()
            .then((user) => user[0]);
        user.username = newUsername;
        await collection.replaceOne({ username }, user);
        return true;
    }

    async setUserLanguage(username: string, isLanguageFrench: boolean): Promise<void> {
        await this.userCollection.updateOne({ username }, { $set: { isLanguageFrench } });
    }

    async setUserTheme(username: string, isThemeDark: boolean): Promise<void> {
        await this.userCollection.updateOne({ username }, { $set: { isThemeDark } });
    }

    // boutique
    async updateUserDinarsAndBoughtItems(username: string, dinars: number, boughtItems?: Item[]): Promise<boolean> {
        const collecltion = this.database.collection(this.USER_COLLECTION);
        const user = await collecltion
            .find({ username: username })
            .toArray()
            .then((user) => user[0]);
        user.dinars = dinars;
        if (boughtItems) {
            user.boughtItems = boughtItems;
        }
        await collecltion.replaceOne({ username: username }, user);
        return true;
    }

    async updateUserDinars(username: string, dinars: number) {
        await this.userCollection.updateOne({ username }, { $set: { dinars: dinars } });
        return dinars;
    }





    // OLD Server
    async saveGameToHistory(gameEnded: GameEnded) {
        const collection = this.database.collection(this.HISTORY_COLLECTION);
        await collection.insertOne({
            startDate: gameEnded.startDate,
            duration: gameEnded.duration,
            gameMode: gameEnded.gameMode,
            player1: gameEnded.player1,
            player2: gameEnded.player2,
            quit: gameEnded.quit,
            quitCoop: gameEnded.quitCoop,
        });
    }

    async getHistory(): Promise<GameEnded[]> {
        const collection = this.database.collection(this.HISTORY_COLLECTION);
        const games = await collection.find({}).toArray();
        return games.map((game) => ({
            startDate: game.startDate,
            duration: game.duration,
            gameMode: game.gameMode,
            player1: game.player1,
            player2: game.player2,
            quit: game.quit,
            quitCoop: game.quitCoop,
        }));
    }

    async deleteHistory(): Promise<void> {
        const collection = this.database.collection(this.HISTORY_COLLECTION);
        await collection.deleteMany({});
    }

    async setNewTime(newTime: NewTime): Promise<boolean> {
        const bestTimesAll = await this.getBestTimes(newTime.gameCardId);
        if (bestTimesAll.length != 6) {
            return false;
        }
        const bestTimes = bestTimesAll.filter((time) => time.gameMode === newTime.gameMode).sort((a, b) => b.duration - a.duration);
        const isBestTime = bestTimes && bestTimes[0] && newTime.duration < bestTimes[0].duration;
        if (isBestTime && bestTimes.length === 3) {
            await this.database.collection(this.BEST_TIME_COLLECTION).replaceOne(
                { gameCardId: newTime.gameCardId, duration: bestTimes[0].duration, gameMode: newTime.gameMode },
                {
                    duration: newTime.duration,
                    gameMode: newTime.gameMode,
                    player: newTime.player,
                    gameCardId: newTime.gameCardId,
                },
            );
            let pos = 3;
            while (pos > 0 && newTime.duration > bestTimes[--pos].duration);
            this.messengerService.sendGlobalMessage(newTime, pos);
        }
        return isBestTime;
    }

    async getBestTimes(gameCardId: string): Promise<NewTime[]> {
        const collection = this.database.collection(this.BEST_TIME_COLLECTION);
        const games = await collection.find({ gameCardId }).toArray();
        return games.map((game) => ({
            gameMode: game.gameMode,
            duration: game.duration,
            player: game.player,
            gameCardId: game.gameCardId,
        })) as NewTime[];
    }

    async setMockData(gameCardId: string, gameMode: GameMode) {
        const collection = this.database.collection(this.BEST_TIME_COLLECTION);
        await collection.insertMany([
            {
                duration: 30000,
                gameMode,
                player: 'Booba',
                gameCardId,
            },
            {
                duration: 40000,
                gameMode,
                player: 'Kaaris',
                gameCardId,
            },
            {
                duration: 50000,
                gameMode,
                player: 'Jul',
                gameCardId,
            },
        ]);
    }

    async deleteBestTimes(gameCardId: string) {
        const collection = this.database.collection(this.BEST_TIME_COLLECTION);
        await collection.deleteMany({ gameCardId });
    }

    async deleteAllBestTimes() {
        const collection = this.database.collection(this.BEST_TIME_COLLECTION);
        await collection.deleteMany({});
    }

    async resetBestTimes(gameCardId: string) {
        // à améliorer
        await this.deleteBestTimes(gameCardId);
        await this.setMockData(gameCardId, GameMode.CLASSIQUE_SOLO);
        await this.setMockData(gameCardId, GameMode.CLASSIQUE_1V1);
    }

    async resetAllBestTimes(gamesId: string[]) {
        // à améliorer
        for (const gameCardId of gamesId) {
            await this.resetBestTimes(gameCardId);
        }
    }

    async getConstants(): Promise<Constants> {
        const collection = this.database.collection(this.CONSTANTS_COLLECTION);
        const constants = await collection.findOne({});
        if (constants) {
            return {
                initialTime: constants.initialTime,
                penalty: constants.penalty,
                timeWon: constants.timeWon,
            } as Constants;
        } else {
            return {} as Constants;
        }
    }

    async setConstants(constants: Constants): Promise<void> {
        console.log(constants);
        const collection = this.database.collection(this.CONSTANTS_COLLECTION);
        await collection.replaceOne({}, constants, { upsert: true });
    }

    //retour nvx server
    async updateUserLanguage(username: string, isLanguageFrench: boolean): Promise<void> {
        console.log('isLanguageFrench', isLanguageFrench);
        const collection = this.database.collection(this.USER_COLLECTION);
        await collection.updateOne({ username }, { $set: { isLanguageFrench } });
    }

    async updateUserTheme(username: string, isThemeDark: boolean): Promise<void> {
        console.log('is isThemeDark ?', isThemeDark);
        const collection = this.database.collection(this.USER_COLLECTION);
        await collection.updateOne({ username }, { $set: { isThemeDark } });
    }

    async saveReplay(userId: string, replay : Replay) {
        console.log('uId '+ userId + ' replay ' + replay);
        const collection = this.database.collection(this.USER_COLLECTION);
         await collection.updateOne({ id: userId }, { $push: { replays: replay } });   
    }

    async getUserReplayHistory(userId: string): Promise<Replay[]> {
        const collection = this.database.collection(this.USER_COLLECTION);
        const user = await collection.findOne({ id: userId });
        return user?.replays;
    }

    async deleteReplay(userId: string, replayDateHeure: string) {
        const collection = this.database.collection(this.USER_COLLECTION);
        await collection.updateOne({ id: userId }, { $pull: { replays: { dateHeure: replayDateHeure } } });
    }
}
