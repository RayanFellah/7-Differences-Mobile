import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassicGameConstantsComponent } from './classic-game-constants.component';

describe('ClassicGameConstantsComponent', () => {
  let component: ClassicGameConstantsComponent;
  let fixture: ComponentFixture<ClassicGameConstantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassicGameConstantsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassicGameConstantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
