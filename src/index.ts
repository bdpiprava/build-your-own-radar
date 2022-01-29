import {RendererV2} from "./renderer_v2";
import data from "./data/v2.json"
import config from "./data/config.json"
import {Config} from "./models/config";
import {BlipJSON, QuadrantJSON, RingJSON} from "./models/json_types";
import Chance from "chance";

// new Renderer(1366).render()

data.quadrants = []
config.quadrants.forEach((q) => {
    const quad = {name: q, rings: []} as QuadrantJSON
    config.rings.forEach((r) => {
        const ring = {name: r, blips: []} as RingJSON
        for (let i = 0; i < random(2, 20); i++) {
            ring.blips.push({
                name: `Blip#${i}`,
                new: false,
                description: `This is dummy blip`
            } as BlipJSON)
        }
        quad.rings.push(ring)
    })
    data.quadrants.push(quad)
})

function random(min: number, max: number): number {
    return new Chance.Chance(new Date().toDateString()).integer({min, max})
}

new RendererV2(new Config(config)).render(data)

