import {Point} from "./models/types";
import Chance from "chance";

export class PositionFinder {
    private readonly MAX_ITERATIONS = 200;
    private readonly maxRadius: number;
    private readonly _cache: Array<Point> = [];

    constructor(maxRadius: number) {
        this.maxRadius = maxRadius;
    }

    findCoordinates(chance: Chance.Chance, minRadius: number, maxRadius: number, startAngle: number): Point {
        let iterationCounter = 0
        let coordinates = this.calculateCoordinate(minRadius, maxRadius, startAngle)
        let foundAPlace = false

        while (iterationCounter < this.MAX_ITERATIONS) {
            if (this.thereIsCollision(coordinates)) {
                coordinates = this.calculateCoordinate(minRadius, maxRadius, startAngle)
            } else {
                foundAPlace = true
                break
            }
            iterationCounter++
        }

        if (foundAPlace) {
            return coordinates
        }

        throw Error("Ring is full.")
    }

    private calculateCoordinate(minR: number, maxR: number, startAngle: number): Point {
        const bw = 6
        const chance = Chance();

        const radian = this.radian(startAngle),
            adjustX = Math.sin(radian) - Math.cos(radian),
            adjustY = -Math.cos(radian) - Math.sin(radian),
            radius = chance.floating({min: minR + bw, max: maxR - bw})

        let angleDelta = (Math.asin(bw / 2 / radius) * 180) / Math.PI
        angleDelta = angleDelta > 45 ? 45 : angleDelta

        const angle = this.radian(chance.integer({min: angleDelta, max: 90 - angleDelta}))

        const x = this.maxRadius + radius * Math.cos(angle) * adjustX
        const y = this.maxRadius + radius * Math.sin(angle) * adjustY

        return {x, y}
    }

    private thereIsCollision(blipPos: Point) {
        return this._cache.some(function (cached: Point) {
            return (
                Math.abs(cached.x - blipPos.x) < 12 &&
                Math.abs(cached.y - blipPos.y) < 12
            )
        })
    }

    private radian(angle: number): number {
        return (Math.PI * angle) / 180;
    }
}
