import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetStateService {


  private _isDraggable = new BehaviorSubject<boolean>(false);
  private _isVisible = new BehaviorSubject<boolean>(false);

  isDraggable$ = this._isDraggable.asObservable();
  isVisible$ = this._isVisible.asObservable();

  constructor() { }

  setDraggable(isDraggable: boolean) {
    this._isDraggable.next(isDraggable);
  }

  setVisible(isVisible: boolean) {
    this._isVisible.next(isVisible);
  }

  // need to change so we hide the widget when its not in mainpage 
  resetWidget() {
    this._isVisible.next(false); 
    setTimeout(() => {
      this._isVisible.next(true); 
    }, 10); 
  }
  
}
