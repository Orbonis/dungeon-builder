import { Point, Sprite, Texture } from "pixi.js";

export class Tile extends Sprite {
    public offset: Point;

    private coords: Point;

    constructor(x: number, y: number, size: number, texture: Texture) {
        super(texture);

        this.coords = new Point(x, y);
        this.width = size;
        this.height = size;
        this.interactive = true;
        this.buttonMode = true;
        this.anchor.set(0.5);

        this.offset = new Point(0, 0);
    }

    public getCoords(): Point {
        return new Point(this.coords.x, this.coords.y);
    }

    public clear(): void {
        this.texture = Texture.EMPTY;
        this.rotation = 0;
        this.tint = 0xFFFFFF;
        this.offset = new Point(0, 0);
        this.x = this.coords.x * this.width;
        this.y = this.coords.y * this.height;
    }

    public updateTransform(): void {
        this.x = (this.coords.x * this.width) + (this.width / 2) + this.offset.x;
        this.y = (this.coords.y * this.height) + (this.height / 2) + this.offset.y;
        super.updateTransform();
    }
}
