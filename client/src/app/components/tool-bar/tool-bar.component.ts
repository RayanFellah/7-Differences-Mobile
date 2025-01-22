import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LanguageService } from '@app/services/language.service';
import { ToolbarSelectService } from '@app/services/toolbar-select.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent implements OnInit {

  @Output() colorSelected = new EventEmitter<string>();
  constructor(
    readonly toolbarSelectService: ToolbarSelectService,
    protected languageService: LanguageService,
  ) {}

  protected tool: number;

  ngOnInit(): void {

  }

  setTool(tool: number): void {
    this.tool=tool;
  }

  penWidthChanged(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.toolbarSelectService.pencilWidthSelected.next(inputElement.valueAsNumber);
  }

  eraserWidthChanged(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.toolbarSelectService.eraserWidthSelected.next(inputElement.valueAsNumber);
  }

  radiusChanged(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.toolbarSelectService.radiusSelected.next(inputElement.valueAsNumber);
  }

  densityChanged(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.toolbarSelectService.densitySelected.next(inputElement.valueAsNumber);
  }

}
