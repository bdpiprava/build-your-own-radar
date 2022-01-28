import {ColorJSON, ConfigJSON, FontJSON} from "./json_types";
import * as d3 from "d3";
import {PieArcDatum} from "d3";
import {types} from "sass";
import {EnvProvider} from "../env_provider";

export class Config {
    private readonly envProvider: EnvProvider;
    private readonly config: ConfigJSON;
    private readonly colors: ColorJSON;
    private readonly quadrantArcData: Array<PieArcDatum<unknown>>;
    public readonly WIDTH: number;
    public readonly HEIGHT: number;
    public readonly MID_X: number;
    public readonly MID_Y: number;
    public readonly CONTAINER_ID: string;
    public readonly RINGS: Array<string>;
    public readonly QUADRANTS: Array<string>;
    public readonly FONT: FontJSON;
    public readonly BLIP_SIZE: number;

    constructor(config: ConfigJSON) {
        this.envProvider = new EnvProvider();
        this.config = config;
        this.WIDTH = config.width;
        this.HEIGHT = config.height;
        this.MID_X = config.width / 2;
        this.MID_Y = config.height / 2;
        this.CONTAINER_ID = config.container_id;
        this.RINGS = config.rings;
        this.QUADRANTS = config.quadrants;
        this.colors = config.colors;
        this.FONT = config.font;
        this.BLIP_SIZE = config.blip_size;
        this.quadrantArcData = d3.pie()(Array(config.quadrants.length).fill(1, 0, config.quadrants.length));
    }

    arcInfo(quadrant: number): PieArcDatum<unknown> {
        return this.quadrantArcData[quadrant]
    }

    radarBackground() {
        return this.colors.radar_background;
    }

    quadrantPaddingColor() {
        return this.colors.quadrant_padding;
    }

    ringBackground(rIdx: number): string {
        const ringsBackground = this.colors.rings_background;
        if (typeof ringsBackground === "string") {
            return ringsBackground;
        } else if (Array.isArray(ringsBackground)) {
            return ringsBackground[rIdx];
        } else {
            return this.envProvider.defaultRingsBGColor();
        }
    }

    blipBackground(qIdx: number): string {
        return this.colors.blips_background[qIdx]
    }
}
