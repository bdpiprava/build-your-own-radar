import {BlipJSON, QuadrantJSON, RadarJSON, RingJSON} from "./json_types";
import {sanitize} from "../d3helper";
import {Blip} from "./types";

export class TechRadar {
    private readonly radar: RadarJSON;
    private readonly blipsGroupedByQuadrants: Map<string, Array<Blip>>;

    constructor(radar: RadarJSON) {
        this.radar = radar
        this.blipsGroupedByQuadrants = TechRadar.blipsGroupedByQuadrants(radar)
    }

    quadrantCount() {
        return this.radar.quadrants.length;
    }

    quadrants() {
        return this.radar.quadrants;
    }

    blipsByQuadrants(): Map<string, Array<Blip>> {
        return this.blipsGroupedByQuadrants;
    }


    private static blipsGroupedByQuadrants(radar: RadarJSON): Map<string, Array<Blip>> {
        const groupedByQuadrants = new Map<string, Array<Blip>>()
        let blipCount = 0;
        radar.quadrants.forEach((q: QuadrantJSON, qi: number) => {
            const blips = new Array<Blip>()
            q.rings.forEach((r: RingJSON, ri: number) => {
                r.blips.forEach((b: BlipJSON, bi: number) => {
                    blips.push({
                        order: blipCount++,
                        name: b.name,
                        quadrant: qi,
                        ring: ri,
                        description: b.description
                    })
                })
            })
            groupedByQuadrants.set(sanitize(q.name), blips)
        })
        return groupedByQuadrants;
    }
}
