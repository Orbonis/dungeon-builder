import { Point, Sprite, Texture } from "pixi.js";
import { Tileset } from "./tileset";

export interface TileState {
    texture: string;
    rotation: number;
    offset: { x: number, y: number };
    tint: number;
    alpha: number;
}
export class Tile extends Sprite {
    private state: TileState;
    private coords: Point;
    private size: number;

    constructor(x: number, y: number, size: number) {
        super();

        this.state = {
            texture: "",
            alpha: 1,
            offset: { x: 0, y: 0 },
            rotation: 0,
            tint: 0xFFFFFF
        };

        this.coords = new Point(x, y);
        this.size = size;
        this.width = size;
        this.height = size;
        this.interactive = true;
        this.buttonMode = true;
        this.anchor.set(0.5);
        this.texture = Texture.EMPTY;
    }

    public getCoords(): Point {
        return new Point(this.coords.x, this.coords.y);
    }

    public setState(state: Partial<TileState>, tileset?: Tileset): void {
        this.state = { ...this.state, ...state };
        if (tileset) {
            this.texture = (this.state.texture.length > 0) ? tileset.getTexture(this.state.texture) : Texture.EMPTY;
        }
        this.updateTransform();
    }

    public getState(): TileState {
        return this.state;
    }

    public clear(): void {
        this.state = {
            texture: "",
            alpha: 1,
            offset: { x: 0, y: 0 },
            rotation: 0,
            tint: 0xFFFFFF
        };

        this.width = this.size;
        this.height = this.size;
        this.updateTransform();
    }

    public updateTransform(): void {
        this.x = (this.coords.x * this.width) + (this.width / 2) + this.state.offset.x;
        this.y = (this.coords.y * this.height) + (this.height / 2) + this.state.offset.y;
        this.alpha = this.state.alpha;
        this.angle = this.state.rotation;
        this.tint = this.state.tint;

        super.updateTransform();
    }
}
