import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { GameInfoService } from '@app/services/game-info.service';
import { SocketService } from '@app/services/socket.service';
import { Observable } from 'rxjs/internal/Observable';

import { WaitingPageComponent } from './waiting-page.component';

export class RouterStub {
  routerState = { root: '' };
  navigate() {
    return;
  }
}

describe('WaitingPageComponent', () => {
  let component: WaitingPageComponent;
  let fixture: ComponentFixture<WaitingPageComponent>;
  let socketService: SocketService;
  const message: string = 'message';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaitingPageComponent],
      imports: [MatDialogModule, RouterTestingModule],
      providers: [GameInfoService, SocketService, { provide: Router, useClass: RouterStub }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WaitingPageComponent);
    component = fixture.componentInstance;
    socketService = TestBed.inject(SocketService);
    socketService.listen = jasmine.createSpy('listen').and.returnValue(
      new Observable((observer) => {
        observer.next({ diffArray: [{ points: [0, 4, 8] }], winner: 'test', other: true, message: message });
      }),
    );
    socketService.emit = jasmine.createSpy('emit');
    jasmine.createSpyObj('router', ['navigate']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should config sockets", () => {
    const spy = spyOn(component, "configSockets");
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it("should start game", () => {
    const spy = spyOn(component, "startGame");
    component.startGame();
    expect(spy).toHaveBeenCalled();
  });

  it("should reject player", () => {
    const spy = spyOn(component, "rejectPlayer");
    component.rejectPlayer();
    expect(spy).toHaveBeenCalled();
  });

  it("should set name", () => {
    const event = new Event('click');
    const spy = spyOn(component, "setName");
    component.setName(event);
    expect(spy).toHaveBeenCalled();
  });


  it("should open dialog", () => {
    const message = "message";
    const spy = spyOn(PopupTextComponent, "openDialog");
    component.openDialogNotify(message);
    expect(spy).toHaveBeenCalled();
  });

  it("should open dialog2", () => {
    const message = "message";
    const spy = spyOn(component, "openDialogNotify");
    component.openDialogNotify(message);
    expect(spy).toHaveBeenCalled();
  });

  it("should subscribe to socketService.listen('End')", () => {
    expect(socketService.listen).toHaveBeenCalledWith('newPlayer');
  });

  it("should subscribe to socketService.listen('abortGame')", () => {
    expect(socketService.listen).toHaveBeenCalledWith('abortGame');
  });

  it("should call socketService.emit('leaveGame', null) when (data.message) is true", () => {
    spyOn(component, "openDialogNotify").and.callFake(() => {});
    expect(socketService.emit).toHaveBeenCalledWith('leaveGame', null);
  });

  it("should call sthis.router.navigate(['/selecto']); when (data.message) is true", () => {
    spyOn(component, "openDialogNotify");
    spyOn(component['router'], 'navigate');
    expect(component['router'].navigate).toHaveBeenCalledWith(['/selecto']);
  });

  it('should call socketService.emit("startGame", { gameName: this.game }) when (this.gameName && this.player2Name && this.player1Name) is true', () => {
    component.gameName = 'test';
    component.player2Name = 'test';
    component.player1Name = 'test';
    component.startGame();
    expect(socketService.emit).toHaveBeenCalledWith('startGame', { gameName: component.gameName });
  });

  it('should call socketService.emit("rejectPlayer", null) when rejectPlayer() is called', () => {
    component.rejectPlayer();
    expect(socketService.emit).toHaveBeenCalledWith('rejectPlayer', null);
  });

  it("should call socketService.emit('leaveGame', null) when ngOnDestroy is called", () => {
    component.gameClosed = false;
    component.ngOnDestroy();
    expect(socketService.emit).toHaveBeenCalledWith('leaveGame', null);
  });

});
