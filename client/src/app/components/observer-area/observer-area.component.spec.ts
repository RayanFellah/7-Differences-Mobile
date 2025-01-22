import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObserverAreaComponent } from './observer-area.component';

describe('ObserverAreaComponent', () => {
  let component: ObserverAreaComponent;
  let fixture: ComponentFixture<ObserverAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObserverAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObserverAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
