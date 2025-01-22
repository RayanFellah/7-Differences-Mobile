import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '@common/items';
import { IUser } from '@common/user';
import { AuthentificationService } from './authentification.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  baseUrl = environment.serverUrlAndPort;
  private medals: Item[] = [
    {
      path: 'assets/medals/gold.png',
      name: 'Statut Or',
      type: 'Medal',
      price: 100,
      // description: 'Rejoignez l\'élite avec le statut Or et faites briller votre profil au sommet du podium !'
    },
    {
      path: 'assets/medals/silver.png',
      name: 'Statut Argent',
      type: 'Medal',
      price: 50,
      // description: 'Aspirez à l\'excellence et faites-vous remarquer avec l\'éclat prestigieux du statut Argent.'
    },
    {
      path: 'assets/medals/bronze.png',
      name: 'Status Bronze',
      type: 'Medal',
      price: 25,
      // description: 'Forgez votre chemin vers la gloire et capturez l\'éclat robuste du statut Bronze pour commencer votre légende'
    }
  ]

  private sounds: Item[] = [
    {
      path: 'assets/special-audios/fail-sound.mp3',
      name: 'Son d\'échec',
      type: 'Sound',
      price: 50,
      description: 'Sound 1'
    },
    {
      path: 'assets/special-audios/success-sound.mp3',
      name: 'Son de succès',
      type: 'Sound',
      price: 50,
    }
  ];
  currentUser: IUser | null;
  boughtItems: Item[] = [];
  constructor(private http: HttpClient, private authService: AuthentificationService) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getMedals(): Item[] {
    return this.medals;
  }

  getSounds(): Item[] {
    return this.sounds;
  }

  // A refecatoriser pour ne pas se repeter
  buyMedal(medal: Item) {
    const body = { item: medal }
    console.log('buying medal', body);
    return this.http.post(`${this.baseUrl}/api/fs/players/${this.currentUser?.username}/shop`, body, {
      observe: 'response',
      responseType: 'json'
    });
  }

  buyAvatar(avatar: Item) {
    const body = { item: avatar }
    console.log('buying avatar', body);
    return this.http.post(`${this.baseUrl}/api/fs/players/${this.currentUser?.username}/shop`, body, {
      observe: 'response',
      responseType: 'json'
    });
  }

  buySound(sound: Item) {
    const body = { item: sound }
    console.log('buying sound', body);
    return this.http.post(`${this.baseUrl}/api/fs/players/${this.currentUser?.username}/shop`, body, {
      observe: 'response',
      responseType: 'json'
    });
  }

  getBoughtItems(username: string) {
    return this.http.get(`${this.baseUrl}/api/fs/players/${username}/bought-items`, {
      observe: 'response',
      responseType: 'json'
    });
  }

  itemIsOwned(boughtItems: Item[], itemName: string): boolean {
    return boughtItems.some(i => i.name === itemName);
  }

  updateHasGameMultiplier(gameMultiplier: Item) {
    const body = { item: gameMultiplier }
    return this.http.post(`${this.baseUrl}/api/fs/players/${this.currentUser?.username}/shop`, body, {
      observe: 'response',
      responseType: 'json'
    });
  }

  buySpinWheelTurn(hasWonGameMultiplier: boolean) {
    const body = { spinResult: hasWonGameMultiplier }
    return this.http.put(`${this.baseUrl}/api/fs/players/${this.currentUser?.username}/spin-wheel`, body, {
      observe: 'response',
      responseType: 'json'
    });
  }

  updateDinars(dinarsDifference: number) {
    const body = { dinars: dinarsDifference }
    return this.http.put(`${this.baseUrl}/api/fs/players/${this.currentUser?.username}/dinars`, body, {
      observe: 'response',
      responseType: 'json'
    });
  }
}
