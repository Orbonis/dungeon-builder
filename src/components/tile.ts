import { cloneDeep } from "lodash";
import { Container, Point, Rectangle, Sprite, Text, Texture } from "pixi.js";
import { ApplyTileState } from "../utils/tile-utils";
import { Tileset } from "./tileset";

export interface TileState {
    id: string;
    texture: string;
    rotation: number;
    offset: { x: number, y: number };
    scale: number;
    tint: number;
    alpha: number;
}
export class Tile extends Container {
    public sprite: Sprite;
    public id: Text;

    private state: TileState;
    private coords: Point;
    private size: number;

    constructor(x: number, y: number, size: number, editor: boolean = false) {
        super();

        this.state = {
            id: "",
            texture: "",
            alpha: 1,
            offset: { x: 0, y: 0 },
            scale: 1,
            rotation: 0,
            tint: 0xFFFFFF
        };

        this.sprite = new Sprite();
        this.sprite.x = size / 2;
        this.sprite.y = size / 2;
        this.addChild(this.sprite);

        this.coords = new Point(x, y);
        this.size = size;

        if (editor) {
            this.interactive = true;
            this.interactiveChildren = false;
            this.buttonMode = true;
            this.hitArea = new Rectangle(0, 0, size, size);
        }

        this.sprite.width = size;
        this.sprite.height = size;
        this.sprite.anchor.set(0.5);
        this.sprite.texture = Texture.WHITE;

        this.id = new Text("", { fontSize: "14pt", fill: "#222222", stroke: "#FFFFFF", strokeThickness: 2, fontFamily: "Roboto Condensed" })
        this.id.x = 5;
        this.id.y = 95;
        this.id.anchor.set(0, 1);
        this.id.visible = false;
        this.addChild(this.id);
    }

    public getCoords(): Point {
        return new Point(this.coords.x, this.coords.y);
    }

    public setState(state: Partial<TileState>, tileset?: Tileset): void {
        this.state = cloneDeep({ ...this.state, ...state });
        this.id.text = this.state.id;
        ApplyTileState(this.sprite, this.state, this.size, tileset);
        super.updateTransform();
    }

    public getState(): TileState {
        return this.state;
    }

    public clear(): void {
        this.state = {
            id: "",
            texture: "",
            alpha: 1,
            offset: { x: 0, y: 0 },
            rotation: 0,
            scale: 1,
            tint: 0xFFFFFF
        };

        ApplyTileState(this.sprite, this.state, this.size);
        this.id.text = this.state.id;
    }

    public updateTransform(): void {
        ApplyTileState(this.sprite, this.state, this.size);

        super.updateTransform();
    }
}
