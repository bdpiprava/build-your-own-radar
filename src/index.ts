import {RendererV2} from "./renderer_v2";
import {Config} from "./models/config";
import {ConfigJSON, RadarJSON} from "./models/json_types";
import yaml from 'js-yaml'

renderRadar('/assets/config.json', '/assets/v2.yaml')

function renderRadar(configPath: string, radarPath: string) {
    fetch(configPath)
        .then(cr => cr.json())
        .then((config: ConfigJSON) => {
            fetch(radarPath).then(async (rr) => {
                const data = (isYaml(radarPath) ? yaml.load(await rr.text()) : await rr.json()) as RadarJSON
                new RendererV2(new Config(config)).render(data)
            })
        })
}

function isYaml(radarPath: string) {
    return radarPath.toLowerCase().endsWith('.yaml') || radarPath.toLowerCase().endsWith('.yml')
}

