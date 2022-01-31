import {RendererV2} from "./renderer_v2";
import config from "./data/config.json"
import {Config} from "./models/config";
import {RadarJSON} from "./models/json_types";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import foo from './data/v2.yaml'

console.log(foo)
new RendererV2(new Config(config)).render(foo as RadarJSON)

