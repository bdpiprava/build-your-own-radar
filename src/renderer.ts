import * as d3 from "d3"
import data from "./data/v1.json"
import {Point, QuadrantJSON, RadarJSON} from "./models/types";
import './styles.scss';

export class Renderer {
    private root: any
    private readonly radar: RadarJSON
    private readonly rings: Array<string> = ["Adopt", "Trial", "Asses", "Hold"];
    private readonly startAngle: Array<number> = [90, 0, -90, -180]
    private readonly sequence: Array<number> = [0, 6, 5, 3, 3, 1, 1, 1]
    private readonly size: number;
    private readonly maxRadius: number;
    private readonly margin: number = 20;
    private readonly baseColor = parseInt("cccccc", 16)

    constructor(size: number) {
        this.size = size
        this.maxRadius = Math.round(this.size / 2)
        this.radar = data as RadarJSON
    }

    init() {
        this.root = d3.select('body')
            .append('div');
    }

    title(title: string): Renderer {
        document.title = title
        this.root.append("h1")
            .attr("class", "title")
            .text(title);
        return this;
    }

    logo(logoPath: string, link: string): Renderer {
        if (!link) {
            link = "#";
        }

        this.root.append("div")
            .attr('class', 'logo')
            .html(`<a href="${link}" rel="noopener noreferrer nofollow"><img src="${logoPath}" alt="logo"/></a>`);

        return this;
    }


    render() {
        this.init()
        if (!this.radar) {
            this.title("Tech Radar")
            this.root.append("text").text("Radar data is empty")
            return
        }

        this.title(this.radar.name)
            .logo("/assets/logo.png", this.radar.logo_link)
            .renderRadar()


    }

    private renderRadar() {
        const plane = this.root.append('svg');
        plane.attr("class", 'plane');
        this.renderQuadrantsBackground(plane);
        this.renderRings(plane);
        this.renderQuadrantsTitle();
        this.renderRingsTitle(plane);
        
    }

    private renderRingsTitle(plane: any) {
        this.rings.forEach((r: string, i: number) => {
            plane.append('text')
                .attr('class', 'line-text')
                .attr('y', this.maxRadius + 5)
                .attr('x', this.maxRadius + this.margin * 2 + (this.ringRadius(i) + this.ringRadius(i)) / 2)
                .attr('text-anchor', 'start')
                .text(r);

            plane.append('text')
                .attr('class', 'line-text')
                .attr('y', this.maxRadius + 5)
                .attr('x', (this.maxRadius - this.margin * 2 - (this.ringRadius(i) + this.ringRadius(i)) / 2))
                .attr('text-anchor', 'end')
                .text(r);
        });
    }

    private renderQuadrantsTitle() {
        this.radar.quadrants.forEach((q: QuadrantJSON, i: number) => {
            const qr = d3.selectAll(`.${this.sanitize(q.name.toLowerCase())}`)
            const text = qr.append('text')
            text.text(q.name)

            const pos = this.maxRadius - this.margin - 20;
            const x = pos * (i == 0 || i == 3 ? 1 : -1)
            const y = pos * (i < 2 ? -1 : 1)

            text.attr('y', y)
            text.attr('x', x)
            text.attr('style', i == 0 || i == 3 ? 'text-anchor: end;' : '')
        })
    }

    private renderRings(plane: any) {
        this.radar.quadrants.forEach((q: QuadrantJSON, i: number) => {
            const xSign = i == 0 || i == 3 ? 1 : -1
            const ySign = i < 2 ? -1 : 1

            const x = this.maxRadius + this.margin * (xSign)
            const y = this.maxRadius + this.margin * (ySign)

            const qr = plane.append('g')
                .attr('class', 'quadrant')
                .attr('class', this.sanitize(q.name.toLowerCase()))
                .attr('transform', `translate(${x}, ${y})`)

            this.rings.reverse().forEach((ring: string, ri: number) => {
                qr.append('path')
                    .attr('d', this.ringPath(i, ri))
                    .attr('class', `ring-arc-${i}`)
                    .attr('fill', `#fff`)
                    .attr('stroke', `#333`)
                    .attr('stroke-width', `2`)
            })
        })
    }

    private renderQuadrantsBackground(plane: any) {
        const pos = this.maxRadius + this.margin * 2;
        new Array<Point>(
            {x: pos, y: 0},
            {x: 0, y: 0},
            {x: 0, y: pos},
            {x: pos, y: pos},
        ).forEach((p: Point) => {
            plane.append('rect')
                .attr('x', p.x)
                .attr('y', p.y)
                .attr('width', this.maxRadius - this.margin)
                .attr('height', this.maxRadius - this.margin)
                .attr('fill', '#eef1f3')
        })
    }

    private ringPath(qidx: number, ridx: number) {
        return d3
            .arc()
            .innerRadius(this.ringRadius(ridx))
            .outerRadius(this.ringRadius(ridx + 1))
            .startAngle(Renderer.ringAngle(this.startAngle[qidx]))
            .endAngle(Renderer.ringAngle(this.startAngle[qidx] - 90))
    }

    private static ringAngle(angle: number): number {
        return (Math.PI * angle) / 180;
    }

    private ringRadius(order: number): number {
        const size = this.sequence.slice(0, order + 1).reduce((p, c) => p + c);
        const total = this.sequence.slice(0, this.rings.length + 1).reduce((p, c) => p + c);
        return ((this.maxRadius - this.margin) * size) / total;
    }

    private sanitize(str: string): string {
        return str.replace(/[^A-Z0-9]/ig, "_")
    }
}
