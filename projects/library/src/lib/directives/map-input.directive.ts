import { Directive, Input, Output, EventEmitter, HostListener, Renderer2, SimpleChanges, ElementRef, OnChanges } from "@angular/core";

import { BaseWidgetDirective } from '../base.directive';
import { MapService } from '../services/map.service';
import { MapUtilities } from '../utlities/map.utilities';
import { IMapPoint, IMapFeature } from '../components/map.interfaces';

export interface IMapListener {
    id: string;
    selector: string;
    event: string;
    callback: Function;
}

interface POILocation {
    scale: number;
    center: IMapPoint;
}

@Directive({
    selector: '[aca-map-input]',
})
export class MapInputDirective extends BaseWidgetDirective implements OnChanges {
    @Input() public scale: number;
    @Input() public center: IMapPoint;
    @Input() public listeners: IMapListener[];
    @Input() public focus: IMapFeature;
    @Input() public map: SVGElement;
    @Input() public src: string;
    @Input() public lock: boolean;
    @Output() public scaleChange = new EventEmitter();
    @Output() public centerChange = new EventEmitter();
    @Output() public event = new EventEmitter();

    private model: { [name: string]: any } = {};

    private _active_listeners: (() => void)[] = [];

    private map_box: ClientRect;
    private lookup: { [src: string]: { [id: string]: POILocation } } = {};

    constructor(private el: ElementRef<HTMLElement>, private service: MapService, private renderer: Renderer2) {
        super();
    }

    public ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes.src) {
            if (!this.lookup[this.src]) {
                this.lookup[this.src] = {};
            }
        }
        if (changes.map && this.map) {
            this.update();
        }
        if (changes.listeners) {
            this.updateListeners();
        }
        if (changes.focus) {
            this.focusItem();
        }
    }

    /**
     * Start of move event
     * @param e
     */
    @HostListener('touchstart', ['$event']) public touchMoveStart(e) {
        if (this.lock) { return; }
        e.center = e.center || { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.moveStart(e);
        this.model.listen_move = this.renderer.listen('window', 'touchmove', (e) => this.move(e));
        this.model.listen_move_end = this.renderer.listen('window', 'touchend', (e) => this.moveEnd());
    }

    /**
     * Start of move event
     * @param e
     */
    @HostListener('mousedown', ['$event']) public mouseMoveStart(e) {
        if (this.lock) { return; }
        e.center = e.center || { x: e.clientX, y: e.clientY };
        this.moveStart(e);
        this.model.listen_move = this.renderer.listen('window', 'mousemove', (e) => this.move(e));
        this.model.listen_move_end = this.renderer.listen('window', 'mouseup', (e) => this.moveEnd());
    }

    /**
     * End move events on contextmenu action
     * @param e
     */
    @HostListener('contextmenu', ['$event']) public onContext(e) {
        this.timeout('contextmenu', () => this.moveEnd());
    }

    public moveStart(e) {
        if (this.model.listen_move) {
            this.model.listen_move();
            this.model.listen_move = null;
        }
        if (this.model.listen_move_end) {
            this.model.listen_move_end();
            this.model.listen_move_end = null;
        }
        this.model.center_start = this.center;
        this.model.target = e.target;
        this.model.dx = e.center.x;
        this.model.dy = e.center.y;
    }

    public moveEnd() {
        if (this.model.listen_move) {
            this.model.listen_move();
            this.model.listen_move = null;
        }
        if (this.model.listen_move_end) {
            this.model.listen_move_end();
            this.model.listen_move_end = null;
        }
    }


    public get isIE() {
        return navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || !!navigator.userAgent.match(/MSIE/g);
    }

    /**
     * Move event
     * @param e
     */
    public move(e) {
        if (this.lock) { return; }
        e.center = e.center || { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY };
        const dx = e.center.x - this.model.dx;
        const dy = e.center.y - this.model.dy;
        const center = this.model.center_start || { x: .5, y: .5 }
        const delta_x = +((dx / this.map_box.width) / this.scale).toFixed(4);
        const delta_y = +((dy / this.map_box.height) / this.scale).toFixed(4);
        this.model.center = { x: center.x - delta_x, y: center.y - delta_y };
        this.changePosition();
    }

    @HostListener('wheel', ['$event']) public wheelZoom(e) {
        if (this.lock) { return; }
        e.preventDefault();
        this.model.scale = this.scale || 1;
        const rate = (this.isIE ? 1.15 : 1.05);
        this.model.scale *= (e.deltaY > 0 ? rate : (e.deltaY < 0 ? (1 / rate) : 1));
        this.check();
        this.scale = this.model.scale;
        this.scaleChange.emit(this.scale);
    }

    @HostListener('pinchstart', ['$event']) public pinchStart(e) {
        if (this.lock) { return; }
        this.model.dz = e.scale;
        const box = this.map_box;
        const dist = Math.sqrt(box.width * box.width + box.height * box.height);
        const width = e.pointers[0].clientX - e.pointers[1].clientX;
        const height = e.pointers[0].clientY - e.pointers[1].clientY;
        const pinch_dist = Math.sqrt(width * width + height * height);
        this.model.in = 10 * (pinch_dist / dist);
    }

    @HostListener('pinchmove', ['$event']) public pinchZoom(e) {
        if (this.lock) { return; }
        e.preventDefault();
        const dz = e.scale - this.model.dz;
        this.model.scale = this.scale || 1;
        this.model.scale += this.model.in > 1 ? dz * this.model.in : dz;
        this.check();
        this.scale = this.model.scale;
        this.scaleChange.emit(this.scale);
        this.model.dz = e.scale;
    }

    /**
     * Focus on the given point of interest
     */
    public focusItem() {
        if (this.focus && (this.focus.id || this.focus.coordinates)) {
            if (!this.map) {
                return this.timeout('focus', () => this.focusItem());
            }
            if (!this.map_box) {
                this.map_box = this.map.getBoundingClientRect();
            }
            const selector = this.focus.id ? `#${MapUtilities.cleanCssSelector(this.focus.id)}` : ''
            const el = this.focus.id ? this.map.querySelector(selector) : null;
            if (el) { // Focus on element
                if (this.lookup[this.src][selector]) {
                    this.model.center = this.lookup[this.src][selector].center;
                    this.focus.zoom ? this.focus.zoom / 100 : this.lookup[this.src][selector].scale;
                } else {
                    const box = el.getBoundingClientRect();
                    const map_box = this.map.getBoundingClientRect();
                    this.model.center = {
                        x:  ((box.left + box.width / 2) - map_box.left) / map_box.width,
                        y:  ((box.top + box.height / 2) - map_box.top) / map_box.height
                    };
                    this.model.scale = this.focus.zoom ? this.focus.zoom / 100 : MapUtilities.getFillScale(map_box, box) * .6;
                    this.lookup[this.src][selector] = {
                        scale: MapUtilities.getFillScale(map_box, box) * .6,
                        center: { ...this.model.center }
                    };
                }
                this.changePosition(true)
            } else if (this.focus.coordinates) { // Focus on coordinates
                const pnt = this.focus.coordinates;
                const ratio = this.map_box.height / this.map_box.width;
                this.model.center = { x: pnt.x / 10000, y: pnt.y / (10000 * ratio) };
                this.model.scale = this.focus.zoom ? this.focus.zoom / 100 : 1;
                this.changePosition(true);
            }
        }
    }

    /**
     * Update bounding box of map
     */
    public update() {
        if (this.map) {
            this.map_box = this.map.getBoundingClientRect();
            if (this.map_box.height === 0 || this.map_box.width === 0) {
                return this.timeout('update_fail', () => this.update());
            }
            this.model.scale = 1;
            this.model.center = { x: .5, y: .5 };
            if (this.focus) {
                this.focusItem();
            } else {
                this.changePosition(true);
            }

        }
    }

    /**
     * Make sure center and scale are within bounds
     */
    public check() {
        if (!this.model.center) { this.model.center = { x: .5, y: .5 }; }
            // Make sure 0 <= x <= 1
        if (this.model.center.x < 0) { this.model.center.x = 0; }
        else if (this.model.center.x > 1) { this.model.center.x = 1; }
            // Make sure 0 <= y <= 1
        if (this.model.center.y < 0) { this.model.center.y = 0; }
        else if (this.model.center.y > 1) { this.model.center.y = 1; }
            // Make sure 100 <= zoom <= 1000
        if (this.model.scale < 1) { this.model.scale = 1; }
        else if (this.model.scale > 10) { this.model.scale = 10; }
    }

    /**
     * Update listeners for map events
     */
    private updateListeners() {
        if (!this.map) {
            return this.timeout('listeners', () => this.updateListeners());
        }
        this.clearListeners();
        if (this.listeners) {
            for (const item of this.listeners) {
                const selector = item.id ? MapUtilities.cleanCssSelector(`#${item.id}`) : `${MapUtilities.cleanCssSelector(item.selector)}`;
                const el = this.map.querySelector(selector);
                if (el) {
                    this.renderer.setStyle(el, 'pointer-events', 'auto');
                    this.renderer.setStyle(el, 'display', 'inline-block');
                    const unsub = this.renderer.listen(el, item.event || 'click', () => {
                        if (item.callback) { item.callback(); }
                        else { this.event.emit({ id: selector, type: 'listener_event' }); }
                    })
                    this._active_listeners.push(() => {
                        this.renderer.setStyle(el, 'pointer-events', '');
                        this.renderer.setStyle(el, 'display', '');
                        unsub();
                    });
                } else {
                    this.service.log('Warn', `Unable to find element with selector '${item.id ? `#${item.id}` : `${item.selector}`}'`, item.id ? `#${item.id}` : `${item.selector}`)
                }
            }
            this.model.listeners = this.listeners;
        }
    }

    /**
     * Remove existing listeners from map
     */
    private clearListeners() {
        if (this._active_listeners) {
            for (const listener of this._active_listeners) {
                listener();
            }
            delete this._active_listeners;
            this._active_listeners = [];
        }
    }

    /**
     * Post changes position of the map
     * @param scale Also post changes to scale
     */
    private changePosition(scale: boolean = false) {
        this.timeout('change', () => {
            this.check();
            this.center = this.model.center;
            this.centerChange.emit(this.center);
            if (scale) {
                this.scale = this.model.scale;
                this.scaleChange.emit(this.scale);
            }
        }, 0);
    }
}
