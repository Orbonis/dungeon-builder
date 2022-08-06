import { Application, Container, Graphics, Spritesheet } from "pixi.js";
import { MapLayer } from "./map-layer";
import { MapPanning } from "./map-panning";
import { Tile, TileState } from "./tile";
import { Tileset } from "./tileset";

export interface MapConfig {
    width: number;
    height: number;
    history: boolean;
}

export interface CollisionTile {
    graphic?: Graphics;
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
}

export interface IMapSaveState {
    tiles: (TileState | undefined)[][][];
    collision: CollisionTile[][];
}

export class Map {
    private app?: Application;
    private tileset?: Tileset;
    private config: MapConfig;

    private container: Container;
    private grid: Graphics;
    private layers: MapLayer[];
    private collision: CollisionTile[][];

    private mapPanning: MapPanning;

    private activeLayer: number;

    private statesHistory: IMapSaveState[] = [];

    private onTileClickCallback?: (tile: Tile) => boolean;

    constructor(config: MapConfig) {
        this.config = config;

        this.container = new Container();
        this.grid = new Graphics();
        this.layers = [];
        this.collision = [];
        this.activeLayer = 0;

        this.mapPanning = new MapPanning(this, 2);
    }

    public async init(app: Application, tileset: Tileset): Promise<void> {
        this.app = app;
        this.tileset = tileset;

        this.container.pivot.set((this.config.width * 100) / 2, (this.config.height * 100) / 2);
        this.container.x = app.screen.width / 2;
        this.container.y = app.screen.height / 2;
        this.app.stage.addChildAt(this.container, 0);

        this.grid.lineStyle(2, 0xEEEEEE);
        for (let x = 0; x < this.config.width; x++) {
            for (let y = 0; y < this.config.height; y++) {
                this.grid.drawRect(x * 100, y * 100, 100, 100);
            }
        }
        this.grid.lineStyle(2, 0xCC8888, 0.5);
        this.grid.drawRect(0, 0, this.config.width * 100, this.config.height * 100);
        this.container.addChild(this.grid);

        const layer = this.createLayer();
        this.layers.push(layer);
        this.container.addChild(layer);

        for (let x = 0; x < this.config.width; x++) {
            this.collision.push([]);
            for (let y = 0; y < this.config.height; y++) {
                const tile: CollisionTile = {
                    graphic: new Graphics(),
                    north: true,
                    south: true,
                    east: true,
                    west: true
                };
                tile.graphic!.x = (x * 100) + 50;
                tile.graphic!.y = (y * 100) + 50;
                tile.graphic!.visible = false;
                this.redrawCollisionTile(tile);
                this.collision[x].push(tile);
                this.container.addChild(tile.graphic!);
            }
        }

        this.updateHistory();

        this.container.interactive = true;
        this.container.addListener("pointerdown", () => this.mapPanning.startPanning());
        this.container.addListener("pointerup", () => this.mapPanning.stopPanning());
        this.container.addListener("pointercancel", () => this.mapPanning.stopPanning());
        this.container.addListener("pointerupoutside", () => this.mapPanning.stopPanning());
        this.container.addListener("pointermove", (e) => this.mapPanning.pan(e));
    }

    public enablePanning(enabled: boolean): void {
        this.mapPanning.setEnabled(enabled);
    }

    public pan(x: number, y: number): void {
        this.container.x += x;
        this.container.y += y;

        const calcBound = (size: number) => {
            return ((size / 2) * 100) + 5;
        };

        if (this.container.x > calcBound(this.config.width)) {
            this.container.x = calcBound(this.config.width);
        } else if (this.container.x < -calcBound(this.config.width) + (this.app?.screen.width ?? 0)) {
            this.container.x = -calcBound(this.config.width) + (this.app?.screen.width ?? 0);
        }

        if (this.container.y > calcBound(this.config.height)) {
            this.container.y = calcBound(this.config.height);
        } else if (this.container.y < -calcBound(this.config.height) + (this.app?.screen.height ?? 0)) {
            this.container.y = -calcBound(this.config.height) + (this.app?.screen.height ?? 0);
        }
    }

    public resetPan(): void {
        this.container.x = (this.app?.screen.width ?? 0) / 2;
        this.container.y = (this.app?.screen.height ?? 0) / 2;
    }

    public changeTileset(spritesheet: Spritesheet): void {
        this.tileset?.load(spritesheet);
        this.refresh();
    }

    public getTileset(): Tileset | undefined {
        return this.tileset;
    }

    public setOnTileClickCallback(callback: (tile: Tile) => boolean): void {
        this.onTileClickCallback = callback;
    }

    public setActiveLayer(index: number): void {
        this.activeLayer = Math.max(0, Math.min(this.layers.length - 1, index));
        this.layers.forEach((x, i) => {
            x.interactiveChildren = i === this.activeLayer;
            x.alpha = (i === this.activeLayer) ? 1 : 0.5;
        });
    }

    public revealMap(reveal: boolean): void {
        this.layers.forEach((x, i) => {
            x.alpha = (i === this.activeLayer || reveal) ? 1 : 0.5;
        });
    }

    public addLayerBelow(): void {
        const layer = this.createLayer();
        this.layers.splice(this.activeLayer, 0, layer);
        this.container.addChildAt(layer, this.activeLayer);
        this.container.addChildAt(this.grid, 0);
        this.setActiveLayer(this.activeLayer);
    }

    public addLayerAbove(): void {
        const layer = this.createLayer();
        if (this.activeLayer === this.layers.length - 1) {
            this.layers.push(layer);
        } else {
            this.layers.splice(this.activeLayer + 1, 0, layer);
        }
        this.activeLayer++;
        this.refreshRenderOrder();
        this.setActiveLayer(this.activeLayer);
    }

    public removeLayer(): void {
        if (this.layers.length > 1) {
            this.container.removeChild(this.layers[this.activeLayer]);
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

    public fillTiles(state: TileState): void {
        this.layers[this.activeLayer].foreachTile((tile) => {
            if (state) {
                this.setTileState(tile, state);
            }
        });
    }

    public nudgeHighlightedTile(x: number, y: number): void {
        const tile = this.layers[this.activeLayer].getHighlightedTile();
        if (tile) {
            const state = tile.getState();
            if (state) {
                state.offset.x += x;
                state.offset.y += y;
                tile.setState({ offset: state.offset });
            }
        }
    }

    public showCollisionDebug(visible: boolean): void {
        this.collision.forEach((x) => x.forEach((y) => {
            if (y.graphic) {
                y.graphic.visible = visible;
            }
        }));
    }

    public toggleCollisionOnHighlightedTile(direction: "north" | "south" | "east" | "west"): void {
        const tile = this.layers[this.activeLayer].getHighlightedTile();
        if (tile) {
            const coords = tile.getCoords();
            const collision = this.collision[coords.x][coords.y]
            collision[direction] = !collision[direction];
            this.redrawCollisionTile(collision);
            this.updateHistory();
        }
    }

    public setTileState(tile: Tile, state: Partial<TileState>): void {
        tile.setState(state, this.tileset);
    }

    public new(): void {
        this.layers.forEach((layer) => this.container.removeChild(layer));
        this.layers = [ new MapLayer(this.config.width, this.config.height, 100, (tile: Tile) => this.onTileClick(tile))];
        this.activeLayer = 0;
        this.container.addChild(this.layers[0]);
        this.container.addChildAt(this.grid, 0);
        this.setActiveLayer(this.activeLayer);
        this.resetPan();
        this.statesHistory = [];
        this.updateHistory();
        this.refreshRenderOrder();
    }

    public save(): IMapSaveState {
        const tiles = this.layers.map((layer) => layer.getTileStates());
        const collision = this.collision.map((x) => x.map((y) => ({ ...y, graphic: undefined })));
        return { tiles, collision };
    }

    public load(state: IMapSaveState): void {
        this.layers.forEach((layer) => this.container.removeChild(layer));
        this.layers = [];
        this.activeLayer = 0;
        state.tiles.forEach((state) => {
            const layer = this.createLayer();
            layer.setTileStates(state, this.tileset);
            this.layers.push(layer);
            this.container.addChild(layer);
        });
        
        for (let x = 0; x < this.config.width; x++) {
            for (let y = 0; y < this.config.height; y++) {
                this.collision[x][y] = { ...state.collision[x][y], graphic: this.collision[x][y].graphic };
                this.redrawCollisionTile(this.collision[x][y]);
            }
        }

        this.refreshRenderOrder();
        this.setActiveLayer(this.activeLayer);
    }

    public updateHistory(): void {
        if (this.config.history) {
            const state = this.save();
            this.statesHistory.push(state);
            while (this.statesHistory.length > 100) {
                this.statesHistory.shift();
            }
        }
    }

    public undo(): void {
        if (this.statesHistory.length > 1) {
            this.statesHistory.pop();
            this.load(this.statesHistory[this.statesHistory.length - 1]);
        }
    }

    public refresh(): void {
        this.load(this.save());
    }

    private createLayer(): MapLayer {
        return new MapLayer(this.config.width, this.config.height, 100, (tile: Tile) => this.onTileClick(tile));
    }

    private onTileClick(tile: Tile): void {
        if (this.onTileClickCallback) {
            const changed = this.onTileClickCallback(tile);
            if (changed) {
                this.updateHistory();
            }
        }
    }

    public redrawCollisionTile(tile: CollisionTile): void {
        tile.graphic?.clear();
        tile.graphic?.lineStyle(2, (tile.north) ? 0x00FF00 : 0xFF0000);
        tile.graphic?.beginFill((tile.north) ? 0x00FF00 : 0xFF0000);
        tile.graphic?.moveTo(-10, -45 + 10);
        tile.graphic?.lineTo(0, -45);
        tile.graphic?.lineTo(10, -45 + 10);
        tile.graphic?.lineTo(-10, -45 + 10);
        tile.graphic?.endFill();
        tile.graphic?.lineStyle(2, (tile.south) ? 0x00FF00 : 0xFF0000);
        tile.graphic?.beginFill((tile.south) ? 0x00FF00 : 0xFF0000);
        tile.graphic?.moveTo(-10, 45 - 10);
        tile.graphic?.lineTo(0, 45);
        tile.graphic?.lineTo(10, 45 - 10);
        tile.graphic?.lineTo(-10, 45 - 10);
        tile.graphic?.endFill();
        tile.graphic?.lineStyle(2, (tile.west) ? 0x00FF00 : 0xFF0000);
        tile.graphic?.beginFill((tile.west) ? 0x00FF00 : 0xFF0000);
        tile.graphic?.moveTo(-45 + 10, 10);
        tile.graphic?.lineTo(-45, 0);
        tile.graphic?.lineTo(-45 + 10, -10);
        tile.graphic?.lineTo(-45 + 10, 10);
        tile.graphic?.endFill();
        tile.graphic?.lineStyle(2, (tile.east) ? 0x00FF00 : 0xFF0000);
        tile.graphic?.beginFill((tile.east) ? 0x00FF00 : 0xFF0000);
        tile.graphic?.moveTo(45 - 10, 10);
        tile.graphic?.lineTo(45, 0);
        tile.graphic?.lineTo(45 - 10, -10);
        tile.graphic?.lineTo(45 - 10, 10);
        tile.graphic?.endFill();
    }

    private refreshRenderOrder(): void {
        this.container.addChild(this.grid);
        this.layers.forEach((layer) => this.container.addChild(layer));
        this.collision.forEach((x) => x.forEach((y) => this.container.addChild(y.graphic!)));
    }
}
