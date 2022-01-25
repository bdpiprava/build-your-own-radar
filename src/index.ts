import {RendererV2} from "./renderer_v2";
import data from "./data/v2.json"
import config from "./data/config.json"
import {TechRadar} from "./models/radar";
import {Config} from "./models/config";

// new Renderer(1366).render()

new RendererV2(new Config(config)).render(new TechRadar(data))

