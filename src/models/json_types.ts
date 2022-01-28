export interface RadarJSON {
    date: string;
    name: string;
    author: string;
    logo_link: string;
    quadrants: QuadrantJSON[];
}

export interface QuadrantJSON {
    name: string;
    rings: RingJSON[];
}

export interface RingJSON {
    name: string
    blips: BlipJSON[]
}

export interface BlipJSON {
    name: string;
    new: boolean;
    description: string;
}

export interface ColorJSON {
    radar_background: string;
    rings_background: string | Array<string>;
    quadrant_padding: string;
    blips_background: Array<string>
}

export interface FontJSON {
    family: string;
    size: string;
}

export interface ConfigJSON {
    container_id: string
    width: number;
    height: number;
    rings: Array<string>;
    quadrants: Array<string>;
    colors: ColorJSON;
    font: FontJSON;
    blip_size: number;
}
