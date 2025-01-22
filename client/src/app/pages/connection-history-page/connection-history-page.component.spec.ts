import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionHistoryPageComponent } from './connection-history-page.component';

describe('ConnectionHistoryPageComponent', () => {
  let component: ConnectionHistoryPageComponent;
  let fixture: ComponentFixture<ConnectionHistoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionHistoryPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionHistoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
