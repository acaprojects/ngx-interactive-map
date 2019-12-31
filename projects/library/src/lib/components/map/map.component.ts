
import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges, Injector } from '@angular/core';

import { IMapListener } from '../../directives/map-styler.directive';
import { BaseWidgetDirective } from '../../base.directive';
import { IMapFeature, IMapPoint, IStyleMappings } from '../map.interfaces';
import { AMapFeature } from '../map-feature/map-feature.class';

@Component({
    selector: 'a-map',
    templateUrl: './map.template.html',
    styles: [`
        .container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 12em;
            min-width: 12em;
            overflow: hidden;
            z-index: 1;
        }
        i { display: none }
    `]
})
export class AMapComponent extends BaseWidgetDirective implements OnChanges {
    /** URL to the map SVG file */
    @Input() public src: string;
    /** Mapping of CSS styles to apply to the map */
    @Input('cssStyles') public style_map: IStyleMappings;
    /** Zoom level as a percentage */
    @Input() public zoom: number;
    /** Points of interest to render on the map */
    @Input() public features: IMapFeature[];
    /** Point on map to center on */
    @Input() public focus: IMapFeature;
    /** Event listeners for elements on the map */
    @Input() public listeners: IMapListener[];
    /** Center point of the map */
    @Input() public center: IMapPoint;
    /** Disable moving and zooming the map */
    @Input() public lock: boolean;
    /** Emitter for changes to the zoom percentage */
    @Output() public zoomChange = new EventEmitter();
    /** Emitter for changes to the center position */
    @Output() public centerChange = new EventEmitter();
    /** Emitter for listened events */
    @Output() public event = new EventEmitter();

    /** SVG Element for the map */
    public map: SVGElement;
    /** List of processed map features */
    public render_features: AMapFeature[] = [];
    /** String of mapped CSS values */
    public css: string;
    /** Processed zoom level value */
    public scale: number;

    constructor(private _injector: Injector) {
        super();
    }

    public ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes.features) {
            this.updateFeatures();
        }
        if (changes.zoom) {
            this.scale = this.zoom;
        }
    }

    /**
     * Update the center position of the map and emit the change
     * @param center New center position
     */
    public postCenter(center: IMapPoint): void {
        this.center = center;
        this.centerChange.emit(center);
    }

    /**
     * Update the zoom level of the map and emit the change
     * @param zoom New zoom level
     */
    public postZoom(zoom: number): void {
        this.zoom = zoom;
        this.zoomChange.emit(zoom);
    }

    public handleEvent(e) {

    }

    public updateMap(el: SVGElement) {
        this.timeout('map', () => this.map = el, 10);
    }

    /**
     * Reset the position and scale to their intial values
     */
    public reset() {
        this.postZoom(1);
        this.scale = 1;
        this.postCenter({ x: .5, y: .5 });
    }

    /**
     * Update the list of features keeping already existing feature
     */
    private updateFeatures() {
        const features = this.features;
        this.render_features = (features || []).reduce((a, v) => {
            const feature = this.render_features.find(
                i => i.id === v.id && i.content === v.content
            );
            if (feature) {
                feature.data = v.data;
                a.push(feature);
            } else {
                a.push(new AMapFeature(this, this._injector, v));
            }
            return a;
        }, []);
    }

}
