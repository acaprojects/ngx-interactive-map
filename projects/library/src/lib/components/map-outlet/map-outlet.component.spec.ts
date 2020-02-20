import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapOutletComponent } from './map-outlet.component';

describe('MapOutletComponent', () => {
  let component: MapOutletComponent;
  let fixture: ComponentFixture<MapOutletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapOutletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
