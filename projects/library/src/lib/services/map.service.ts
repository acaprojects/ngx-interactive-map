
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { log } from '../settings';
import { RenderableMap } from '../classes/renderable-map';

import * as day_api from 'dayjs';
const dayjs = day_api;

const MAP_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export interface IMapItem<T> {
    expiry: number;
    data: T;
}

export interface IMapNode {
    /** Node identifier */
    id: string;
    data: RenderableMap;
}

@Injectable({
    providedIn: 'root'
})
export class MapService {
    /** Map SVGs */
    private maps: { [name: string]: IMapItem<RenderableMap> } = {};
    /** Map Nodes */
    public logs: {
        warning_ids: string[];
        warnings: string[];
        errors: string[];
    } = {
        warning_ids: [],
        warnings: [],
        errors: []
    };

    constructor(private http: HttpClient) {

    }

    /**
     * Loads the map with the given URL
     * @param url URL of the map to load
     * @returns Promise of the raw map file, errors with reason
     */
    public loadMap(url: string) {
        return new Promise<RenderableMap>((resolve, reject) => {
            if (!url) { return resolve(null); }
            const now = (new Date()).getTime();
            if (this.maps[url] && this.maps[url].expiry > now) {
                resolve(this.maps[url].data);
            } else {
                let map: RenderableMap = null;
                this.http.get(url, { responseType: 'text' }).subscribe((data) => {
                    map = new RenderableMap(url, data);
                },
                    (err) => reject(err),
                    () => {
                        if (map) {
                            this.maps[url] = {
                                expiry: now + MAP_EXPIRY,
                                data: map
                            };
                            resolve(map);
                        } else {
                            reject('Invalid SVG map');
                        }
                    });
            }
        });
    }


    /**
     * Clears all the cached map data
     */
    public clear() {
        this.maps = {};
    }

    public log(type: string, msg: string, id?: string, data?: any) {
        if ((type || '').toLowerCase() === 'error') {
            log('MAP(S)', msg, data, 'error');
            this.logs.errors.push(`[${dayjs().format('YYYY-MM-DD hh:mmA')}]${msg}`);
        } else if ((type || '').toLowerCase() === 'warning' || (type || '').toLowerCase() === 'warn') {
            if (id && this.logs.warning_ids.indexOf(id) >= 0) {
                return;
            }
            log('MAP(S)', msg, data, 'warn');
            this.logs.warnings.push(`[${dayjs().format('YYYY-MM-DD hh:mmA')}]${msg}`);
            this.logs.warning_ids.push(id);
        }
    }
}
