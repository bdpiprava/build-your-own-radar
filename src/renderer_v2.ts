import './styles.scss';
import {TechRadar} from "./models/radar";
import * as d3 from "d3";
import {PieArcDatum} from "d3";
import {calculateHypotenuse, ringRadius, sanitize, translate} from "./d3helper";
import {Config} from "./models/config";
import {BlipJSON, QuadrantJSON, RingJSON} from "./models/json_types";
import {Blip, BlipSvgData, HTMLElem, Point, SVGElem} from "./models/types";
import {PositionFinder} from "./position_finder";
import e from "express";

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
        this.plotBlips(this.prepareBlipsForRendering(data));
    }

    private plotBlips(data: Blip[]) {

        this.root.selectAll()
            .data(data, (d: Blip) => `${d.quadrant}_${d.ring}_${d.name}`)
            .enter()
            .append('circle')
            .attr('r', this.c.BLIP_SIZE)
            .attr('fill', (blip) => this.c.blipBackground(blip.quadrant))
            .attr('class', 'blip')
            .attr('cx', this.c.MID_X)
            .attr('cy', this.c.MID_Y)
            .on('mouseover', (e, d) => this.blipMouseOver(d, e))
            .on('mouseout', this.blipMouseOut.bind(this))
            .transition()
            .attr('cx', (b: Blip) => b.point.x)
            .attr('cy', (b: Blip) => b.point.y - 4)
            .duration(500);

        this.root.selectAll()
            .data(data, (d: Blip) => `${d.quadrant}_${d.ring}_${d.name}`)
            .enter()
            .append('text')
            .text((blip: Blip) => blip.order)
            .on('mouseover', (_, d: Blip) => this.blipMouseOver.bind(this, d))
            .on('mouseout', this.blipMouseOut.bind(this))
            .attr('text-anchor', 'middle')
            .style('font-size', '80%')
            .style('font-weight', 'bold')
            .style('cursor', 'pointer')
            .attr('fill', '#fff')
            .attr('transform', (blip: Blip) => translate(blip.point.x, blip.point.y));
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

        const r = calculateHypotenuse(this.c.MID_X, this.c.MID_Y)
        const a = pie.startAngle + (0.25 * Math.PI);
        const x = r * Math.cos(a)
        const y = (r * Math.sin(a))

        const quadTitle = quadrantGroup.selectAll()
            .data([new Point(x, y)], (d) => d.toString())
            .enter()
            .append('text')
            .attr('class', 'title')
            .attr('text-anchor', (d) => d.x < 0 ? 'start' : 'end')
            .text(quadrant.name);

        quadTitle.transition()
            .attr('transform', (d: Point) => {
                const x = d.x > 0 ? d.x - 10 : d.x + 10;
                const y = d.y < 0 ? d.y + quadTitle.node().getBBox().height + 5 : d.y - 10;
                return translate(x, y);
            });


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

    private prepareBlipsForRendering(radar: TechRadar): Array<Blip> {
        const blips = new Array<Blip>()
        radar.quadrants().forEach((q: QuadrantJSON) => {
            q.rings.forEach((r: RingJSON) => {
                r.blips.forEach((b: BlipJSON) => {
                    blips.push({
                        order: blips.length + 1,
                        name: b.name,
                        quadrant: this.c.QUADRANTS.indexOf(q.name),
                        ring: this.c.RINGS.indexOf(r.name),
                        description: b.description,
                        point: this.positionFinder.findPointOnRing(this.c.QUADRANTS.indexOf(q.name), this.c.RINGS.indexOf(r.name))
                    })
                })
            })
        })
        return blips;
    }

    private blipMouseOver(blip: Blip, e: MouseEvent) {
        e.stopImmediatePropagation()
        this.tooltip.text(blip.name);
        const box = this.tooltip.node().getBoundingClientRect();
        this.tooltip
            .transition()
            .style("top", blip.point.y - box.height - 25 + "px")
            .style("left", blip.point.x + (box.width / 2) + "px")
            .style('opacity', 0.8);
    }

    private blipMouseOut() {
        this.tooltip.style('opacity', 0)
    }
}
