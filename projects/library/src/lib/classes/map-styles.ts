import { HashMap } from '../helpers/type.helpers';
import { cleanCssSelector } from '../helpers/map.helpers';
import { RenderableMap } from './renderable-map';

export class MapStyles {
    /** Mapping of CSS selectors to override CSS properties */
    public readonly styles: HashMap<HashMap<string>>;
    /** CSS string that can be injected into the DOM */
    private _css: string;
    /** Element rendering the map styles */
    private _element: HTMLStyleElement;
    /** CSS string that can be injected into the DOM */
    public get css(): string {
        return this._css;
    }

    constructor(styles: HashMap<HashMap<string>>, private map: RenderableMap) {
        this.styles = styles;
        this._css = this._processStyles(styles);
        this._renderStyleElement(this.css);
    }

    /** Cleanup map styles */
    public destroy() {
        if (this._element) {
            this._element.parentElement.removeChild(this._element);
            delete this._element;
            this._element = null;
        }
    }

    /**
     * Convert style map into CSS string
     * @param styles Mapping of CSS selectors to override CSS properties
     */
    private _processStyles(styles: HashMap<HashMap<string>>): string {
        let css = '';
        for (const selector in this.styles) {
            if (this.styles.hasOwnProperty(selector)) {
                let style = `.map [map-${this.map ? this.map.id : '0'}] ${cleanCssSelector(selector)} { `;
                for (const property in this.styles[selector]) {
                    if (this.styles[selector][property]) {
                        style += `${property}: ${this.styles[selector][property]}; `;
                    }
                }
                style += '} ';
                css += style;
            }
        }
        return css;
    }

    /** Render Style Element on the DOM */
    private _renderStyleElement(css: string) {
        if (this.map) {
            const element = document.createElement('style');
            element.id = `placeos-${this.map.id}`;
            element.innerHTML = css;
            document.head.appendChild(element);
            this._element = element;
        }
    }
}
