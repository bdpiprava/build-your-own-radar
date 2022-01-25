export function translate(x: number, y: number): string {
    return `translate(${x}, ${y})`
}

export function ringRadius(ringNumber: number, totalRings: number, maxRadius: number): number {
    const sequence: Array<number> = [1, 6, 5, 3, 3, 1, 1, 1]
    const size = sequence.slice(0, ringNumber + 1).reduce((p, c) => p + c);
    const total = sequence.slice(0, totalRings + 1).reduce((p, c) => p + c);
    return (maxRadius * size) / total;
}

export function sanitize(str: string): string {
    return str.toLowerCase().replace(/[^A-Z0-9]/ig, "_")
}
