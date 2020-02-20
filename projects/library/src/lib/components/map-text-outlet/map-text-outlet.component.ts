import { Component, Input } from '@angular/core';

import { MapRenderFeature } from '../../classes/map-render-feature';

@Component({
    selector: 'map-text-outlet',
    templateUrl: './map-text-outlet.component.html',
    styleUrls: ['./map-text-outlet.component.scss']
})
export class MapTextOutletComponent {
    /** List of text items to render on top of the map */
    @Input() items: MapRenderFeature[] = [];
    /** Rotation of the map */
    @Input() rotation: number = 0;
}
