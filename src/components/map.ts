import { Application, Container, Graphics, Texture } from "pixi.js";
import { MapLayer } from "./map-layer";
import { Tile, TileState } from "./tile";
import { Tileset } from "./tileset";
import { UI } from "./ui";

export interface MapConfig {
    width: number;
    height: number;
}

export class Map {
    private app?: Application;
    private ui?: UI;
    private tileset?: Tileset;
    private config: MapConfig;

    private container: Container;
    private grid: Graphics;
    private layers: MapLayer[];

    private activeLayer: number;

    constructor(config: MapConfig) {
        this.config = config;

        this.container = new Container();
        this.grid = new Graphics();
        this.layers = [];
        this.activeLayer = 0;
    }

    public async init(app: Application, ui: UI, tileset: Tileset): Promise<void> {
        this.app = app;
        this.ui = ui;
        this.tileset = tileset;

        this.container.scale.set(0.8);
        this.container.x = 8;
        this.container.y = 150;
        this.app.stage.addChildAt(this.container, 0);

        this.grid.lineStyle(2, 0xEEEEEE);
        for (let x = 0; x < this.config.width; x++) {
            for (let y = 0; y < this.config.height; y++) {
                this.grid.drawRect(x * 100, y * 100, 100, 100);
            }
        }
        this.container.addChild(this.grid);

        this.layers = [ new MapLayer(this.config.width, this.config.height, 100, (tile: Tile) => this.onTileClick(tile))];
        this.activeLayer = 0;
        this.container.addChildAt(this.layers[0], 0);
    }

    public setActiveLayer(index: number): void {
        this.activeLayer = Math.max(0, Math.min(this.layers.length - 1, index));
        this.layers.forEach((x, i) => {
            x.interactiveChildren = i === this.activeLayer;
            x.alpha = (i === this.activeLayer) ? 1 : 0.5;
        });
    }

    public addLayerBelow(): void {
        const layer = this.createLayer();
        this.layers.splice(this.activeLayer, 0, layer);
        this.container.addChildAt(layer, this.activeLayer);
        this.container.addChild(this.grid);
        this.setActiveLayer(this.activeLayer);
    }

    public addLayerAbove(): void {
        const layer = this.createLayer();
        this.activeLayer++;
        this.layers.splice(this.activeLayer, 0, layer);
        this.container.addChildAt(layer, this.activeLayer);
        this.container.addChild(this.grid);
        this.setActiveLayer(this.activeLayer);
    }

    public removeLayer(): void {
        if (this.layers.length > 1) {
            this.layers.splice(this.activeLayer, 1);
            this.setActiveLayer(this.activeLayer - 1);
        }
    }

    public getActiveLayer(): number {
        return this.activeLayer;
    }

    public nextLayer(): void {
        this.setActiveLayer(this.activeLayer + 1);
    }

    public previousLayer(): void {
        this.setActiveLayer(this.activeLayer - 1);
    }

    public getLayerCount(): number {
        return this.layers.length;
    }

    public clearLayer(): void {
        this.layers[this.activeLayer].clearLayer();
    }

    public fillTiles(): void {
        const state = this.ui?.getState();
        this.layers[this.activeLayer].foreachTile((tile) => {
            if (state) {
                this.setTileState(tile, state);
            }
        });
    }

    private createLayer(): MapLayer {
        return new MapLayer(this.config.width, this.config.height, 100, (tile: Tile) => this.onTileClick(tile));
    }

    private onTileClick(tile: Tile): void {
        const state = this.ui?.getState();
        if (state) {
            this.setTileState(tile, state);
        }
    }

    private setTileState(tile: Tile, state: TileState): void {
        tile.texture = (state.texture.length > 0) ? this.tileset?.getTexture(state.texture) ?? Texture.WHITE : Texture.EMPTY;
        tile.angle = state.rotation;
        tile.tint = state.tint;
        tile.offset.set(state.offset.x, state.offset.y);
    }
}
