import {RadarJSON} from "./json_types";

export class TechRadar {
    private readonly radar: RadarJSON;

    constructor(radar: RadarJSON) {
        this.radar = radar
    }

    quadrantCount() {
        return this.radar.quadrants.length;
    }

    quadrants() {
        return this.radar.quadrants;
    }
}
