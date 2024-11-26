import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCompletionComponent } from './auto-completion.component';

describe('AutoCompletionComponent', () => {
  let component: AutoCompletionComponent;
  let fixture: ComponentFixture<AutoCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoCompletionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutoCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
