import * as d3 from "d3"
import data from "./data/v1.json"
import {QuadrantJSON, RadarJSON} from "./models/types";
import './styles.scss';

export class Renderer {
    private root: any
    private readonly radar: RadarJSON
    private readonly rings: Array<string> = ["Adopt", "Trial", "Asses", "Hold"];
    private readonly startAngle: Array<number> = [0, 90, 180, 270]
    private readonly size: number;
    private readonly maxRadius: number;

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
        const plane = this.root.append('svg')
        plane.attr("class", 'plane')
        this.radar.quadrants.forEach((q: QuadrantJSON, i: number) => {
            const qr = plane.append('g')
                .attr('class', 'quadrant')
                .attr('class', q.name.toLowerCase())
            qr.append('text').text(q.name)
            qr.attr('transform', `translate(${this.maxRadius}, ${this.maxRadius})`)

            this.rings.forEach((ring: string, ri: number) => {
                qr.append('path')
                    .attr('d', this.ringPath(i, ri))
                    .attr('class', `ring-arc-${i}`)
            })
        })
    }

    private ringPath(qidx: number, ridx: number) {
        console.log(this.ringRadius(ridx), this.ringRadius(ridx + 1))
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
        const size = 6 + this.rings.length - order;
        const total = 16;
        return (this.maxRadius * size) / total;
    }
}
