import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ToolbarSelectService } from '@app/services/toolbar-select.service';

@Component({
  selector: 'app-toolbar-colors',
  templateUrl: './toolbar-colors.component.html',
  styleUrls: ['./toolbar-colors.component.scss'],
})
export class ToolbarColorsComponent implements OnInit {

  constructor(readonly toolbarService: ToolbarSelectService) {}

  ngOnInit(): void {
  }

  @ViewChild('colorPicker') colorPicker: ElementRef<HTMLInputElement>;
  @Input() color: string;

  setColor(): void {
    this.color ? this.toolbarService.colorSelected.next(this.color) : this.toolbarService.colorSelected.next(this.colorPicker.nativeElement.value);
  }
}
