import { Directive, Input, Output, EventEmitter, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

import { BaseWidgetDirective } from '../base.directive';
import { MapUtilities } from '../utlities/map.utilities';
import { IStyleMappings } from '../components/map.interfaces';

export interface IMapListener {
    id: string;
    event: string;
}

@Directive({
    selector: '[aca-map-styler]',
})
export class MapStylerDirective extends BaseWidgetDirective implements OnChanges {
    @Input() public id: string;
    @Input('cssStyles') public styles: IStyleMappings;
    @Input() public map: Element;
    @Output() public css = new EventEmitter<string>();

    private model: { [name: string]: any } = {};

    constructor(private renderer: Renderer2) { super(); }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.styles) {
            this.update();
        }
    }

    public update() {
        this.clear();
        if (this.styles) {
            let css = '';
            for (const selector in this.styles) {
                if (this.styles.hasOwnProperty(selector)) {
                    let style = `.map [map-${this.id}] ${MapUtilities.cleanCssSelector(selector)} { `;
                    for (const property in this.styles[selector]) {
                        if (this.styles[selector][property]) {
                            style += `${property}: ${this.styles[selector][property]}; `;
                        }
                    }
                    style += '} ';
                    css += style;
                }
            }
            this.model.css = css;
            this.model.style_el = document.createElement('style');
            this.model.style_el.innerHTML = css;
            this.renderer.appendChild(document.head, this.model.style_el);
            const replaced = this.model.css.replace(new RegExp(`\\.map \\[map-${this.id}\\]`, 'g'), '');
            this.css.emit(replaced);
        }
    }

    public clear() {
        if (this.model.css && this.model.style_el) {
            this.renderer.removeChild(document.head, this.model.style_el);
            this.model.css = '';
        }
    }
}
