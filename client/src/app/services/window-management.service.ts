import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowManagementService {
  private _isChatDetached = false;

  constructor() {}

  detachChat(): void {
    const electronWindow = window as any as {
      electronAPI: {
        send: (channel: string, data?: any) => void;
      }
    };
    console.log('Detaching chat',electronWindow.electronAPI);
  
    if ((window as any).electronAPI) {
      console.log('Electron IPC available via bridge');
      (window as any).electronAPI.send('open-channel-widget');
    } else {
      console.log('Electron IPC not available');
    }
  }
  public get isChatDetached(): boolean {
    return this._isChatDetached;
  }
}