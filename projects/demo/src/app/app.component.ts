import { Component, ViewEncapsulation } from '@angular/core';

import { MapPinComponent } from 'projects/library/src/lib/components/overlays/map-pin/map-pin.component';
import { MapRadiusComponent } from 'projects/library/src/lib/components/overlays/map-radius/map-radius.component';

import * as dayjs from 'dayjs';

@Component({
    selector: 'app-root',
    templateUrl: `./app.component.html`,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    public model: { [name: string]: any } = { show: {}, map: {} };

    public ngOnInit(): void {
        this.updatePointsOfInterest();
        this.model.show = {};
        this.model.map = {};
        this.model.map.src = 'assets/level_10.svg';
        this.model.map.text = [
            { id: 'area-10.06-status', content: 'Meeting Room\n10.06' },
            { id: 'area-10.05-status', content: 'Meeting Room\n10.05' },
            { id: 'scanner-2', content: 'Scanner', show_after_zoom: 2, styles: { 'color': 'red' } }
        ];
        this.model.map.listeners = [
            { id: 'area-10.06-status', event: 'click', callback: () => console.log('Clicked: 10.06') }
        ];
        this.model.zoom = 1;
        this.model.center = { x: 0.25, y: 0.75 };
        this.model.count = Array(3).fill(0);
    }

    public togglePin() {
        this.model.show.pin = !this.model.show.pin;
        this.updatePointsOfInterest();
    }

    public toggleRadius() {
        this.model.show.radius = !this.model.show.radius;
        this.updatePointsOfInterest();
    }

    public toggleMap() {
        this.model.map.src =
            this.model.map.src.indexOf('180') >= 0 ? 'assets/level_10.svg' : 'assets/australia-180-rot.svg';
    }

    public zoom(value: number) {
        if (value > 0) {
            this.model.zoom = +(this.model.zoom * (1 + value / 100)).toFixed(5);
            if (this.model.zoom > 10) {
                this.model.zoom = 10;
            }
        } else if (value < 0) {
            this.model.zoom = +(this.model.zoom * (1 / (1 - value / 100))).toFixed(5);
            if (this.model.zoom < 1) {
                this.model.zoom = 1;
            }
        }
    }

    public updatePointsOfInterest() {
        this.model.map.poi = [];
        if (this.model.show.radius) {
            this.model.map.poi.push({
                coordinates: { x: 3000, y: 3000 },
                content: MapRadiusComponent,
                data: { text: `I'm somewhere in this circle`, diameter: 5 }
            });
        }
        if (this.model.show.pin) {
            this.model.fixed = !this.model.fixed;
            const fixed = this.model.fixed;
            this.model.map.poi.push({
                id: fixed ? 'area-10.05-status' : undefined,
                coordinates: fixed ? null : { x: 7500, y: 1000 },
                content: MapPinComponent,
                data: {
                    text: fixed ? 'NSW is here' : `I'm currently round here`
                }
            });
            let focus: any = null;
            if (fixed) {
                focus = 'area-10.05-status';
            } else {
                focus = { x: 0.75, y: 0.25 };
            }
            this.model.map.focus = focus;
            this.model.map.styles = {
                '#area-10.05-status': {
                    fill: ['#123456', '#345612', '#561234'][Math.floor(Math.random() * 3)],
                    transition: 'fill 200ms'
                },
                '#area-10.05-status:hover': {
                    fill: ['#654321', '#436521', '#216543'][Math.floor(Math.random() * 3)]
                }
            };
        }
        if (this.model.show.hover) {
            this.model.map.poi.push({
                id: 'area-10.05-status',
                coordinates: null,
                content: MapPinComponent,
                data: { text: 'This state is WA' }
            });
        }
    }

    log(content) {
        console.log('Map Event:', content);
    }
}
