import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { MapComponent } from './map.component';
import { MapService } from '../../services/map.service';
import { RenderableMap } from '../../classes/renderable-map';

@Component({
    selector: 'a-map-outlet',
    template: '',
    inputs: ['zoom', 'center', 'listeners', 'features', 'text', 'map']
})
class MockMapOutlet {}

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;
    let service: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MapComponent, MockMapOutlet],
            providers: [
                { provide: MapService, useValue: jasmine.createSpyObj('MapService', ['loadMap']) }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        service = TestBed.get(MapService);
        service.loadMap.and.returnValue(Promise.resolve(new RenderableMap('test.svg', '<svg></svg>')));
        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
