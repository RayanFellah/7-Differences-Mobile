import { Component, Input } from '@angular/core';
export enum videoTool {
  play,
  pause,
  restart,
  forwardTwo,
  forwardFour,
}
@Component({
  selector: 'app-control-video-tool',
  templateUrl: './control-video-tool.component.html',
  styleUrls: ['./control-video-tool.component.scss']
})
export class ControlVideoToolComponent {

  constructor() {}
  @Input() tool: videoTool;



}
