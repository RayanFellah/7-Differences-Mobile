import { Component, Input, OnInit } from '@angular/core';
import { ToolbarSelectService } from '@app/services/toolbar-select.service';
export enum toolType {
  pen,
  eraser,
  rectangle,
  ellipse,
  aerosol,
  sceau,
};
@Component({
  selector: 'app-toolbar-tools',
  templateUrl: './toolbar-tools.component.html',
  styleUrls: ['./toolbar-tools.component.scss'],
})
export class ToolbarToolsComponent implements OnInit {

  constructor(readonly toolbarService: ToolbarSelectService) {}

  ngOnInit(): void {
  }
  @Input() tool: toolType;

  setTool(): void {
    this.toolbarService.toolSelected.next(this.tool);
  }
}
