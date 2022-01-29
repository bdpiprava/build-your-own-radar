import './styles.scss';
import {TechRadar} from "./models/radar";
import * as d3 from "d3";
import {PieArcDatum} from "d3";
import {ringRadius, sanitize, translate} from "./d3helper";
import {Config} from "./models/config";
import {BlipJSON, QuadrantJSON, RingJSON} from "./models/json_types";
import {Blip, BlipSvgData, HTMLElem, SVGElem} from "./models/types";
import {PositionFinder} from "./position_finder";

export class RendererV2 {
    private readonly c: Config;
    private readonly root: SVGElem<SVGSVGElement>;
    private readonly container: HTMLElem<HTMLDivElement>;
    private readonly positionFinder: PositionFinder;
    private readonly tooltip: HTMLElem<HTMLSpanElement>;

    constructor(config: Config) {
        this.c = config;
        this.container = d3.select('body')
            .append('div')
            .attr('class', 'page')

        this.root = this.container.append('svg').attr('class', 'plane')
            .style('font-family', this.c.FONT.family)
            .style('font-size', this.c.FONT.size);

        this.tooltip = this.container.append("div").attr("class", "tooltip");

        this.positionFinder = new PositionFinder(config)
    }

    render(data: TechRadar) {
        this.root
            .attr('id', this.c.CONTAINER_ID)
            .attr('width', this.c.WIDTH)
            .attr('height', this.c.HEIGHT);

        this.root
            .append("rect")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.c.WIDTH)
            .attr('height', this.c.HEIGHT)
            .attr('fill', this.c.radarBackground())

        const radar = this.root.append('g')
            .attr('transform', translate(this.c.MID_X, this.c.MID_Y))

        radar.append('ellipse')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('rx', this.c.MID_X)
            .attr('ry', this.c.MID_X)
            .attr('fill', this.c.quadrantPaddingColor())

        data.quadrants().forEach((q: QuadrantJSON, qi: number) => {
            this.plotQuadrant(radar, q, this.c.arcInfo(qi))
        })
        this.plotRingTitles();

        this.blipsByQuadrants(data).forEach((blips: Blip[]) => {
            blips.forEach((b: Blip) => {
                this.plotBlip(b);
            });
        })
    }

    private plotBlip(blip: Blip) {
        const point = this.positionFinder.findPointOnRing(blip.quadrant, blip.ring)
        const data = [{point, blip}]

        this.root.selectAll()
            .data(data, (d: BlipSvgData) => {
                return `${d.blip.quadrant}_${d.blip.ring}_${d.blip.name}`;
            })
            .enter()
            .append('circle')
            .attr('cx', point.x)
            .attr('cy', point.y - 4)
            .attr('r', this.c.BLIP_SIZE)
            .attr('fill', this.c.blipBackground(blip.quadrant))
            .attr('class', 'blip')
            .on('mouseover', (e: MouseEvent, d) => {
                this.tooltip.text(d.blip.name);
                const box = this.tooltip.node().getBoundingClientRect();
                this.tooltip
                    .transition()
                    .duration(200)
                    .style("top", d.point.y - box.height - 16 + "px")
                    .style("left", d.point.x + (box.width / 2) + 4 + "px")
                    .style('opacity', 0.8);
            });

        this.root.append('text')
            .text(blip.order)
            .attr('text-anchor', 'middle')
            .style('font-size', '80%')
            .style('font-weight', 'bold')
            .style('cursor', 'pointer')
            .attr('fill', '#fff')
            .attr('transform', translate(point.x, point.y));
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

    private plotQuadrant(radar: SVGElem<SVGGElement>, quadrant: QuadrantJSON, pie: PieArcDatum<unknown>) {
        const quadrantGroup = radar.append('g')
            .attr('class', `quadrant ${sanitize(quadrant.name)}`)

        //TODO: align coordinates
        quadrantGroup.append('text')
            .text(quadrant.name)
            .attr('transform', translate(1, 1))

        this.c.RINGS.forEach((r: string, ri: number) => {
            this.plotRing(ri, pie, quadrantGroup);
        });
    }

    private plotRing(order: number, pie: PieArcDatum<unknown>, quadrantGroup: SVGElem<SVGGElement>) {
        const arc = d3.arc()
            .innerRadius(ringRadius(order, this.c.RINGS.length, this.c.MID_X))
            .outerRadius(ringRadius(order + 1, this.c.RINGS.length, this.c.MID_X))
            .startAngle(pie.startAngle)
            .endAngle(pie.endAngle)
            .padAngle(0.05)
            .padRadius(this.c.MID_X);

        quadrantGroup.append('path')
            .attr('fill', this.c.ringBackground(order))
            .attr('stroke', 'gray')
            .attr('class', `ring-${order}`)
            .attr('d', arc);
    }

    private blipsByQuadrants(radar: TechRadar): Map<string, Array<Blip>> {
        const groupedByQuadrants = new Map<string, Array<Blip>>()
        let blipCount = 0;
        radar.quadrants().forEach((q: QuadrantJSON) => {
            const blips = new Array<Blip>()
            q.rings.forEach((r: RingJSON) => {
                r.blips.forEach((b: BlipJSON) => {
                    blips.push({
                        order: blipCount++,
                        name: b.name,
                        quadrant: this.c.QUADRANTS.indexOf(q.name),
                        ring: this.c.RINGS.indexOf(r.name),
                        description: b.description
                    })
                })
            })
            groupedByQuadrants.set(sanitize(q.name), blips)
        })
        return groupedByQuadrants;
    }
}
