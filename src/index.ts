import {Renderer} from "./renderer";
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
                new Renderer(new Config(config), data).render()
            })
        })
}

function isYaml(radarPath: string) {
    return radarPath.toLowerCase().endsWith('.yaml') || radarPath.toLowerCase().endsWith('.yml')
}

