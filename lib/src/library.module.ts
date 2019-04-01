/**
 * @Author: Alex Sorafumo
 * @Date:   09/12/2016 9:39 AM
 * @Email:  alex@yuion.net
 * @Filename: index.ts
 * @Last modified by:   Alex Sorafumo
 * @Last modified time: 06/02/2017 11:28 AM
 */

import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { LIBRARY_SETTINGS } from './settings';
import { MapComponent } from './components/map.component';
import { MapRendererComponent } from './components/map-renderer/map-renderer.component';
import { MapOverlayOutletComponent } from './components/map-overlay-outlet/map-overlay-outlet.component';
import { MapRangeComponent } from './components/overlays/map-range/map-range.component';
import { MapPinComponent } from './components/overlays/map-pin/map-pin.component';

import { MapInputDirective } from './directives/map-input.directive';
import { MapStylerDirective } from './directives/map-styler.directive';

import { SafePipe } from './pipes/safe.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';

import * as day_api from 'dayjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
const dayjs = day_api;

const COMPONENTS: Type<any>[] = [
    MapComponent,
    MapRendererComponent,
    MapOverlayOutletComponent
];

const DIRECTIVES: Type<any>[] = [
    MapInputDirective,
    MapStylerDirective
];

const ENTRY_COMPONENTS: Type<any>[] = [
    MapRangeComponent,
    MapPinComponent
];

const PIPES: Type<any>[] = [
    SafePipe,
    SafeUrlPipe
];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...ENTRY_COMPONENTS,
        ...DIRECTIVES,
        ...PIPES
    ],
    imports: [
        CommonModule,
        HttpClientModule
    ],
    entryComponents: [
        ...ENTRY_COMPONENTS
    ],
    exports: [
        ...COMPONENTS,
        ...ENTRY_COMPONENTS
    ]
})
class LibraryModule {
    public static version = '0.1.0';
    private static init = false;
    private build = dayjs(1552621020000);

    constructor() {
        if (!LibraryModule.init) {
            const now = dayjs();
            LibraryModule.init = true;
            const build = now.isSame(this.build, 'd') ? `Today at ${this.build.format('h:mmA')}` : this.build.format('D MMM YYYY, h:mmA');
            LIBRARY_SETTINGS.version(LibraryModule.version, build);
        }
    }
}

export const ACA_DATA_PICKER_MODULE = LibraryModule;
export const DatePickerModule = LibraryModule;
