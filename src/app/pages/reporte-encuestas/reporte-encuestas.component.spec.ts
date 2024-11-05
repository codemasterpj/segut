import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteEncuestasComponent } from './reporte-encuestas.component';

describe('ReporteEncuestasComponent', () => {
  let component: ReporteEncuestasComponent;
  let fixture: ComponentFixture<ReporteEncuestasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteEncuestasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteEncuestasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
