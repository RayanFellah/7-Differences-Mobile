import { Application } from '@app/app';
import { Game, Status } from '@common/game';
import { GameCardTemplate } from '@common/game-card-template';
import { Message } from '@common/message';
import { Player } from '@common/player';
import { Vec2 } from '@common/vec2';
import { randomUUID } from 'crypto';
import * as http from 'http';
import { AddressInfo } from 'net';

import { Chat } from '@common/chat';
import { GameHistoryEntry } from '@common/gameHistory';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { DatabaseService } from './services/database.service';
import { FileSystemService } from './services/file-system.service';
import { GamesManagerService } from './services/games-manager.service';
import { ImageUpdaterLimiteService } from './services/imageUpdaterLimite.service';
import { MessengerService } from './services/messenger.service';
import { OrderGeneratorService } from './services/orderGenerator.service';
import { UserService } from './services/user.service';
import { ValidationService } from './services/validation.service';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly baseDix: number = 10;
    private server: http.Server;
    private userService: UserService;
    // private socketClientManager: SocketClientManager;

    private io: io.Server;

    private liveGamesService;

    constructor(
        private readonly application: Application,
        private readonly validationService: ValidationService,
        private readonly gamesManager: GamesManagerService,
        private messengerService: MessengerService,
        private orderGenerator: OrderGeneratorService,
        private fileService: FileSystemService,
        private databaseService: DatabaseService,
        private imageUpdaterLimiteService: ImageUpdaterLimiteService
    ) {
        this.liveGamesService = this.gamesManager.getLiveGamesService();
    }

    init(): void {


        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());

        /// SOCKET
        console.log('init socket 1');
        this.io = new io.Server(this.server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        console.log('init socket 2');
        this.messengerService.init(this.io);

        console.log('init socket 3');

        this.handleSockets();
        console.log('init socket 4');

        this.server.listen(Server.appPort);
        console.log('init socket 5');


        // this.socketClientManager = new SocketClientManager(this.io);
        this.userService = this.application.userService;

        // this.application.userFileSystemController.setSocketClientManager(this.socketClientManager);
        // this.io.
    }


    handleSockets(): void {
        this.io.on('connection', (socket: io.Socket) => {
            console.log('connected new client io', socket.id);

            socket.on('attachSocketToActiveUser', (username: string) => {
                console.log('attachSocketToActiveUser', username);
                this.userService.addSocketToActiveUser(username, socket);
            });
            // this.socketClientManager.addClient(socket);

            socket.emit('connected', { message: socket.id });

            socket.on('disconnect', () => {
                // logout
            });

            socket.on('updateChatHistory', (data) => {
                const message = {
                    body: data.body,
                    sender: data.sender,
                    senderType: data.senderType,
                    time: data.time,
                    avatar: data.avatar

                } as Message;
                const chatName = data.chatName as string;
                if (message) {
                    this.databaseService.updateChatHistory(message, chatName).then(() => {
                        this.databaseService.getSingleChat(chatName).then((chat) => {
                            this.io.emit('updatedHistory', chat);
                        });
                    });
                }
            });

            socket.on('getChatList', () => {
                this.sendUpdatedChatList(socket);
            });

            socket.on('createChat', (data) => {
                const chat = data as Chat;
                const username = chat.creatorName;
                const channelName = chat.name;
                if (chat) {
                    this.databaseService.createChat(chat).then(() => {
                        this.sendUpdatedChatList(socket);
                        this.sendUserChatList(socket, username);
                    });

                this.databaseService.addChannelToUser(username, channelName);
                socket.emit('updateChannelList');


                }
            });

            socket.on('getChatHistory', (chatName) => {
                this.databaseService.getSingleChat(chatName).then((chat) => {
                    this.io.emit('updatedHistory', chat);
                });
            });

             // get My channels
             socket.on('getMyChannels', (data) => {
               // console.log('getMyChannels request from server for user', data.username);
                this.sendUserChatList(socket, data.username);
            });


            // join logique server
            socket.on('joinChannel', async (data) => {
                const { username, channelName } = data;
                await this.databaseService.joinChannel(username, channelName);
                socket.emit('channelJoinSuccess', { channelName });
                socket.emit('updateChannelList');
                this.databaseService.addChannelToUser(username, channelName);
            });

            socket.on('leaveChannel', async (data) => {
                const { channelName, username } = data;
                await this.databaseService.leaveChannel(channelName, username);
                console.log('leaveChannel from server:', channelName);
                socket.emit('updateChannelList');

            });


            socket.on('deleteChannel', async (channelName) => {
                console.log('deleteChannel from server:', channelName);
                await this.databaseService.deleteChannel(channelName);
                console.log('deleteChannel from server:', channelName);
                socket.emit('updateChannelList');

            });

            //sourdine
            socket.on('mutePlayerInChannel', async (data) => {
                const { username, channelName, playerToMute } = data;

                await this.databaseService.mutePlayerInChannel(username, channelName, playerToMute);
                socket.emit('playerMuted', { channelName, playerToMute });
                console.log('form server muted', channelName);

            });

            socket.on('unmutePlayerInChannel', async (data) => {
                const { username, channelName, playerToUnmute } = data;

                await this.databaseService.unmutePlayerInChannel(username, channelName, playerToUnmute);
                socket.emit('playerUnmuted', { channelName, playerToUnmute });

            });

            socket.on('getMutedPlayers', async (data) => {
                const { username } = data;
                const mutedPlayers = await this.databaseService.getMutedPlayers(username);
                socket.emit('mutedPlayersResponse', mutedPlayers);
            });

            socket.on('requestPlayersInChat', async (data) => {
                const playersInChat = await this.databaseService.getPlayersInChat(data.channelName);
                socket.emit('responsePlayersInChat', { playersInChat });
               // console.log('playersInChat from server', playersInChat);
            });

            socket.on('getMutedPlayersInChannel', async (data) => {
                const { username } = data;
                const mutedPlayersPerChannel = await this.databaseService.getMutedPlayersInChannel(username);
               // console.log('mutedPlayersPerChannel from server', mutedPlayersPerChannel);
                socket.emit('mutedPlayersPerChannelResponse', mutedPlayersPerChannel);
            });

            //Old server
            socket.on('askGameCardStatus', (id) => {
                const isWaiting = id !== undefined && this.gamesManager.isWaitingGameCard(id);
                const isFull = id !== undefined && this.gamesManager.isFullGameCard(id);
                socket.emit('gameCardStatus', { cardId: id, isWaiting, isFull });
            });

            socket.on('click', (data) => {
                console.log('click', data);
                const gameId = this.getSocketRoom(socket);
                const players = this.liveGamesService.getPlayers(gameId);
                const player = players?.find((p: Player) => p.id === socket.id);
                const result = this.validationService.validate(data);
                socket.emit('validation', result);
                console.log('Getting in the validation emit');
                if (result.validation) {
                    socket.to(gameId).emit('validation', result);
                    const counters = this.liveGamesService.incrementCounter(gameId, socket.id);
                    const game= this.liveGamesService.getGameById(gameId);
                    const difference=result.diffFound;
                    console.log('diff', difference[0]);
                    game?.addFounDifference(difference[0]);
                    if (players) {
                        const coords = data.pos as Vec2;

                        this.io.to(gameId).emit("diffFound", { counters, coords });
                        console.log('diffFound', counters, coords);

                    }

                    let message = `Différence trouvée` + (player?.name ? ` par ${player.name}` : '') + '.';
                    this.io.to(gameId).emit("newMessage", new Message(message));

                    const stat = this.liveGamesService.updateStatus(gameId);
                    if (stat.status === Status.ENDED) {
                        players?.forEach(async (player) => {
                            const date: Date = new Date(Date.now());
                            const gameHistoryEntry: GameHistoryEntry = {
                                date: date,
                                wonGame: stat.winner === player?.name,
                            }
                            await this.userService.updateUserGameHistory(player.name, gameHistoryEntry)
                        })
                        this.io.in(gameId).emit("End", stat.winner);
                        this.databaseService.deleteChannel(gameId); //delete if ended
                    }
                } else {
                    let message = `Erreur` + (player?.name ? ` par ${player.name}` : '') + '.';
                    this.io.to(gameId).emit("newMessage", new Message(message));
                }
            });

            socket.on('joinGameSolo', (data: any) => {
                socket.join(randomUUID());
            });

            /**
             * @param data { gameCardId, username }
             */
            socket.on('joinGameClassic1v1', async (data) => {

                if (data.gameCardId && data.username) {
                    if (!this.gamesManager.isFullGameCard(data.gameCardId)) {
                        const player = new Player(socket.id, data.username); // init new player

                        const gameRes = await this.gamesManager.joinGameClassic1v1(data.gameCardId, player) as { id: string, status: Status };   // join or create game

                        socket.join(gameRes.id);    // player join room

                        if (gameRes.status === Status.WAITING_PLAYER) {
                            socket.emit('createdNewRoom', { cardId: data.gameCardId }); // inform player that he created a room
                        } else {
                            socket.to(gameRes.id).emit('newPlayer', { username: player.name });   // inform creator that a new player joined
                        }

                        this.updateButtonStatus(gameRes.id);    // update all buttons creer/joindre
                    } else {
                        socket.emit('gameFull', { cardId: data.gameCardId }); // inform player that no game is available
                    }
                }
            });

            socket.on('joinGameMulti', async (data) => {

                if (data.gameCardId && data.username) {
                    console.log('joinGameMulti', data.gameCardId);

                    if (!this.gamesManager.isFullGameMulti(data.gameCardId)) {
                        console.log('joinGameMulti', data.gameCardId, 'not full');

                        const player = new Player(socket.id, data.username); // init new player

                        // Création de joinGameById
                        const gameRes = await this.gamesManager.joinGameMulti(data.gameCardId, player) as { id: string, status: Status };   // join or create game

                        socket.join(gameRes.id);    // player join room

                        console.log('gameres', gameRes, gameRes.status);
                        console.log('room', gameRes.id);

                        if (gameRes.status === Status.WAITING_PLAYER) {
                            console.log('joinGameMulti', data.gameCardId, 'waiting player');
                            socket.emit('createdNewRoom', { cardId: data.gameCardId }); // inform player that he created a room
                        } else {
                            console.log('joinGameMulti', data.gameCardId, 'new player');
                            socket.to(gameRes.id).emit('newPlayer', { username: player.name });   // inform creator that a new player joined
                        }

                        this.updateButtonStatusMulti(gameRes.id);    // update all buttons creer/joindre
                    } else {
                        console.log('joinGameMulti', data.gameCardId, 'full');
                        socket.emit('gameFull', { cardId: data.gameCardId }); // inform player that no game is available
                    }


                }
                console.log('-------------------');
            });
            socket.on('leaveLobby', async(data: any) => {
                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getGameById(gameId);
                console.log('leaveLobby', game);
                if(game?.getPlayers()){
                    for(const player of game?.getPlayers()){
                        if(player.id===socket.id){
                            console.log('leaveLobby', player.name);
                              game.leaveLobby(player);
                              this.io.to(gameId).emit('players', game.getPlayers());
                              console.log('leaveLobby', game.getPlayers());
                              console.log('leaveLobbyActifs', game.actifPlayers);
                              socket.leave(gameId);
                              this.databaseService.leaveGameChat(player.name,gameId);
                              socket.emit('updateMyChannels');
                            
                          }
                     }
                }
            });


            socket.on('leaveLobbyCreator', async(data: any) => {
                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getGameById(gameId);
                if (!game) {
                    console.log('Game not found');
                    return; // Game not found
                }else{
                    console.log('leaveLobbyCreator', game);
                    const players = game.getPlayers()
                    for(let player of players){
                        this.io.to(player.id).emit('creatorLeft',{playerName: player.name});
                        this.databaseService.leaveGameChat(player.name,gameId);
                        socket.emit('updateMyChannels');
                        console.log('player kicked from channel', player.name);
                    }
                    game.status = Status.ENDED;
                    console.log(game.status);

                }
              
            });




            /// MULTI SOCKETS MODE CLASSIQUE ///



            socket.on('createGameMulti', async (data) => {
                console.log('CreateGameMulti with constants', data);
                if (data.gameCardId && data.username) {
                    console.log('CreateGameMulti after', data.gameId);
                    const player = new Player(socket.id, data.username); // init new player
                    const gameRes = await this.gamesManager.createGameMulti(data.gameCardId, player, data.gameAccessType);
                    socket.join(gameRes.gameId);    // player join room
                    socket.emit('createdNewRoom', { cardId: data.gameCardId }); // inform player that he created a room
                    //added for  undefined consts
                    if((data.initialTime!=undefined) &&  (data.cheatMode!=undefined)){
                        gameRes.setClassiConstants(data.initialTime, data.cheatMode);
                        console.log('setClassicConstants', data.initialTime, data.cheatMode);
                        console.log(gameRes);
                    }
                    this.updateLobbies();
                    console.log('CreateGameMulti after', gameRes.gameId);
            
                    //here create channel for game with the gameid as a name (system as creator)
                    this.databaseService.createGameChat(data.username,gameRes.gameId);
                    console.log('CREATED CHAT FROM FS', gameRes.gameId);
                    socket.emit('updateMyChannels');



                }
                console.log('-------------------');
            });


            socket.on('joinGameMultiById', async (data) => {
                console.log('joinGameMultiById', data.lobbyId);
                console.log(data.username, data.gameCardId, data.lobbyId);
                if (data.username && data.gameCardId) {
                    console.log('join', data.gameCardId, data.username);
                    const player = new Player(socket.id, data.username); // init new player
                    const gameRes = await this.gamesManager.joinGameMultiById(data.gameCardId, player, data.lobbyId);
                    if (gameRes) {
                        socket.join(gameRes.gameId);    // player join room
                        console.log('joinGameMulti', data.gameCardId, 'new player');
                        socket.to(gameRes.gameId).emit('newPlayer', { username: player.name });
                        console.log(this.gamesManager.getAllGames());
                        this.databaseService.joinGameChat(data.username , gameRes.gameId); // join gamechat
                        socket.emit('updateMyChannels');


                    } else {

                        //TODO: send error message
                    }
                }

                console.log('-------------------');

            });
            socket.on('joinObserverMultiById', async(data: any) => {
                console.log('joinObserverMultiById', data.lobbyId);
                console.log(data.username, data.gameCardId, data.lobbyId);
                if (data.username && data.gameCardId && data.lobbyId) {
                    console.log('joinObserver', data.gameCardId, data.username);
                   socket.join(data.lobbyId);    // player join room
                   this.databaseService.joinGameChat(data.username,data.lobbyId); // join gamechat for observer
                   socket.emit('updateMyChannels');
                   this.updateLobbies();
                   const game = this.gamesManager.getMultiById(data.lobbyId);
                   const players = game?.getPlayers();
                   const names = [];
                   if(players && game){
                    for (let i = 0; i < players.length; i++) {
                     
                        names.push(players[i].name);
                    }
                    const count=game.getCounters();
                    console.log('found',game.diffFound);
                    const colorObs=game.getColor();
                    this.io.to(socket.id).emit('observerJoined',{ cardId: game?.gameCard?.id, gameName: data.gameName, players: names, counters:count, found:game.diffFound, color:colorObs, observerName: data.username });
                    if(game.actifPlayers[0]==1){
                        this.io.to(game.getPlayer(0).id).emit('requestTimerRedirection', socket.id);

                    }else if (game.actifPlayers[1]==1){
                        this.io.to(game.getPlayer(1).id).emit('requestTimerRedirection', socket.id);

                    }else if (game.actifPlayers[2]==1){
                        this.io.to(game.getPlayer(2).id).emit('requestTimerRedirection', socket.id);

                    }else if (game.actifPlayers[3]==1){
                        this.io.to(game.getPlayer(3).id).emit('requestTimerRedirection', socket.id);

                    }
                    
                    
                    this.databaseService.joinGameChat(data.username,data.gameCardId); // join gamechat for observer
                    socket.emit('updateMyChannels');
                    game.addObserver();
                    this.io.to(game.gameId).emit('updateObserversNumber', game.getNumberOfObservers());


                
                    //TODO if leader leaves
                   }
       
                }


            });
            socket.on('timerRedirection', async (data: any) => {
                if(data.socket){

                    this.io.to(data.socket).emit('updateTimer', data.timer);
                }
            


            });
            socket.on('observerRectangleTransfer', async (data: any) => {
                if(data){
                    const room = this.getSocketRoom(socket);
                    if(data.broadcast){
                        this.io.to(room).emit('rectangleTransfer', data);

                    }else{
                        console.log('observerRectangleTransfer', data);

                        const player = this.gamesManager.getGameById(room)?.getPlayer(data.playerNumber);
                        console.log('player', player);
                        if(player){
                            this.io.to(player.id).emit('rectangleTransfer', data);
                        }

                    }


                }


            }); 
            socket.on('getPlayers', (data: any) => {
                console.log('getPlayers', data);
                    const room = this.getSocketRoom(socket);
                    const players = this.gamesManager.getGameById(room)?.getPlayers();
                    this.io.to(socket.id).emit('players', players);
                    console.log('players', players);
                 




            }); 
            




            socket.on('deleteGameMultiById', async (data: any) => {

                if (data.gameCardId) {
                    console.log('deleteGameMultiById', data.gameCardId);
                    this.gamesManager.deleteGameMultiById(data.gameCardId);
                    socket.to(data.gameCardId).emit('abortGame', { /* TODO MESSAGE */ });      // INFORM OTHER PLAYERS
                    this.updateLobbies();

                }
                console.log('-------------------');
            });




            socket.on('startGameMulti', (data: any) => {

                console.log('startGameMulti', data);

                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getMultiById(gameId);
                if (game) {


                    const players = game.getPlayers();
                    const names = [];

                    this.gamesManager.startMultiGame(gameId);


                    // socket.to(gameId).emit('startGame');

                    socket.to(gameId).emit('startGame',
                        { cardId: game?.gameCard?.id, gameName: data.gameName, username: game?.getPlayers()[0].name });    // inform the other player to start


                    this.io.to(game.getPlayer(0).id).emit("leader"); //inform game leader
                    for (let i = 0; i < players.length; i++) {
                        this.io.to(game.getPlayer(i).id).emit('ClassicConstants', { initialTime: game.initialTime,cheatMode: game.cheatMode });
                        this.io.to(game.getPlayer(i).id).emit('PlayerNumber', i);
                        names.push(players[i].name);
                    }
                    console.log(names);




                    socket.to(gameId).emit('Players', names);
                    this.io.to(game.getPlayer(0).id).emit('Players', names);
                    this.updateLobbies();
                }
                console.log('-------------------');
            });
            socket.on('leaveGameMulti', (data: any) => {
              
                if(data && data.observer){
                    const gameId = this.getSocketRoom(socket);
                    const game = this.gamesManager.getMultiById(gameId);

                    console.log('obsr name',data.observerName);
                    
                    if (game) {
                       
                        console.log('leaveObserv from channel', data.observerName);
                        this.databaseService.leaveGameChat(data.observerName , gameId);
                        socket.emit('updateMyChannels');
                        
                        game.removeObserver();
                        console.log('leaveObs', game.getNumberOfObservers());
                        this.io.to(game.gameId).emit('updateObserversNumber', game.getNumberOfObservers());
                       
                
                    }


                }else{
                console.log('leaveGameMulti', data);

                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getMultiById(gameId);
                if (game) {
                    const players = game.getPlayers();
                    const player = players.find((p: Player) => p.id === socket.id);
                    if (player) {
                        socket.leave(gameId);
                        this.gamesManager.leaveGameMulti(gameId, player);
                        this.databaseService.leaveGameChat(player.name,gameId);//leavechat when leave game 
                        socket.emit('updateMyChannels');
                        const update=game.updateStatus();
                        if (update.status === Status.ENDED) {
                            this.io.to(gameId).emit('End', { winner: update.winner });
                            this.databaseService.deleteChannel(gameId); //delete if ended
                            socket.emit('updateMyChannels');

                        }

                        
                    }
                }
                   
            
                
                console.log('-------------------');
                }
            });





            /// FIN MULTI SOCKETS MODE CLASSIQUE ///

            /// SOCKETS LIMITE ///
            socket.on('createGameLimite', async (data: any) => {

                console.log('createGameLimite', data);
                //console.log('createGameLimite', data.username);
                if (data.username) {
                    console.log('createGameLimite', data.username);
                    console.log('Game type', data.gameAccessType);
                    const player = new Player(socket.id, data.username); // init new player
                    const gameRes = await this.gamesManager.createGameLimite(player, data.gameAccessType);
                    socket.join(gameRes.gameId);    // player join room
                    socket.emit('createdNewRoomLimite', {}); // inform player that he created a room
                    this.databaseService.createGameChat(data.username,gameRes.gameId);
                    socket.emit('updateMyChannels');
                    if((data.initialTime!=undefined) && (data.penalty!=undefined) && (data.timeWon!=undefined) && (data.cheatMode!=undefined)){
                        gameRes.setConstants(data.initialTime, data.penalty, data.timeWon, data.cheatMode, data.maxTime);
                        console.log('setConstants', data.initialTime, data.penalty, data.timeWon, data.cheatMode);
                        console.log(gameRes);
                    }

                    this.updateLobbiesLimite();
                 }
            });
            socket.on('joinGameLimiteById', async (data: any) => {
                if (data.username) {
                    const player = new Player(socket.id, data.username); // init new player
                    const gameRes = await this.gamesManager.joinGameLimiteById(player, data.lobbyId);
                    if (gameRes) {
                        socket.join(gameRes.gameId);    // player join room
                        socket.to(gameRes.gameId).emit('newPlayer', { username: player.name });
                        console.log('joinGameLimite', data.username, data.lobbyId);
                        console.log(this.gamesManager.getAllGames());
                        this.databaseService.joinGameChat(data.username,gameRes.gameId);
                        socket.emit('updateMyChannels');
                    } else {

                        //TODO: send error message

                    }
                }
            });
            socket.on('startGameLimite', (data: any) => {
                const gameId = this.getSocketRoom(socket); // TODO : verifier si plusieurs room
                const game = this.gamesManager.getLimiteById(gameId);
                if (game) {
                    const players = game.getPlayers();
                    const names = [];
                    this.gamesManager.startLimiteGame(gameId);
                    socket.to(gameId).emit('startGameLimite', { username: game?.getPlayers()[0].name });
                    this.io.to(game.getPlayer(0).id).emit("leader");


                    for (let i = 0; i < players.length; i++) {
                        this.io.to(game.getPlayer(i).id).emit('PlayerNumber', i);
                        this.io.to(game.getPlayer(i).id).emit('Constants', { initialTime: game.initialTime, penalty: game.penaltyTime, timeWon: game.timeWon, cheatMode: game.cheatMode, maxTime: game.maxTime});
                        names.push(players[i].name);
                    }
                    console.log(names);




                    socket.to(gameId).emit('Players', names);
                    this.io.to(game.getPlayer(0).id).emit('Players', names);





                }
            });
            socket.on('getNextCardLimite', (data: any) => {
                console.log('---getNextCardLimite---', data);
                const gameId = this.getSocketRoom(socket); // TODO : verifier si plusieurs room
                const game = this.gamesManager.getLimiteById(gameId);
                if (game) {
                    const status = game.updateStatus();
                    if (status.status === Status.ENDED) {
                        this.io.to(gameId).emit('End', { winner: status.winner });
                        this.databaseService.deleteChannel(gameId); //delete if ended
                    } else {


                        const data = game.next();
                        if (data) {

                            console.log('responsenextCardLimite', data);
                            this.io.to(gameId).emit('nextCardLimite', { card: data.card, remove: data.remove });
                        }
                    }
                }


            });
            socket.on('removeDifferences', async (data: any) => {

                const gameId = this.getSocketRoom(socket); // TODO : verifier si plusieurs room
                const game = this.gamesManager.getLimiteById(gameId);
                if (game) {
                    const result = await this.imageUpdaterLimiteService.removeDifferences(data.Img1, data.Img2, data.remove,);
                    this.io.to(gameId).emit('imageUpdated', { Img1: result.left, Img2: result.right, remove: data.remove });


                }
            });

            socket.on('timeFinished', async (data: any) => {
                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getLimiteById(gameId);
                if (game) {
                this.databaseService.deleteChannel(gameId); //delete
                console.log('deletedLimited', gameId);
                }
            });



            socket.on('leaveGameLimite', (data: any) => {
                
                if(data && data.observer){
                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getLimiteById(gameId);
                if (game) {
                    game.removeObserver();
                    this.databaseService.leaveGameChat(data.observerName,gameId);
                    socket.emit('updateMyChannels');
                    console.log('removed observerLimited', data.observerName);
                    this.io.to(game.gameId).emit('updateObserversNumber', game.getNumberOfObservers());
                   
                   
            
                }
                    
                    
                }else{
                console.log('leaveGameLimite', data);

                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getLimiteById(gameId);
                if (game) {
                    const players = game.getPlayers(); 
                    const player = players.find((p: Player) => p.id === socket.id);
                    if (player) {
                        socket.leave(gameId);
                        this.gamesManager.leaveGameLimite(gameId, player);
                        const update=game.updateStatus();
                        this.databaseService.leaveGameChat(player.name,gameId);
                        socket.emit('updateMyChannels');
                        if (update.status === Status.ENDED) {
                            this.io.to(gameId).emit('End', { winner: update.winner });
                            this.databaseService.deleteChannel(gameId); //delete if ended ;  never called
                            console.log('time is over111111');
                        }

                        
                    }
                   
            
                }
                console.log('-------------------');
                }
            }
            );
            socket.on('joinObserverLimiteById', async(data: any) => {

                console.log('joinObserverLimiteById', data.lobbyId);
                console.log(data.username, data.lobbyId);
                if (data.username && data.lobbyId) {
                    console.log('joinObserver', data.username);
                   socket.join(data.lobbyId);    // player join room
                   this.databaseService.joinGameChat(data.username,data.lobbyId); // join gamechat for observer TL 
                   socket.emit('updateMyChannels');
                   this.updateLobbiesLimite();
                   const game = this.gamesManager.getLimiteById(data.lobbyId);
                   const players = game?.getPlayers();
                   const names = [];
                   if(players && game){
                    for (let i = 0; i < players.length; i++) {
                     
                        names.push(players[i].name);
                    }
                    const count=game.getCounters();
                    console.log('found',game.diffFound);
                    const colorObs=game.getColor();
                    this.io.to(socket.id).emit('observerJoinedLimite',{ gameName: data.gameName, players: names, counters:count, Img1:this.imageUpdaterLimiteService.lastImg1Src, Img2:this.imageUpdaterLimiteService.lastImg2Src, color:colorObs,observerName: data.username });
                    if(game.actifPlayers[0]==1){
                        this.io.to(game.getPlayer(0).id).emit('requestTimerRedirection', socket.id);

                    }else if (game.actifPlayers[1]==1){
                        this.io.to(game.getPlayer(1).id).emit('requestTimerRedirection', socket.id);

                    }else if (game.actifPlayers[2]==1){
                        this.io.to(game.getPlayer(2).id).emit('requestTimerRedirection', socket.id);

                    }else if (game.actifPlayers[3]==1){
                        this.io.to(game.getPlayer(3).id).emit('requestTimerRedirection', socket.id);

                    }


                    game.addObserver();
                    this.io.to(game.gameId).emit('updateObserversNumber', game.getNumberOfObservers());
                
                  
                   }
       
                }


            });

            socket.on('endMoney', async (data) => {
                const username = data.username;
                const dinars = data.money;
                await this.databaseService.updateUserDinars(username, dinars);
                console.log('endMoney', username, dinars);
            })

            
            /// FIN SOCKETS LIMITE ///

            /// Android///

            socket.on('getNamesAndroid', async (data: any) => {
                console.log('getNamesAndroid', data);
                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getGameById(gameId);
                const players = game?.getPlayers();
                const names = [];
                if(players){
                    for (let i = 0; i < players.length; i++) {
                     
                        names.push(players[i].name);
                    }
                    console.log(names);
                    this.io.to(socket.id).emit('returnNamesAndroid', { PlayersNames: names });
                }


            });

            socket.on('getConstantsAndroid', async (data: any) => { 
                console.log('getConstantsAndroid', data);
                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.getGameById(gameId);
                if(game){
                    this.io.to(socket.id).emit('returnConstantsAndroid', { initialTime: game.initialTime, penalty: game.penaltyTime, timeWon: game.timeWon, cheatMode: game.cheatMode, maxTime: game.maxTime });
                }
            


                this.io.to(socket.id).emit('returnConstantsAndroid', {  });
            
            
              });



            /// FIN Android ///







            socket.on('joinGameCoop', async (data: any) => {

                if (data.username) {
                    const gameId = this.getSocketRoom(socket);


                    if (gameId) {

                        socket.leave(gameId);
                    }
                    const player = new Player(socket.id, data.username); // init new player
                    const gameRes = await this.gamesManager.joinGameCoop(player) as { id: string, status: Status };   // join or create game

                    socket.join(gameRes.id);    // player join room

                    if (gameRes.status === Status.ACTIVE) {
                        const players = this.gamesManager.getCoopById(gameRes.id)?.getPlayers() as Player[];
                        const length = await this.fileService.getGameCardsLength();

                        const cardOrder = this.orderGenerator.generateOrder(length);

                        this.io.to(gameRes.id).emit('startGameCoop', { username1: players[0].name, username2: players[1].name, order: cardOrder, id: gameRes.id }); // start game
                    }
                }
            });

            socket.on('startGameSolo', async (data: any) => {

                const length = await this.fileService.getGameCardsLength();

                const cardOrder = this.orderGenerator.generateOrder(length);

                this.io.to(socket.id).emit('orderSent', { order: cardOrder });

            });

            socket.on('rejectPlayer', () => { // TODO : update for game multi
                const gameId = this.getSocketRoom(socket);


                const game = this.gamesManager.get1v1ById(gameId);

                const message = 'Vous avez été refusé';

                socket.to(gameId).emit('abortGame', { cardId: game?.gameCard?.id, message });    // inform the rejected player

                this.updateButtonStatus(gameId);    // update all buttons creer/joindre
            });

            socket.on('startGame', (data: any) => {

                const gameId = this.getSocketRoom(socket);
                const game = this.gamesManager.get1v1ById(gameId);

                this.gamesManager.startGame(gameId);
                socket.to(gameId).emit('startGame');

                socket.to(gameId).emit('startGame',
                    { cardId: game?.gameCard?.id, gameName: data.gameName, username: game?.getPlayers()[0].name });    // inform the other player to start

                if (game) {

                    this.io.to(game.getPlayer(0).id).emit("leader"); //inform game leader
                }

                this.updateButtonStatus(gameId);    // update all buttons creer/joindre
            });


            socket.on('leaveGame', () => { // TODO adapt for multi

                const gameId = this.getSocketRoom(socket);


                if (gameId) {

                    socket.leave(gameId);
                    const game = this.gamesManager.get1v1ById(gameId);
                    const gameCard = game?.gameCard;
                    const isCreator = this.gamesManager.isCreator(gameId, socket.id);

                    const coopGame = this.gamesManager.getCoopById(gameId);

                    if (isCreator && !coopGame) {
                        const message = 'L\'hôte a quitté la partie';
                        socket.to(gameId).emit('abortGame', { cardId: gameCard?.id, message }); // notify player that creator left
                    } else {
                        socket.to(gameId).emit('playerLeft', { id: gameId }); // notify creator that player left

                    }

                    this.gamesManager.leaveGame(gameId, socket.id);


                    this.updateButtonStatus(gameId);    // update all buttons creer/joindre
                }
            });

            socket.on('gameEnded', async (data: any) => {
                console.log('gameEnded', data);
                const gameId = this.getSocketRoom(socket);
                this.databaseService.deleteChannel(gameId); //delete channel if ended
                // change in the client. merge problem broke it
                if (data.gameStats.players) {
                    for (const player of data.gameStats.players) {
                        const isWinner = player.username === data.gameStats.winner.username;
                        await this.userService.updateUserStats(
                            player.username,
                            isWinner,
                            player.score,
                            data.gameStats.gameTime
                        );
                    }
                }
                if (gameId) {
                    if (data.quit) { // TODO adapt for multi
                        const player = this.liveGamesService.getPlayers(gameId)?.find((p: Player) => p.id === socket.id);
                        const message = `${player?.name} a abandonné la partie.`;
                        socket.to(gameId).emit("newMessage", new Message(message));
                        socket.to(gameId).emit('otherPlayerQuit');
                        socket.leave(gameId);
                    }else{
                        this.io.to(gameId).emit('finishGame', {winner:data});
                        socket.leave(gameId);
                    }
                   
                    this.gamesManager.leaveGame(gameId, socket.id);
                    this.gamesManager.endGame(gameId);
                }
            });
            socket.on('getLobbies', (data: any) => {

                this.updateLobbies();

            });
            socket.on('getLobbiesLimite', (data: any) => {

                this.updateLobbiesLimite();

            });

            socket.on('gameCardsModified', () => {
                this.io.emit('gameCardsModified');
            });

            socket.on('gameCardDeleted', (data: any) => {
                if (data.cardId) {
                    const message = 'La fiche de jeu a été supprimée';
                    const games = this.gamesManager.getGamesByGameCardId(data.cardId);
                    games?.forEach((game: Game) => {
                        if (game.status === Status.WAITING_PLAYER || game.status === Status.FULL)
                            this.io.to(game.gameId).emit('abortGame', { cardId: data.cardId, message });
                    });
                    this.io.emit('gameCardsModified');
                }
            });

            socket.on('gameCardsDeleted', () => {
                const games = this.gamesManager.getAllGames();
                const message = 'Les fiches de jeu ont été supprimées';
                games.forEach((game: Game) => {
                    if (game.status === Status.WAITING_PLAYER || game.status === Status.FULL)
                        this.io.to(game.gameId).emit('abortGame', { cardId: (game.gameCard as GameCardTemplate).id, message });
                });
                this.io.emit('gameCardsModified');
            });

            socket.on('bestTimesUpdate', (data: any) => {
                this.io.emit('gameCardsModified');
            });

            socket.on('localMessage', (data) => {
                const message = data as Message;
                const gameId = this.getSocketRoom(socket);
                if (message) {
                    this.io.to(gameId).emit('newMessage', message);
                }
            });

        });
    }

    private sendUserChatList(socket: io.Socket, username: string) {
        this.databaseService.getMyChatList(username).then((chatList) => {
            socket.emit('updatedMyChannels', chatList);
            console.log('myChannels from server', chatList);
        }).catch(error => {
            console.error('Error fetching user chat list', error);
            socket.emit('updatedMyChannels', []);
        });
    }


    private sendUpdatedChatList(socket: io.Socket) {
        this.databaseService.getChatList().then((chatList) => {
            console.log('chatList from server', chatList);

            socket.emit('updatedChatList', chatList);
        });
    }
      //update my channels list
    //   private sendUserChatList(socket: io.Socket, username: string) {
    //     this.databaseService.getMyChatList(username).then((chatList) => {
    //         socket.emit('updatedMyChannels', chatList);
    //         console.log('myChannels from server', chatList);
    //     }).catch(error => {
    //         console.error('Error fetching user chat list', error);
    //         socket.emit('updatedMyChannels', []);
    //     });
    // }


    updateButtonStatus(gameId: string): boolean {
        console.log('updateButtonStatus', gameId);
        const cardId = this.gamesManager.getGameById(gameId)?.gameCard?.id;
        const isWaiting = cardId !== undefined && this.gamesManager.isWaitingGameCard(cardId);
        const isFull = cardId !== undefined && this.gamesManager.isFullGameCard(cardId);
        this.io.emit('gameCardStatus', { cardId, isWaiting, isFull });
        console.log('update status', isWaiting, isFull);
        return isWaiting;
    }

    updateButtonStatusMulti(gameId: string): boolean {
        console.log('updateButtonStatus', gameId);
        const cardId = this.gamesManager.getMultiById(gameId)?.gameCard?.id;
        if (cardId === undefined) {
            console.log('cardId undefined');
            return false;
        } else {
            const waiting = this.gamesManager.getWaitingMulti(cardId);
            const isWaiting = cardId !== undefined && waiting !== undefined;
            const isFull = cardId !== undefined && this.gamesManager.isFullGameMulti(cardId);
            this.io.emit('gameCardStatus', { cardId, isWaiting, isFull });
            console.log('update status', isWaiting, isFull);
            return isWaiting;
        }

    }
    updateLobbies(): void {
        this.gamesManager.clearEndedGames();
        this.io.emit('updateLobbies', this.gamesManager.getAllGamesMulti());
        console.log('updateLobbies');
        console.log(this.gamesManager.getAllGamesMulti());


        //TODO : update lobbies in the client, send data
    }
    updateLobbiesLimite(): void {
        this.gamesManager.clearEndedGames();
        this.io.emit('updateLobbiesLimite', this.gamesManager.getAllGamesLimites());
        console.log('updateLobbiesLimite');
        console.log(this.gamesManager.getAllGamesLimites());
    }


    getSocketRoom(socket: io.Socket): string { // TODO : update pour plusieurs rooms 
        const rooms = socket.rooms.values();

        for (const room of rooms)
            if (room !== socket.id)
                return room;
        return '';
    }

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }
}
