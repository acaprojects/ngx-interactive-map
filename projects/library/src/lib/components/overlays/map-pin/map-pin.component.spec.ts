import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MapPinComponent } from './map-pin.component';
import { MAP_OVERLAY_DATA } from '../../map-overlay-outlet/map-overlay-outlet.component';

describe('MapPinComponent', () => {
    let component: MapPinComponent;
    let fixture: ComponentFixture<MapPinComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MapPinComponent],
            providers: [
                { provide: MAP_OVERLAY_DATA, useValue: {} }
            ],
            imports: [NoopAnimationsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapPinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show a pin', () => {
        const compiled: HTMLElement = fixture.debugElement.nativeElement;
        const element: SVGElement = compiled.querySelector('svg');
        expect(element).toBeTruthy();
    });

    it('should show text', () => {
        const compiled: HTMLElement = fixture.debugElement.nativeElement;
        let element: HTMLDivElement = compiled.querySelector('.text');
        expect(element).toBeFalsy();
        (component as any)._data.text = 'Test';
        component.show_text = true;
        fixture.detectChanges();
        element = compiled.querySelector('.text');
        expect(element).toBeTruthy();
        expect(element.textContent).toBe('Test');
    });
});
