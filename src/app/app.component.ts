import { Component, ViewContainerRef, ViewEncapsulation, OnInit } from '@angular/core';

import { AppService } from './services/app.service';

import * as day_api from 'dayjs';
import { MapRangeComponent } from '../../lib/src/components/overlays/map-range/map-range.component';
import { MapPinComponent } from '../../lib/src/components/overlays/map-pin/map-pin.component';
const dayjs = day_api;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

    public model: { [name: string]: any } = { show: {}, map: {} };

    public ngOnInit(): void {
        this.updatePointsOfInterest();
        this.model.show = {};
        this.model.map = {};
        this.model.map.src = 'assets/australia.svg';
    }

    public reset() {
        this.model.date = dayjs().valueOf();
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
        this.model.map.src = this.model.map.src.indexOf('180') >= 0 ? 'assets/australia.svg' : 'assets/australia-180-rot.svg';
    }

    public updatePointsOfInterest() {
        this.model.map.poi = [];
        if (this.model.show.radius) {
            this.model.map.poi.push({
                id: 'Nyada',
                coordinates:  { x: 3000, y: 3000 },
                content: MapRangeComponent,
                data: { text: `I'm somewhere in this circle`, diameter: 10 }
            });
        }
        if (this.model.show.pin) {
            this.model.fixed = !this.model.fixed;
            const fixed = this.model.fixed;
            this.model.map.poi.push({
                id: fixed ? 'AU-NSW' : 'Nyada',
                coordinates: fixed ? null : { x: 5000, y: 7500 },
                content: MapPinComponent,
                data: { text: fixed ? 'NSW is here' : `I'm currently round here` }
            });
            const focus: any = {};
            if (fixed) { focus.id = 'AU-NSW'; }
            else { focus.coordinates = { x: 5000, y: 7500 }; }
            this.model.map.focus = focus;
            this.model.map.styles = {
                '#AU-NSW': { fill: ['#123456', '#345612', '#561234'][Math.floor(Math.random() * 3)] },
                '#AU-WA:hover': {
                    fill: ['#654321', '#436521', '#216543'][Math.floor(Math.random() * 3)],
                    transition: 'fill 200ms'
                }
            };
        }
        if (this.model.show.hover) {
            this.model.map.poi.push({
                id: 'AU-WA',
                coordinates: null,
                content: MapPinComponent,
                data: { text: 'This state is WA' }
            });
        }
    }

}
