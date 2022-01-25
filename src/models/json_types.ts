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
    blips: BlipJSON[]
}

export interface BlipJSON {
    name: string;
    new: boolean;
    description: string;
}

export interface ConfigJSON {
    container_id: string
    width: number;
    height: number;
    rings: Array<string>;
}
