import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(private http: HttpClient) { }

  getAllUsers() {
    return this.http.get(`${environment.serverUrlAndPort}/friends/all`);
  }

  getFriends(id: string) {
    console.log('getting friends for', id);
    return this.http.get(`${environment.serverUrlAndPort}/friends/${id}`);
  }

  getPendingRequests(id: string) {
    return this.http.get(`${environment.serverUrlAndPort}/friends/pending/${id}`);
  }

  sendFriendRequest(id: string, receiverId: string) {
    return this.http.put(`${environment.serverUrlAndPort}/friends/request/${id}`, { receiverId: receiverId }, { responseType: 'text' });
  }

  revokeFriendRequest(id: string, receiverId: string) {
    return this.http.put(`${environment.serverUrlAndPort}/friends/revokeRequest/${id}`, { receiverId: receiverId }, { responseType: 'text' }); 
  }

  acceptFriendRequest(id: string, senderId: string) {
    return this.http.put(`${environment.serverUrlAndPort}/friends/accept/${id}`, { senderId: senderId },  { responseType: 'text' } );
  }

  deleteFriend(id: string, receiverId: string) {
    return this.http.put(`${environment.serverUrlAndPort}/friends/delete/${id}`, { receiverId: receiverId }, { responseType: 'text' });
  }

  rejectFriendRequest(id: string, senderId: string) {
    return this.http.put(`${environment.serverUrlAndPort}/friends/reject/${id}`, { senderId: senderId }, { responseType: 'text' });
  }

  // foundUserInList(users: any[], id: string) {
  //   return users.find((user) => user.id === id);
  // }

  // removeUserFromList(users: any[], id: string) {
  //   return users.filter((user) => user.id !== id);
  // }
  // addUserToList(users: any[], id: string) {
  //   return users.push(id);
  // }
}
