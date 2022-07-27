import { Point } from "pixi.js";

export function normalizePoint(point: Point): void {
    const length = Math.sqrt(point.x * point.x + point.y * point.y);
    if (length === 0) {
        point.x = 0;
        point.y = 0;
    } else {
        const invScalar = 1 / length;
        point.x *= invScalar;
        point.y *= invScalar;
    }
}
