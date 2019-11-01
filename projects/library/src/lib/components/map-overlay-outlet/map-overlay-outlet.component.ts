import {
    Component,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    Renderer2,
    OnInit,
    OnChanges,
    TemplateRef,
    Injector,
    Injectable
} from '@angular/core';

import { BaseWidgetDirective } from '../../base.directive';

import { MapUtilities } from '../../utlities/map.utilities';
import { AMapFeature } from '../map-feature/map-feature.class';


@Component({
    selector: 'map-overlay-outlet',
    templateUrl: './map-overlay-outlet.component.html',
    styleUrls: ['./map-overlay-outlet.component.scss']
})
export class MapOverlayOutletComponent extends BaseWidgetDirective implements OnInit, OnChanges {
    /** List of points of interest */
    @Input() items: AMapFeature[];
    /** Map elment render to the DOM */
    @Input() map: SVGElement;
    /** Map root element */
    @Input() container: HTMLDivElement;
    /** Zoom level as decimal */
    @Input() scale: number;
    /** Event emitter for Point of interest events */
    @Output() event = new EventEmitter();

    protected list: AMapFeature[] = [];

    constructor(private injector: Injector, protected renderer: Renderer2) {
        super();
    }

    public ngOnInit() {
        if (this.isIE()) {
            this.renderer.listen('window', 'resize', () => {
                this.timeout('update', () => this.processItems(), 200);
            });
        }
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.items || changes.map) {
            this.timeout('update', () => this.processItems(), changes.map && !changes.map.previousValue ? 1000 : 200);
        }
    }

    public processItems() {
        if (!this.items) { return; }
        if (this.items.length <= 0) { this.list = []; return; }
        this.timeout('process', () => {
            this.list = [...this.items];
            this.updateItems();
        });
    }

    public updateItems() {
        const view_box = this.map.getAttribute('viewBox').split(' ');
        const map_box = this.map.getBoundingClientRect();
        const box = this.container.getBoundingClientRect();
        const x_scale = Math.max(1, (map_box.width / map_box.height) / (+view_box[2] / +view_box[3]));
        const y_scale = Math.max(1, (map_box.height / map_box.width) / (+view_box[3] / +view_box[2]));
        for (const feature of this.list) {
            this.calculatePosition(feature, { x_scale, y_scale, view: view_box, map: map_box, cntr: box });
        }
    }

    /**
     * Calculate render position of the given point of interest
     * @param item POI Item
     */
    public calculatePosition(item: AMapFeature, details: { [name: string]: any }) {
        const el = item.id ? this.map.querySelector(MapUtilities.cleanCssSelector(`#${item.id}`)) : null;
        if (el || item.coordinates) {
            const pos_box = this.isIE() && item.coordinates ? { width: +details.view[2], height: +details.view[3] } : details.cntr;
            const position = MapUtilities.getPosition(pos_box, el, item.coordinates) || { x: .5, y: .5 };
            if (this.isIE() && item.coordinates) {
                // Normalise dimensions
                position.x = position.x / details.x_scale + (details.x_scale - 1) / 2;
                position.y = position.y / details.y_scale + (details.y_scale - 1) / 2;
            }
            item.position = position;
        }
    }

    public isIE() {
        return navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || !!navigator.userAgent.match(/MSIE/g);
    }

    public trackByFn(index: number, item: AMapFeature) {
        return item ? item.id || `${item.position.x},${item.position.y}` : index;
    }
}
