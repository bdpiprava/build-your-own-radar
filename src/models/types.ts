import {Selection} from "d3";

export interface Blip {
    order: number;
    name: string;
    description: string;
    quadrant: number;
    ring: number;
    point: Point
}

export interface BlipSvgData {
    point: Point
    blip: Blip
}

export type HTMLElem<T extends HTMLElement> = Selection<T, unknown, HTMLElement, unknown>
export type SVGElem<T extends SVGGraphicsElement> = Selection<T, unknown, HTMLElement, unknown>

export class Point {
    readonly x: number;
    readonly y: number;
    private readonly PADDING = 40;
    private readonly BLIP_SIZE = 30;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }


    isOutSideOfArc(cx: number, cy: number): boolean {
        return Point.between(this.x, cx - this.PADDING, cx + this.PADDING) ||
            Point.between(this.y, cy - this.PADDING, cy + this.PADDING);
    }

    isOverLapping(p: Point): boolean {
        return this.x <= p.x2() &&
            this.x2() >= p.x &&
            this.y <= p.y2() &&
            this.y2() >= p.y
    }

    toString(): string {
        return `(${Math.round(this.x)},${Math.round(this.y)})`
    }

    private x2() {
        return this.x + this.BLIP_SIZE;
    }

    private y2() {
        return this.y + this.BLIP_SIZE;
    }

    private static between(n: number, min: number, max: number) {
        return min < n && n < max;
    }
}

