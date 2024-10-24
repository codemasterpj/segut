import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeyProteccionDatosComponent } from './ley-proteccion-datos.component';

describe('LeyProteccionDatosComponent', () => {
  let component: LeyProteccionDatosComponent;
  let fixture: ComponentFixture<LeyProteccionDatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeyProteccionDatosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeyProteccionDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
