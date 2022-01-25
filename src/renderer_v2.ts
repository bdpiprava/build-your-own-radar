import './styles.scss';
import {TechRadar} from "./models/radar";
import * as d3 from "d3";
import {PieArcDatum, Selection} from "d3";
import {ringRadius, sanitize, translate} from "./d3helper";
import {Config} from "./models/config";
import {QuadrantJSON} from "./models/json_types";
import {Blip} from "./models/types";

type HTMLElem<T extends HTMLElement> = Selection<T, unknown, HTMLElement, any>
type SVGElem<T extends SVGGraphicsElement> = Selection<T, unknown, HTMLElement, any>


export class RendererV2 {
    private readonly c: Config;
    private readonly root: SVGElem<SVGSVGElement>;
    private readonly container: HTMLElem<HTMLDivElement>;

    constructor(config: Config) {
        this.c = config;
        this.container = d3.select('body')
            .append('div')
            .attr('class', 'page')
        this.root = this.container.append('svg').attr('class', 'plane');
    }

    render(data: TechRadar) {
        this.root
            .attr("id", this.c.CONTAINER_ID)
            .attr("width", this.c.WIDTH)
            .attr("height", this.c.HEIGHT);

        this.root
            .append("rect")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.c.WIDTH)
            .attr('height', this.c.HEIGHT)
            .attr('fill', '#eef1f3')

        const radar = this.root.append('g')
            .attr("transform", translate(this.c.MID_X, this.c.MID_Y))

        const qArcData = d3.pie()(Array(data.quadrantCount()).fill(1, 0, data.quadrantCount()));

        radar.append('ellipse')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('rx', this.c.MID_X)
            .attr('ry', this.c.MID_X)
            .attr('fill', '#fff')

        data.quadrants().forEach((q: QuadrantJSON, qi: number) => {
            this.plotQuadrant(radar, data, q, qArcData[qi])
        })
        this.plotRingTitles();

        data.blipsByQuadrants().forEach((blips: Blip[], quadrant: string) => {
            const quadrantGroup = d3.selectAll(`.${quadrant}`)
            blips.forEach((b: Blip, bi: number) => {
                const innerRadius = ringRadius(b.ring, this.c.RINGS.length, this.c.MID_X)
                const outerRadius = ringRadius(b.ring + 1, this.c.RINGS.length, this.c.MID_X)
                const x = Math.cos(Math.asin(Math.random() / innerRadius)) * innerRadius;
                const y = Math.cos(Math.asin(Math.random() / outerRadius)) * outerRadius;

                quadrantGroup.append('text')
                    .text(b.order)
                    .style("font-family", "Arial, Helvetica")
                    .style("font-size", "34px")
                    .attr("transform", translate(x, y));
            });
        })
    }

    private plotRingTitles() {
        this.c.RINGS.forEach((r: string, ri: number) => {
            const innerRadius = ringRadius(ri, this.c.RINGS.length, this.c.MID_X)
            const outerRadius = ringRadius(ri + 1, this.c.RINGS.length, this.c.MID_X)
            this.root.append('text')
                .attr('class', 'ring-title')
                .attr('y', this.c.MID_X + 5)
                .attr('x', this.c.MID_X + (innerRadius + outerRadius) / 2)
                .attr('text-anchor', 'middle')
                .text(r);

            this.root.append('text')
                .attr('class', 'ring-title')
                .attr('y', this.c.MID_X + 5)
                .attr('x', this.c.MID_X - (innerRadius + outerRadius) / 2)
                .attr('text-anchor', 'end')
                .text(r);
        })
    }

    private plotQuadrant(radar: SVGElem<SVGGElement>, data: TechRadar, quadrant: QuadrantJSON, pie: PieArcDatum<any>) {
        const quadrantGroup = radar.append('g')
            .attr('class', `quadrant ${sanitize(quadrant.name)}`)

        this.c.RINGS.forEach((r: string, ri: number) => {
            this.plotRing(ri, pie, quadrantGroup);
        });
    }

    private plotRing(order: number, pie: PieArcDatum<any>, quadrantGroup: SVGElem<SVGGElement>) {
        const arc = d3.arc()
            .innerRadius(ringRadius(order, this.c.RINGS.length, this.c.MID_X))
            .outerRadius(ringRadius(order + 1, this.c.RINGS.length, this.c.MID_X))
            .startAngle(pie.startAngle)
            .endAngle(pie.endAngle)
            .padAngle(0.08)
            .padRadius(this.c.MID_X);

        quadrantGroup.append("path")
            .attr("fill", "#fff")
            .attr("stroke", "gray")
            .attr("d", arc);
    }
}
