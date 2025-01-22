import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlVideoToolComponent } from './control-video-tool.component';

describe('ControlVideoToolComponent', () => {
  let component: ControlVideoToolComponent;
  let fixture: ComponentFixture<ControlVideoToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlVideoToolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlVideoToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
