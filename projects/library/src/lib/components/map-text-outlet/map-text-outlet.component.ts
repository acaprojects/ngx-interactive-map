import { Component, Input } from '@angular/core';

import { MapTextFeature } from '../../helpers/map.interfaces';

@Component({
    selector: 'map-text-outlet',
    templateUrl: './map-text-outlet.component.html',
    styleUrls: ['./map-text-outlet.component.scss']
})
export class MapTextOutletComponent {
    /** List of text items to render on top of the map */
    @Input() items: MapTextFeature[] = [];
    /** Rotation of the map */
    @Input() zoom: number = 1;
    /** Rotation of the map */
    @Input() rotation: number = 0;
}
