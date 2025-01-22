import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarColorsComponent } from './toolbar-colors.component';

describe('ToolbarColorsComponent', () => {
  let component: ToolbarColorsComponent;
  let fixture: ComponentFixture<ToolbarColorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolbarColorsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the colorSelected value when input value is valid', () => {
    const spy = spyOn(component.toolbarService.colorSelected, 'next');
    component.color = 'red';
    component.setColor();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('red');
  });

  it('should set the colorSelected value to the next valid input', () => {
    const spy = spyOn(component.toolbarService.colorSelected, 'next');
    component.color = 'purple';
    component.setColor();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('purple');
  });

  it('should use the colorPicker value when color is not set', () => {
    const spy = spyOn(component.toolbarService.colorSelected, 'next');
    component.colorPicker = { nativeElement: { value: 'blue' } } as any;
    component.setColor();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('blue');
  });

  it('setColor should call next on colorSelected', () => {
    const spy = spyOn(component.toolbarService.colorSelected, 'next');
    component.setColor();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
