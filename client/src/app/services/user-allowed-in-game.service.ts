import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, GameAccessType } from '@common/game';
import { AuthentificationService } from './authentification.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UserAllowedInGameService {
    private http: HttpClient;

    constructor(http: HttpClient, private auth: AuthentificationService) {
        this.http = http;
    }
    async isUserAllowedInGame(game: Game): Promise<boolean> {
        if (!this.auth.currentUser || !this.auth.currentUser.id) {
            return false;
        }
        // eslint-disable-next-line unicorn/prefer-switch
        if (game['gameAccessType'] === GameAccessType.ALL) {
            return true;
        } else {
            const gameCreatorUserName = game['players'][0]['name'];
            let res = await this.http
                .get<string[]>(`${environment.serverUrlAndPort}/friends/byUsername/${gameCreatorUserName}`)
                // eslint-disable-next-line deprecation/deprecation
                .toPromise();
            if (!res) {
                return false;
            }
            const creatorFriends = res.map((item: string) => item);

            if (game['gameAccessType'] === GameAccessType.FRIENDS_ONLY && !creatorFriends.includes(this.auth.currentUser.id)) {
                return false;
            }
            if (game['gameAccessType'] === GameAccessType.FRIENDS_AND_THEIR_FRIENDS_ONLY) {
                const allowedUsers = [...creatorFriends];
                for (const friend of creatorFriends) {
                    res = await this.http
                        .get<string[]>(`${environment.serverUrlAndPort}/friends/${friend}`)
                        // eslint-disable-next-line deprecation/deprecation
                        .toPromise();
                    if (res) {
                        const friendsOfFriend = res.map((item: string) => item);
                        allowedUsers.push(...friendsOfFriend);
                    }
                }
                if (!allowedUsers.includes(this.auth.currentUser.id)) {
                    return false;
                }
            }
        }
        return true;
    }
}
