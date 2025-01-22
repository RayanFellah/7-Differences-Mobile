export interface GameStats {
    players?: {username: string, score: number}[];
    
    winner?: {username: string, score: number};
    // looser?: string;
    // winnerDifferencesFound?: number;
    // looserDifferencesFound?: number;
    gameTime: number;
}