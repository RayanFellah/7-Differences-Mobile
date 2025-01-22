import { Message } from './message';
interface IChat {
    name: string;
    history: Message[];
    creatorName: string;
    playersInChat: string[];

}

export type Chat = IChat;