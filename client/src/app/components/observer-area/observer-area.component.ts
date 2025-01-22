import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ReplayService } from '@app/services/replay.service';
import { SocketService } from '@app/services/socket.service';

@Component({
  selector: 'app-observer-area',
  templateUrl: './observer-area.component.html',
  styleUrls: ['./observer-area.component.scss']
})
export class ObserverAreaComponent implements OnInit {
  
  @Input() isObserver: boolean = false;

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private startX = 0;
  private startY = 0;
  private endX = 0;
  private endY = 0;
  @Input() observe1: boolean = true;
  @Input() observe2: boolean = false;
  @Input() observe3: boolean = false;
  @Input() observe4: boolean = false;

  @Input() playerNumber: string = "";
  @Input() observerColor: string = "red"; 
  cooldown:boolean = false;
  constructor(private socketService:SocketService, private router: Router, private replayService: ReplayService) { }


  ngOnInit(): void {
    if(!this.isObserver){
      this.socketService.listen('rectangleTransfer').subscribe((data:any)=>{
        if(data){
          if(this.router.url !='/replay'){
            this.replayService.addObserverEventReplay(data.region, data.color);
          }
          
          this.drawReceivedRectangle(data.region, data.color);
        }
        
      });
    
    }

  
  }
  drawReceivedRectangle=(rectangle:any , color: string)=> {
    console.log('drawReceivedRectangle', rectangle, color);
    // Assuming you have a method to setup or reset your canvas context
    if (rectangle.endX && rectangle.endY) {
      const width = rectangle.endX - rectangle.startX;
      const height = rectangle.endX - rectangle.startY;
      console.log('width', width, 'height', height);
      this.ctx?.rect(rectangle.startX, rectangle.startY,  width, height);
    } else {
      this.ctx?.rect(rectangle.startX, rectangle.startY, rectangle.startX , rectangle.height);
    }

    if(this.ctx){
    this.ctx.beginPath();
    this.ctx.rect(rectangle.startX, rectangle.startY, rectangle.width, rectangle.height);
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    // Clear the rectangle after 3 seconds, similar to how you handle the self-drawn rectangle
    setTimeout(() => {
      if (this.ctx){
        this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      }
    }, 3000);
  }
}

  ngAfterViewInit(): void {
    
    this.ctx = this.canvas.nativeElement.getContext('2d');
  }
  startDrawing(event: MouseEvent): void {
    if (this.cooldown) return;

    this.drawing = true;
    this.startX = event.offsetX;
    this.startY = event.offsetY;
  }
  draw(event: MouseEvent): void {
    if (!this.drawing) return;
    // Clear any existing drawing
    if (this.ctx){
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    const currentX = event.offsetX;
    const currentY = event.offsetY;
    const width = currentX - this.startX;
    const height = currentY - this.startY;
    this.endX = currentX;
    this.endY = currentY;
    this.ctx.beginPath();
    this.ctx.rect(this.startX, this.startY, width, height);
    this.ctx.strokeStyle = this.observerColor; // Set the stroke color
    this.ctx.stroke();

    }
    
  }
  stopDrawing(): void {
    if (!this.drawing) return;
    this.drawing = false;
    
    

    // Calculate rectangle properties
    const rectangle = {
      startX: this.startX,
      startY: this.startY,
      width: this.endX - this.startX, // Assuming you have endX and endY defined when drawing stops
      height: this.endY - this.startY,
      // Include any additional properties like color, strokeWidth, etc.
    };
    //send
    //console.log(rectangle);
   // this.socketService.emit('observerRectangleTransfer',{region:rectangle,broadcast:true,playerNumber:0})
   console.log('observe to number' + this.playerNumber);

    console.log('observe to:', this.observe1, this.observe2, this.observe3, this.observe4);
    if(this.playerNumber == "1" ){
      this.socketService.emit('observerRectangleTransfer',{region:rectangle,broadcast:false,playerNumber:0, color: this.observerColor})
    }
    if(this.playerNumber == "2" ){
      this.socketService.emit('observerRectangleTransfer',{region:rectangle,broadcast:false,playerNumber:1, color: this.observerColor})
    }
    if(this.playerNumber == "3" ){
      this.socketService.emit('observerRectangleTransfer',{region:rectangle,broadcast:false,playerNumber:2, color: this.observerColor})
    }
    if(this.playerNumber == "4" ){
      this.socketService.emit('observerRectangleTransfer',{region:rectangle,broadcast:false,playerNumber:3, color: this.observerColor})
    }
    if(this.playerNumber == "5" ){
      this.socketService.emit('observerRectangleTransfer',{region:rectangle,broadcast:true,playerNumber:0, color: this.observerColor})
    }





    // Set a timeout to clear the rectangle after 3 seconds
    this.cooldown = true;
    setTimeout(() => {
      this.cooldown = false;
    }, 3000);

    
    setTimeout(() => {
      if (this.ctx){
        this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      }
     
    }, 3000);
      
  

   }


}
