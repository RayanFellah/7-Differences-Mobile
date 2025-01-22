import { Injectable } from '@angular/core';
import { Difference } from '@app/interfaces/difference';
import { GameCardTemplate } from '@common/game-card-template';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { CommunicationService } from './communication.service';
import { GameInfoService } from './game-info.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class CardQueueService {
  current: number;
  leftImageURL: BehaviorSubject<string>;
  rightImageURL: BehaviorSubject<string>;
  leftImage: BehaviorSubject<string>;
  rightImage: BehaviorSubject<string>;

  LeftImageURLTemp: string;
  RightImageURLTemp: string;
  LeftImageTemp: string;
  RightImageTemp: string;


  differences: BehaviorSubject<Difference[]>;
  differencesRemoved: BehaviorSubject<Difference[]>;
  gameEnded: BehaviorSubject<boolean>;
  cardOrder: number[];
  nGameCards: number;
  gameCards: GameCardTemplate[];

  constructor(private readonly communication: CommunicationService, private gameInfo: GameInfoService,private socketService: SocketService) {
    this.current = 0;
    this.leftImageURL = new BehaviorSubject<string>("");
    this.rightImageURL = new BehaviorSubject<string>("");
    this.leftImage = new BehaviorSubject<string>("");
    this.rightImage = new BehaviorSubject<string>("");
    this.differences = new BehaviorSubject<Difference[]>([]);
    this.gameEnded = new BehaviorSubject<boolean>(false);
    this.differencesRemoved=new BehaviorSubject<Difference[]>([]);
    this.cardOrder = this.gameInfo.cardOrder;
    this.nGameCards = this.gameInfo.nGameCards;
    this.gameCards = this.gameInfo.gameCards;
    this.socketService.listen('nextCardLimite').subscribe(async (data: any) => {
    console.log("nextCardLimite", data);
    this.differences.next(data.card.differences);
    this.differencesRemoved.next(data.remove);
    this.setupImage(data);
     
    });
    this.socketService.listen('imageUpdated').subscribe(async (data: any) => {
      console.log('imageUpdated');
      const leftImageURL= `url(${data.Img1})`;
      const rightImageURL= `url(${data.Img2})`;
      this.leftImage.next(data.Img1);
      this.rightImage.next(data.Img2);
      this.leftImageURL.next(leftImageURL);
      this.rightImageURL.next(rightImageURL);
    

    });
  }
  async setupImage(data:any){


    console.log("setupImage");
    const res1= await this.pullLeftUrl(data.card.img1ID);
    const res2= await this.pullRightUrl(data.card.img2ID);
    console.log("setupImage done");
    console.log(res1);
    console.log(res2);
    console.log(this.LeftImageTemp);
    console.log(this.RightImageTemp);
    console.log(this.differencesRemoved)
    console.log(this.differences)
    this.socketService.emit('removeDifferences',{Img1:this.LeftImageTemp, Img2:this.RightImageTemp, remove:this.differencesRemoved.value});


  }

  async pullLeftUrl(img1ID: string): Promise<void> {
    console.log("pullLeftUrl");
    const response1 = this.communication.downloadImage(img1ID);
  
    // Convert the Observable to a Promise and wait for it to resolve
    const res: any = await firstValueFrom(response1);
    if (res.body) {
      console.log("response1");
      console.log(res.body);
      this.LeftImageURLTemp = `url(data:image/bmp;base64,${res.body})`;
      this.LeftImageTemp = `data:image/bmp;base64,${res.body}`;

    }
  }

  async pullRightUrl(img2ID: string): Promise<void> {
    console.log("pullRightUrl");
    const response2 = this.communication.downloadImage(img2ID);
    // Convert the Observable to a Promise and wait for it to resolve
    const res: any = await firstValueFrom(response2);
    if (res.body) {
      console.log("response2");
      console.log(res.body);
      this.RightImageURLTemp = `url(data:image/bmp;base64,${res.body})`;
      this.RightImageTemp = `data:image/bmp;base64,${res.body}`;
    }
  }

  setImages(data:any): void {
    const leftImageURL= `url(${data.Img1})`;
    const rightImageURL= `url(${data.Img2})`;
    this.leftImage.next(data.Img1);
    this.rightImage.next(data.Img2);
    this.leftImageURL.next(leftImageURL);
    this.rightImageURL.next(rightImageURL);
    


  }
    
  

  async getNext(): Promise<void> {
    console.log("getNext");
    console.log(this.communication);
     
    this.socketService.socket.emit('getNextCardLimite',{});

    
    return;
  }

};
