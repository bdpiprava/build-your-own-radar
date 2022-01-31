import './styles.scss';
import * as d3 from "d3";
import {PieArcDatum, sort} from "d3";
import {calculateHypotenuse, ringRadius, sanitize, translate} from "./d3helper";
import {Config} from "./models/config";
import {BlipJSON, QuadrantJSON, RadarJSON, RingJSON} from "./models/json_types";
import {Blip, HTMLElem, Point, SVGElem} from "./models/types";
import {PositionFinder} from "./position_finder";
import {Marked} from '@ts-stack/markdown';

export class RendererV2 {
    private readonly c: Config;
    private readonly root: SVGElem<SVGSVGElement>;
    private readonly container: HTMLElem<HTMLDivElement>;
    private readonly title: HTMLElem<HTMLDivElement>;
    private readonly positionFinder: PositionFinder;
    private readonly tooltip: HTMLElem<HTMLSpanElement>;

    constructor(config: Config) {
        this.c = config;
        this.container = RendererV2.createPage(this.c.WIDTH);
        this.title = this.container.append('div').attr('class', 'radar-title');

        this.root = this.container.append('svg').attr('class', 'plane')
            .style('font-family', this.c.FONT.family)
            .style('font-size', this.c.FONT.size);

        this.tooltip = this.container.append('div').attr("class", "tooltip");
        this.positionFinder = new PositionFinder(config);
    }

    render(data: RadarJSON) {
        this.title.text(data.name);

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

        this.c.QUADRANTS.forEach((quadrant: string, qi: number) => {
            this.plotQuadrant(radar, quadrant, this.c.arcInfo(qi))
        })

        this.plotRingTitles();
        const blips = this.prepareBlipsForRendering(data);
        this.plotBlips(blips);
        this.plotIndex(blips);
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
            .attr('class', (b: Blip) => `blip-${b.order}`)
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

    private plotQuadrant(radar: SVGElem<SVGGElement>, quadrant: string, pie: PieArcDatum<unknown>) {
        const quadrantGroup = radar.append('g')
            .attr('class', `quadrant ${sanitize(quadrant)}`)

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
            .text(quadrant);

        quadTitle.transition()
            .attr('transform', (d: Point) => {
                const x = d.x > 0 ? d.x - 20 : d.x + 20;
                const y = d.y < 0 ? d.y + quadTitle.node().getBBox().height + 10 : d.y - 20;
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

    private prepareBlipsForRendering(radar: RadarJSON): Array<Blip> {
        const blips = new Array<Blip>()

        radar.quadrants.forEach((q: QuadrantJSON) => {
            q.rings.forEach((r: RingJSON) => {
                r.blips.forEach((b: BlipJSON) => {
                    blips.push({
                        order: blips.length + 1,
                        name: b.name,
                        quadrant: this.c.quadrantIndex(q.name),
                        ring: this.c.RINGS.indexOf(r.name.toLowerCase()),
                        description: b.description,
                        point: this.positionFinder.findPointOnRing(this.c.QUADRANTS.indexOf(q.name.toLowerCase()), this.c.RINGS.indexOf(r.name.toLowerCase()))
                    })
                })
            })
        })

        const sorted = sort(blips, RendererV2.blipComparator);
        sorted.map((blip: Blip, i: number) => {
            blip.order = i + 1
        });

        return sorted;
    }

    private blipMouseOver(blip: Blip, e: MouseEvent) {
        e.stopImmediatePropagation()

        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

        this.tooltip.text(blip.name);
        const box = this.tooltip.node().getBoundingClientRect();
        const target = d3.select(`.blip-${blip.order}`) as SVGElem<SVGGraphicsElement>
        const point = this.root.node().createSVGPoint().matrixTransform(target.node().getScreenCTM());

        this.tooltip
            .transition()
            .style('top', point.y + scrollTop - box.height - 25 + 'px')
            .style('left', point.x + scrollLeft - (box.width / 2) - 2 + 'px')
            .style('opacity', 0.8)
            .style('pointer-events', 'all');
    }

    private blipMouseOut() {
        this.tooltip.style('opacity', 0)
            .style('pointer-events', 'none');
    }

    private plotIndex(blips: Array<Blip>) {
        const maxPageHeight = this.container.node().getBoundingClientRect().width * 1.4142;
        let currentPage: HTMLElem<HTMLDivElement> = this.container;
        let currentQuad = -1;
        blips.forEach((blip: Blip) => {
            const pBox = currentPage.node().getBoundingClientRect();
            if (blip.quadrant != currentQuad) {
                if (pBox.height < maxPageHeight) {
                    currentPage.append('div')
                        .attr('class', 'filler')
                        .style('height', `${maxPageHeight - (pBox.height)}px`)
                }

                currentPage = RendererV2.createPage(this.c.WIDTH);
                currentQuad = blip.quadrant;

                currentPage.append('div')
                    .attr('class', 'quad-title')
                    .style('background', this.c.blipBackground(blip.quadrant))
                    .style('color', "#fff")
                    .text(this.c.QUADRANTS[blip.quadrant]);
            }

            if (pBox.height + 80 >= maxPageHeight) {
                currentPage = RendererV2.createPage(this.c.WIDTH)
            }

            currentPage.append('div')
                .attr('class', 'blip-title')
                .text(`${blip.order}. ${blip.name}`);

            currentPage.append('div')
                .attr('class', 'sub-title')
                .style('color', this.c.blipBackground(blip.quadrant))
                .text(this.c.RINGS[blip.ring]);

            currentPage.append('div')
                .attr('class', 'blip-description')
                .html(Marked.parse(blip.description));
        });
    }

    private static blipComparator(a: Blip, b: Blip): number {
        return (a.quadrant + a.ring) - (b.quadrant + b.ring);
    }

    private static createPage(w: number, h?: number): HTMLElem<HTMLDivElement> {
        const page = d3.select('body')
            .append('div')
            .attr('class', 'page')
            .style('width', w + 'px')

        if (h != null) {
            page.style('height', h + 'px');
        }

        return page
    }
}
