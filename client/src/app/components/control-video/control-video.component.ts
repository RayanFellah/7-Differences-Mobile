import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { videoTool } from '../control-video-tool/control-video-tool.component';

@Component({
  selector: 'app-control-video',
  templateUrl: './control-video.component.html',
  styleUrls: ['./control-video.component.scss']
})
export class ControlVideoComponent implements OnInit {

  constructor(/*private clickHistoryService: ClickHistoryService*/) {}
  @Output() videoToolEmitter = new EventEmitter<videoTool>();
  currentControl: videoTool = videoTool.play;

  ngOnInit(): void {}

  emitPlay() {
    if (this.currentControl !== videoTool.play) {
      this.videoToolEmitter.emit(videoTool.play);
      //clearInterval(this.clickHistoryService.interval);
      //this.clickHistoryService.startTimer();
      this.currentControl = videoTool.play;
    }
  }

  emitPause() {
    if (this.currentControl !== videoTool.pause) {
      this.videoToolEmitter.emit(videoTool.pause);
     // clearInterval(this.clickHistoryService.interval);
      this.currentControl = videoTool.pause;
    }
  }

  emitRestart() {
    //this.clickHistoryService.stopTimer();
    this.videoToolEmitter.emit(videoTool.restart);
    //this.clickHistoryService.startTimer();
    this.currentControl = videoTool.restart;

  }

  emitForwardTwo() {
    if (this.currentControl !== videoTool.forwardTwo) {
      this.videoToolEmitter.emit(videoTool.forwardTwo);
     // clearInterval(this.clickHistoryService.interval);
      //this.clickHistoryService.startTimer(50);
      this.currentControl = videoTool.forwardTwo;
    }
  }

  emitForwardFour() {
    if (this.currentControl !== videoTool.forwardFour) {
      this.videoToolEmitter.emit(videoTool.forwardFour);
      //clearInterval(this.clickHistoryService.interval);
      //this.clickHistoryService.startTimer(25);
      this.currentControl = videoTool.forwardFour;
    }
  }


}
