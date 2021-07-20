import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputMapsComponent } from './input-maps.component';

describe('InputMapsComponent', () => {
  let component: InputMapsComponent;
  let fixture: ComponentFixture<InputMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputMapsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
