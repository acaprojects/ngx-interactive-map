import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MapRadiusComponent } from './map-radius.component';
import { BehaviorSubject } from 'rxjs';
import { MapState } from '../../../helpers/map.interfaces';
import { MAP_STATE, MAP_OVERLAY_DATA } from '../../map-overlay-outlet/map-overlay-outlet.component';

describe('MapRadiusComponent', () => {
    let component: MapRadiusComponent;
    let fixture: ComponentFixture<MapRadiusComponent>;
    let state_obs: any;

    beforeEach(async(() => {
        state_obs = new BehaviorSubject<MapState>({ zoom: 1, center: { x: .5, y: .5 } });
        TestBed.configureTestingModule({
            declarations: [MapRadiusComponent],
            providers: [
                { provide: MAP_STATE, useValue: state_obs },
                { provide: MAP_OVERLAY_DATA, useValue: {} }
            ],
            imports: [NoopAnimationsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapRadiusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show a radius circle', () => {
        const compiled: HTMLElement = fixture.debugElement.nativeElement;
        const element: HTMLDivElement = compiled.querySelector('.background');
        expect(element).toBeTruthy();
    });

    it('should show text', () => {
        const compiled: HTMLElement = fixture.debugElement.nativeElement;
        let element: HTMLDivElement = compiled.querySelector('.text');
        expect(element).toBeFalsy();
        (component as any)._data.text = 'Test';
        fixture.detectChanges();
        element = compiled.querySelector('.text');
        expect(element).toBeTruthy();
        expect(element.textContent).toBe('Test');
    });

    it('should scale radius with the zoom value', () => {
        const compiled: HTMLElement = fixture.debugElement.nativeElement;
        const element: HTMLDivElement = compiled.querySelector('.radius');
        expect(element).toBeTruthy();
        expect(element.style.width).toBe('5em');
        component.zoom = 2;
        fixture.detectChanges();
        expect(element.style.width).toBe('10em');
    });
});
