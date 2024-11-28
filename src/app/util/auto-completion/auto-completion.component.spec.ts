import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCompletionComponent } from './auto-completion.component';
import {ElementRef} from "@angular/core";
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";

describe('AutoCompletionComponent', () => {
  let component: AutoCompletionComponent;
  let fixture: ComponentFixture<AutoCompletionComponent>;
  let dataVerifier: DataVerifierService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoCompletionComponent],
      providers: [DataVerifierService]
    })
    .compileComponents();

    dataVerifier = TestBed.inject(DataVerifierService);
    fixture = TestBed.createComponent(AutoCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update station value and hide auto-completion menu', () => {
    const stationName = 'Test Station';
    const autoCompletionMenu = {
      nativeElement: {
        classList: {
          contains: jest.fn().mockReturnValue(false),
          add: jest.fn()
        }
      }
    } as unknown as ElementRef;

    component.autoCompletionMenu = autoCompletionMenu;
    component.input_field = document.createElement('input');

    (component as any).updateStationValue(stationName);

    expect(dataVerifier.completion_name).toBe(stationName);
    expect(autoCompletionMenu.nativeElement.classList.add).toHaveBeenCalledWith('hidden');
  });

  it('should simulate enter key press on input field', () => {
    const stationName = 'Test Station';
    component.autoCompletionMenu = {
      nativeElement: {
        classList: {
          contains: jest.fn().mockReturnValue(false),
          add: jest.fn()
        }
      }
    } as unknown as ElementRef;
    component.input_field = document.createElement('input');
    const focusSpy = jest.spyOn(component.input_field, 'focus');
    const dispatchEventSpy = jest.spyOn(component.input_field, 'dispatchEvent');

    jest.useFakeTimers();
    (component as any).updateStationValue(stationName);
    jest.advanceTimersByTime(100);

    expect(focusSpy).toHaveBeenCalled();
    setTimeout(() => {
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter', code: 'Enter' }));
    }, 100);
  });
});
