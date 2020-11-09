import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APipesModule } from '@acaprojects/ngx-pipes';

import { version } from './settings';

import * as dayjs_api from 'dayjs';
const dayjs = dayjs_api;

import { MapComponent } from './components/map/map.component';

import { BaseWidgetDirective } from './base.directive';
import { MapOutletComponent } from './components/map-outlet/map-outlet.component';
import { MapZoomDirective } from './directives/map-zoom.directive';
import { MapCenterDirective } from './directives/map-center.directive';
import { MapOverlayOutletComponent } from './components/map-overlay-outlet/map-overlay-outlet.component';
import { MapTextOutletComponent } from './components/map-text-outlet/map-text-outlet.component';
import { MapPinComponent } from './components/overlays/map-pin/map-pin.component';
import { MapRadiusComponent } from './components/overlays/map-radius/map-radius.component';

@NgModule({
    declarations: [
        BaseWidgetDirective,
        MapComponent,
        MapOutletComponent,
        MapZoomDirective,
        MapCenterDirective,
        MapOverlayOutletComponent,
        MapTextOutletComponent,
        MapPinComponent,
        MapRadiusComponent
    ],
    imports: [CommonModule, APipesModule, HttpClientModule],
    exports: [
        MapComponent,
        MapPinComponent,
        MapRadiusComponent
    ],
    entryComponents: [
        MapPinComponent,
        MapRadiusComponent
    ]
})
export class LibraryModule {
    public static version = '0.0.0-development';
    private static init = false;
    readonly build = dayjs();

    constructor() {
        if (!LibraryModule.init) {
            const now = dayjs();
            LibraryModule.init = true;
            const build = now.isSame(this.build, 'd') ? `Today at ${this.build.format('h:mmA')}` : this.build.format('D MMM YYYY, h:mmA');
            version(LibraryModule.version, build);
        }
    }
}

export { LibraryModule as ACA_INTERACTIVE_MAP_MODULE };
export { LibraryModule as AInteractiveMapModule };
