import { Graphics, Loader, Point, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { ApplyTileState } from "src/utils/tile-utils";
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
        this.width = size;
        this.height = size;
        this.interactive = true;
        this.buttonMode = true;
        this.anchor.set(0.5);
        this.texture = Texture.WHITE;
    }

    public getCoords(): Point {
        return new Point(this.coords.x, this.coords.y);
    }

    public setState(state: Partial<TileState>, tileset?: Tileset): void {
        this.state = { ...this.state, ...state };
        ApplyTileState(this, this.state, this.coords, tileset);
        super.updateTransform();
    }

    public getState(): TileState | undefined {
        if (this.state.texture === "") {
            return undefined;
        } else {
            return this.state;
        }
    }

    public clear(): void {
        this.state = {
            texture: "",
            alpha: 1,
            offset: { x: 0, y: 0 },
            rotation: 0,
            tint: 0xFFFFFF
        };

        ApplyTileState(this, this.state, this.coords);
    }

    public updateTransform(): void {
        ApplyTileState(this, this.state, this.coords);

        super.updateTransform();
    }
}
