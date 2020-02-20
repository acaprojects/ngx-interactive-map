import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapRadiusComponent } from './map-radius.component';

describe('MapRadiusComponent', () => {
  let component: MapRadiusComponent;
  let fixture: ComponentFixture<MapRadiusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapRadiusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapRadiusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
