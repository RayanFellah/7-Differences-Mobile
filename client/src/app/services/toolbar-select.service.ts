import { Injectable } from '@angular/core';
import { toolType } from '@app/components/toolbar-tools/toolbar-tools.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolbarSelectService {

  constructor() {}
  toolSelected: Subject<toolType> = new Subject<toolType>();
  colorSelected: Subject<string> = new Subject<string>();
  pencilWidthSelected: Subject<number> = new Subject<number>();
  eraserWidthSelected: Subject<number> = new Subject<number>();
  radiusSelected: Subject<number> = new Subject<number>();
  densitySelected: Subject<number> = new Subject<number>();
}
