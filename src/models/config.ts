import {ConfigJSON} from "./json_types";

export class Config {
    private readonly config: ConfigJSON;
    public readonly WIDTH: number;
    public readonly HEIGHT: number;
    public readonly MID_X: number;
    public readonly MID_Y: number;
    public readonly CONTAINER_ID: string;
    public readonly RINGS: Array<string>;

    constructor(config: ConfigJSON) {
        this.config = config;
        this.WIDTH = config.width;
        this.HEIGHT = config.height;
        this.MID_X = config.width / 2;
        this.MID_Y = config.height / 2;
        this.CONTAINER_ID = config.container_id;
        this.RINGS = config.rings
    }
}
