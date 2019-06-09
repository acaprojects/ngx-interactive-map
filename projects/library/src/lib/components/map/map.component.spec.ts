
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MapService } from '../../services/map.service';
import { AMapComponent } from './map.component';
import { MapOverlayOutletComponent } from '../map-overlay-outlet/map-overlay-outlet.component';
import { MapRendererComponent } from '../map-renderer/map-renderer.component';
import { MapInputDirective } from '../../directives/map-input.directive';
import { MapStylerDirective } from '../../directives/map-styler.directive';
import { APipesModule } from '@acaprojects/ngx-pipes';
import { HttpClientModule } from '@angular/common/http';

describe('AMapComponent', () => {
    let fixture: ComponentFixture<AMapComponent>;
    let component: AMapComponent;
    let service: MapService
    let clock: jasmine.Clock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                AMapComponent,
                MapOverlayOutletComponent,
                MapRendererComponent,
                MapInputDirective,
                MapStylerDirective
            ],
            providers: [
                MapService
            ],
            imports: [CommonModule, HttpClientModule, APipesModule, NoopAnimationsModule]
        }).compileComponents();
        fixture = TestBed.createComponent(AMapComponent);
        component = fixture.debugElement.componentInstance;
        service = TestBed.get(MapService);
        clock = jasmine.clock();
        clock.uninstall();
        clock.install();
        fixture.detectChanges();
    });

    afterEach(() => {
        clock.uninstall();
    });

    it('should create an instance', () => {
        expect(component).toBeTruthy();
    });
});
