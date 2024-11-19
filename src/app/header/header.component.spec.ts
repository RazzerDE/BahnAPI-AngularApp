import { ComponentFixture, TestBed } from '@angular/core/testing';

import {HeaderComponent} from "./header.component";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve theme from local storage', () => {
    localStorage.setItem('dark', 'true');
    expect(component['getThemeFromLocalStorage']()).toBe(true);

    localStorage.removeItem('dark');
    expect(component['getThemeFromLocalStorage']()).toBe(false);
  });

  it('should toggle theme', () => {
    jest.spyOn(component as any, 'applyTheme');

    component.isDark = false;
    component.toggleTheme();

    expect(component.isDark).toBe(true);
    expect(localStorage.getItem('dark')).toBe('true');
    expect((component as any).applyTheme).toHaveBeenCalled();
  });

  it('should apply theme', () => {
    const htmlElement: HTMLHtmlElement = document.createElement('html');
    jest.spyOn(document, 'querySelector').mockReturnValue(htmlElement);

    component.isDark = true;
    component['applyTheme']();
    expect(htmlElement.classList.contains('dark')).toBe(true);

    component.isDark = false;
    component['applyTheme']();
    expect(htmlElement.classList.contains('dark')).toBe(false);
  });
});
