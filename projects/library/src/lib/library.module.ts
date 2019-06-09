import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APipesModule } from '@acaprojects/ngx-pipes';

import { version } from './settings';

import * as dayjs_api from 'dayjs';
const dayjs = dayjs_api;

import { AMapComponent } from './components/map/map.component';
import { MapOverlayOutletComponent } from './components/map-overlay-outlet/map-overlay-outlet.component';
import { MapRendererComponent } from './components/map-renderer/map-renderer.component';

import { MapInputDirective } from './directives/map-input.directive';
import { MapStylerDirective } from './directives/map-styler.directive';

import { MapPinComponent } from './components/overlays/map-pin/map-pin.component';
import { MapRangeComponent } from './components/overlays/map-range/map-range.component';
import { BaseWidgetComponent } from './base.component';

@NgModule({
    declarations: [
        BaseWidgetComponent,
        AMapComponent,
        MapOverlayOutletComponent,
        MapRendererComponent,
        MapPinComponent,
        MapRangeComponent,
        MapInputDirective,
        MapStylerDirective
    ],
    imports: [CommonModule, APipesModule, HttpClientModule],
    exports: [
        AMapComponent,
        MapPinComponent,
        MapRangeComponent
    ],
    entryComponents: [
        MapPinComponent,
        MapRangeComponent
    ]
})
export class LibraryModule {
    public static version = 'local-dev';
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
