import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPinComponent } from './map-pin.component';

describe('MapPinComponent', () => {
  let component: MapPinComponent;
  let fixture: ComponentFixture<MapPinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapPinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
