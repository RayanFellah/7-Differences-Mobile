import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolBarComponent } from './tool-bar.component';

import { By } from '@angular/platform-browser';
import { ToolbarColorsComponent } from '../toolbar-colors/toolbar-colors.component';
import { ToolbarToolsComponent } from '../toolbar-tools/toolbar-tools.component';

describe('ToolBarComponent', () => {
  let component: ToolBarComponent;
  let fixture: ComponentFixture<ToolBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolBarComponent, ToolbarToolsComponent, ToolbarColorsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the pencilWidthSelected pen value when input value is valid', () => {
    const inputElement = fixture.debugElement.query(By.css('.penSlider input'));
    const spy = spyOn(component.toolbarSelectService.pencilWidthSelected, 'next');
    inputElement.nativeElement.value = '19'; // 19 because starts at 1 and steps of 3
    inputElement.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(19);
  });

  it('should set the widthSelected pen value to the next valid input', () => {
    const inputElement = fixture.debugElement.query(By.css('.penSlider input'));
    const spy = spyOn(component.toolbarSelectService.pencilWidthSelected, 'next');
    inputElement.nativeElement.value = '18';
    inputElement.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(19);
  });

  it('should set the widthSelected eraser value when input value is valid', () => {
    const inputElement = fixture.debugElement.query(By.css('.eraserSlider input'));
    const spy = spyOn(component.toolbarSelectService.eraserWidthSelected, 'next');
    inputElement.nativeElement.value = '19';
    inputElement.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(20);
  });

  it('should set the widthSelected eraser value to the next valid input', () => {
    const inputElement = fixture.debugElement.query(By.css('.eraserSlider input'));
    const spy = spyOn(component.toolbarSelectService.eraserWidthSelected, 'next');
    inputElement.nativeElement.value = '18';
    inputElement.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(17);
  });

});
