import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  socketId: string = '';
  constructor(private socketSerice: SocketService) {
    this.socketSerice.listen('connected').subscribe((data: any) => {
      console.log('socketId', data);
      this.socketId = data.message;
    })
  }

  ngOnInit(): void {
  }
}
