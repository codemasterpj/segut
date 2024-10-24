import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespondeEncuestaComponent } from './responde-encuesta.component';

describe('RespondeEncuestaComponent', () => {
  let component: RespondeEncuestaComponent;
  let fixture: ComponentFixture<RespondeEncuestaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespondeEncuestaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespondeEncuestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
