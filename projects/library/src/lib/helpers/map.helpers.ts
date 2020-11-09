import { Point } from './type.helpers';

/** Encode string into a base 64 string */
export function base64Encode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    const solid = (match, p1) => String.fromCharCode(('0x' + p1) as any);
    return btoa((encodeURIComponent(str) as any).replace(/%([0-9A-F]{2})/g, solid));
}

export function getFillScale(source, dest) {
    const ratio_w = source.width / dest.width;
    const ratio_h = source.height / dest.height;
    return Math.min(ratio_w, ratio_h);
}

export function cleanCssSelector(name) {
    let selector = name.replace(/[!"#$%&'()*+,.\/;<=>?@[\\\]^`{|}~]/g, '\\$&');
    const parts = selector.split(' ');
    for (const p of parts) {
        parts.splice(parts.indexOf(p), 1, [p.replace(/^\\/g, '')]);
    }
    selector = parts.join(' ');
    return selector;
}

export function getPosition(container: ClientRect, element: ClientRect): Point {
    const position = {
        x: element.left - container.left + element.width / 2,
        y: element.top - container.top + element.height / 2
    };
    return {
        x: +(position.x / container.width).toFixed(3),
        y: +(position.y / container.height).toFixed(3)
    };
}

/**
 * Grab point details from mouse or touch event
 * @param event Event to grab details from
 */
export function eventToPoint(event: MouseEvent | TouchEvent): Point {
    if (!event) {
        return { x: -1, y: -1 };
    }
    if (event instanceof MouseEvent) {
        return { x: event.clientX, y: event.clientY };
    } else {
        return event.touches && event.touches.length > 0
            ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
            : { x: -1, y: -1 };
    }
}

export function diffPoints(first: Point, second: Point): Point {
    return {
        x: first.x - second.x,
        y: first.y - second.y
    };
}

export function staggerChange(value: any, callback: (v: any) => any) {
    return new Promise<void>(resolve => {
        requestAnimationFrame(() => {
            const progress = callback(value || 0);
            if (progress) {
                staggerChange(progress, callback).then(() => resolve());
            } else {
                resolve();
            }
        });
    });
}

/** Whether point is inside the rectangle */
export function insideRect(point: Point, rect: ClientRect): boolean {
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}
