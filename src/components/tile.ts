import { cloneDeep } from "lodash";
import { Container, Graphics, Point, Rectangle, Sprite, Texture } from "pixi.js";
import { ApplyTileState } from "src/utils/tile-utils";
import { Tileset } from "./tileset";

export interface TileState {
    texture: string;
    rotation: number;
    offset: { x: number, y: number };
    tint: number;
    alpha: number;
}
export class Tile extends Container {
    public sprite: Sprite;

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

        this.sprite = new Sprite();
        this.sprite.x = 50;
        this.sprite.y = 50;
        this.addChild(this.sprite);

        this.coords = new Point(x, y);
        this.size = size;

        this.interactive = true;
        this.interactiveChildren = false;
        this.buttonMode = true;
        this.hitArea = new Rectangle(0, 0, 100, 100);

        this.sprite.width = size;
        this.sprite.height = size;
        this.sprite.anchor.set(0.5);
        this.sprite.texture = Texture.WHITE;
    }

    public getCoords(): Point {
        return new Point(this.coords.x, this.coords.y);
    }

    public setState(state: Partial<TileState>, tileset?: Tileset): void {
        this.state = cloneDeep({ ...this.state, ...state });
        ApplyTileState(this.sprite, this.state, this.size, tileset);
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

        ApplyTileState(this.sprite, this.state, this.size);
    }

    public updateTransform(): void {
        ApplyTileState(this.sprite, this.state, this.size);

        super.updateTransform();
    }
}
