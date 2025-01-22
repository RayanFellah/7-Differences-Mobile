
import { GameCardTemplate } from "@common/game-card-template";
import { GameMode, NewTime } from "@common/game-classes";
import { Message, SenderType } from "@common/message";
import { Service } from "typedi";
import { FileSystemService } from "./file-system.service";

@Service()
export class MessengerService {
    private io: any;
    constructor(private fileSystemService: FileSystemService) {}
    init(server: any) {
        this.io = server;
    }

    async sendGlobalMessage(newTime: NewTime, pos: number) {
        const position = pos === 2 ? '1ère' : pos === 1 ? '2ème' : '3ème';
        const nbPlayers = newTime.gameMode === GameMode.CLASSIQUE_SOLO || newTime.gameMode === GameMode.TEMPS_LIMITE_COOP ? '1 joueur' : '2 joueurs';
        const gameCard = (await this.fileSystemService.getGameCardById(newTime.gameCardId)) as GameCardTemplate;
        const message = `<strong>${newTime.player}</strong> obtient la <strong>${position}</strong> place dans les meilleurs temps du jeu <strong>${gameCard.name}</strong> en <strong>${nbPlayers}</strong>`;

        this.io.emit('newMessage', new Message(message, undefined,undefined, SenderType.EVENT));
    }

}