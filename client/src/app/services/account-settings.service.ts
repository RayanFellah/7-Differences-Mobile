import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUser } from '@common/user';
import { AuthentificationService } from './authentification.service';
// import { AuthentificationService } from './authentification.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AccountSettingsService {
  currentUser: IUser | null;
  boughtMedals: any;
  boughtAvatars: any;
  private readonly baseUrl: string = environment.serverUrlAndPort + '/api/fs/players';

  constructor(private readonly http: HttpClient, public readonly authService: AuthentificationService) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  updateProfile(username: string, avatar: string) {
    const updatedData = {
      newUsername: username,
      newAvatar: avatar,
    }
    console.log('updatedData', updatedData);
    // const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.put(`${this.baseUrl}/${username}/username`, updatedData);
  }

  updateUsername(newUsername: string) {
    return this.http.put(`${this.baseUrl}/${this.currentUser!.username}/username`, { username: newUsername });
  }

  uploadAvatarAndUsername(username: string, file: File) {
    const formData = new FormData();
    formData.append('newUsername', username);
    formData.append('avatar', file, file.name);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.put(`${this.baseUrl}/${username}/profile`, formData, { headers });
  }

  getUserConnectionHistory(username: string) {
    console.log('getUserConnectionHistory', username);
    return this.http.get(`${this.baseUrl}/${username}/connection-history`);
  }

  updateAvatar(username: string, avatarFileName: string) {
    const body = { avatar: avatarFileName };
    return this.http.put(`${this.baseUrl}/${username}/avatar`, body, { responseType: 'text' });
  }

  getBoughtMedals(username: string) {
    return this.http.get(`${this.baseUrl}/${username}/bought-medals`);
  }

  getBoughtAvatars(username: string) {
    return this.http.get(`${this.baseUrl}/${username}/bought-avatars`);
  }

  getUserStats(username: string) {
    return this.http.get(`${this.baseUrl}/${username}/stats`);
  }

  getUserGameHistory(username: string) {
    return this.http.get(`${this.baseUrl}/${username}/game-history`);
  }

  getUserReplayHistory() {
    return this.http.get(`${this.baseUrl}/${this.currentUser?.id}/replay`);
  }

  deleteReplay(dateHeure: string) {
    return this.http.delete(`${this.baseUrl}/${this.currentUser?.id}/replay/${dateHeure}`);
  }
}
