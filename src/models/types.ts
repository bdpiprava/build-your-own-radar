export interface RadarJSON {
    date: string;
    name: string;
    author: string;
    logo_link: string;
    quadrants: QuadrantJSON[];
}

export interface QuadrantJSON {
    name: string;
    adopt: BlipJSON[];
}

export interface BlipJSON {
    name: string;
    new: boolean;
    description: string;
}
