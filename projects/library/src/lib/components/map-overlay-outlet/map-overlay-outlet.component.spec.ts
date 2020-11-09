import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapOverlayOutletComponent } from './map-overlay-outlet.component';

describe('MapOverlayOutletComponent', () => {
  let component: MapOverlayOutletComponent;
  let fixture: ComponentFixture<MapOverlayOutletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapOverlayOutletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapOverlayOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
