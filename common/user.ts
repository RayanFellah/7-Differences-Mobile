import { EventDescription } from '@common/event';
import { channelMuteInfo } from './channelMuteInfo';
import { UserConnectionHistory } from './connectionHistory';
import { GameHistory } from './gameHistory';
import { Item } from './items';
import { Statistics } from './userStats';
export interface IUser {
    id?: string;
    username: string;
    password?: string;
    email?: string;
    avatar: string;
    channelsAndMuted?: channelMuteInfo[];  // passage de string a object {chatName,Mutedplayers[]} + changer tous les chatNameList
    connectionHistory?: UserConnectionHistory[];
    gameHistory?: GameHistory;
    isLanguageFrench?: boolean;
    isThemeDark?: boolean;
    gameStatistics?: Statistics
    dinars?: number;
    boughtItems?: Item[];
    friends?: String[];
    submittedRequests?: String[];
    receivedRequests?: String[];
    replays?: EventDescription[];
}

export interface Friend {
    id: string;
    username: string;
    avatar: string;
}

// export type User = IUser;