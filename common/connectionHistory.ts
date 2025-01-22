interface IUserConnectionHistory {
    date: Date;
    action: Action;
    ip?: string;
}

export type Action = 'Connexion' | 'Déconnexion';
export type UserConnectionHistory = IUserConnectionHistory;

