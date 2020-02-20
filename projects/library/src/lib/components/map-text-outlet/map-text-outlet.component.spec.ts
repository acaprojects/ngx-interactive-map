import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapTextOutletComponent } from './map-text-outlet.component';

describe('MapTextOutletComponent', () => {
  let component: MapTextOutletComponent;
  let fixture: ComponentFixture<MapTextOutletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapTextOutletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapTextOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
