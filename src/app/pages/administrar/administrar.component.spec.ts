import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarComponent } from './administrar.component';

describe('AdministrarComponent', () => {
  let component: AdministrarComponent;
  let fixture: ComponentFixture<AdministrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
