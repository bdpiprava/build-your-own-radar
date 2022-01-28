import {Config} from "./models/config";
import {Point} from "./models/types";
import {ringRadius, toDegree, toRadian} from "./d3helper";
import Chance from "chance";

export class PositionFinder {
    private c: Config;
    private readonly chance: Chance.Chance;
    private readonly MAX_ITERATION = 300;
    private static _pointCache: Array<Point> = new Array<Point>()

    constructor(config: Config) {
        this.c = config;
        this.chance = new Chance.Chance(config.WIDTH * config.HEIGHT)
    }

    /**
     * Returns the random point on given quadrant and ring.
     * The returned point is most probably not overlap the other points returned by this method in earlier calls.
     *
     * @param quadrant
     * @param ring
     * @Returns Point
     */
    findPointOnRing(quadrant: number, ring: number): Point {
        let point: Point
        let found = false
        for (let i = 0; i < this.MAX_ITERATION; i++) {
            point = this.getRandomPointOnRing(quadrant, ring);
            if (point.isOutSideOfArc(this.c.MID_X, this.c.MID_Y)) {
                continue;
            }

            if (!PositionFinder._pointCache.some((placed: Point) => point.isOverLapping(placed))) {
                found = true
                break;
            }
        }

        if (found) {
            PositionFinder._pointCache.push(point);
            return point;
        }

        throw Error(`Failed to find free point for quadrant ${this.c.QUADRANTS[quadrant]} on ring ${this.c.RINGS[ring]}`)
    }

    /**
     * Returns the random point on given quadrant and ring. The given point can overlap the other points in the ring.
     * @param quadrant - quadrant number
     * @param ring - ring number in quadrant
     * @Returns Point
     */
    getRandomPointOnRing(quadrant: number, ring: number): Point {
        const innerRadius = ringRadius(ring, this.c.RINGS.length, this.c.MID_X)
        const outerRadius = ringRadius(ring + 1, this.c.RINGS.length, this.c.MID_X)

        const a = this.calculateAngle(quadrant);
        const r = this.calculateRadius(innerRadius, outerRadius)

        return new Point(this.c.MID_X + (r * Math.cos(a)), this.c.MID_Y + r * Math.sin(a))
    }

    // Magic number 8 is to keep it away from the border
    private calculateRadius(minR: number, maxR: number): number {
        return this.randF(minR + this.c.BLIP_SIZE + 8, maxR - (this.c.BLIP_SIZE + 8));
    }

    private calculateAngle(quadrant: number): number {
        return toRadian(this.randF(
            toDegree(this.c.arcInfo(quadrant).startAngle),
            toDegree(this.c.arcInfo(quadrant).endAngle)
        ));
    }

    private randF(min: number, max: number): number {
        return this.chance.floating({min, max})
    }
}