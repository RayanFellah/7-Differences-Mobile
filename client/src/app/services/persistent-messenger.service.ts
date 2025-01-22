import { Injectable } from '@angular/core';
import { Message } from '@common/message';
@Injectable({
  providedIn: 'root'
})
export class PersistentMessengerService {
  private messages: Message[] = [];

  getMessages(): Message[] {
    const storedMessages = localStorage.getItem('chatMessages');
    console.log('Stored Messages:', storedMessages);
    if (storedMessages) {
      this.messages = JSON.parse(storedMessages);

    }
    return this.messages;
  }
  addMessage(message: Message) {
    console.log('persistance add');
    this.messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    console.log('Messages after adding:', this.messages);


  }

  clearMessages() {
    this.messages = [];
  }
}
