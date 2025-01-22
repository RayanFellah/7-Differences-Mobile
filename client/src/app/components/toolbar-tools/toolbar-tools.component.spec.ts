import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarToolsComponent, toolType } from './toolbar-tools.component';

describe('ToolbarToolsComponent', () => {
  let component: ToolbarToolsComponent;
  let fixture: ComponentFixture<ToolbarToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolbarToolsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the toolSelected value when input value is valid', () => {
    const spy = spyOn(component.toolbarService.toolSelected, 'next');
    component.tool = toolType.rectangle;
    component.setTool();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(toolType.rectangle);
  });

  it('should set the toolSelected value to the next valid input', () => {
    const spy = spyOn(component.toolbarService.toolSelected, 'next');
    component.tool = toolType.eraser;
    component.setTool();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(toolType.eraser);
  });

  it('setTool should call next on toolSelected', () => {
    const spy = spyOn(component.toolbarService.toolSelected, 'next');
    component.setTool();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

});
