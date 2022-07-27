import { Point } from "pixi.js";
import { normalizePoint } from "./vector";

export class Line {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = Math.round(x1);
        this.y1 = Math.round(y1);
        this.x2 = Math.round(x2);
        this.y2 = Math.round(y2);
    }

    public length(): number {
        return Math.sqrt(
            Math.pow(this.x2 - this.x1, 2) +
            Math.pow(this.y2 - this.y1, 2)
        );
    }

    public rotation(): number {
        return Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    }

    public rotate(rotation: number): Line {
        const length: number = this.length();
        this.x2 = this.x1 + length * Math.cos(rotation);
        this.y2 = this.y1 + length * Math.sin(rotation);
        return this;
    }

    public clone(): Line {
        return new Line(this.x1, this.y1, this.x2, this.y2);
    }

    public start(): Point {
        return new Point(this.x1, this.y1);
    }

    public end(): Point {
        return new Point(this.x2, this.y2);
    }
}

export class Ray {
    public position: Point = new Point();
    public direction: Point = new Point();
    
    public look(x: number, y: number): void {
        this.direction.x = x - this.position.x;
        this.direction.y = y - this.position.y;
        normalizePoint(this.direction);
    }

    public rotate(rotation: number): void {
        this.direction.x = Math.cos(rotation);
        this.direction.y = Math.sin(rotation);
    }

    public line(length: number): Line {
        return new Line(
            this.position.x,
            this.position.y,
            this.position.x + (this.direction.x * length),
            this.position.y + (this.direction.y * length)
        );
    }

    public cast(line: Line): Point | null {
        const x1 = line.x1;
        const y1 = line.y1;
        const x2 = line.x2;
        const y2 = line.y2;

        const x3 = this.position.x;
        const y3 = this.position.y;
        const x4 = this.position.x + this.direction.x;
        const y4 = this.position.y + this.direction.y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (den !== 0) {
            let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
            let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

            t = Math.round(t * 1000000000000) / 1000000000000;
            u = Math.round(u * 1000000000000) / 1000000000000;

            if (t >= 0 && t <= 1 && u > 0) {
                return new Point(
                    x1 + t * (x2 - x1),
                    y1 + t * (y2 - y1)
                );
            }
        }

        return null;
    }
}