import { Container, Graphics, InteractionEvent, Texture } from "pixi.js";
import { Tile, TileState } from "./tile";
import { Tileset } from "./tileset";

export class MapLayer extends Container {
    private tiles: Tile[][];
    private highlights: Graphics[][];
    private highlightedTile?: Tile;

    constructor(width: number, height: number, tileSize: number, onTileClick: (tile: Tile) => void) {
        super();

        this.tiles = []
        this.highlights = [];
        for (let x = 0; x < width; x++) {
            this.tiles.push([]);
            this.highlights.push([]);
            for (let y = 0; y < height; y++) {
                this.highlights[x].push(new Graphics());
                this.highlights[x][y].x = x * tileSize;
                this.highlights[x][y].y = y * tileSize;
                this.highlights[x][y].lineStyle(2, 0xCC8888);
                this.highlights[x][y].drawRect(0, 0, tileSize, tileSize);
                this.highlights[x][y].visible = false;

                this.tiles[x].push(new Tile(x, y, tileSize));
                this.tiles[x][y].x = x * tileSize;
                this.tiles[x][y].y = y * tileSize;
                this.tiles[x][y].on("pointerdown", (e: InteractionEvent) => {
                    if (e.data.buttons === 1) {
                        onTileClick(this.tiles[x][y]);
                    }
                });
                this.tiles[x][y].on("pointerout", (e: InteractionEvent) => {
                    this.highlights[x][y].visible = false;
                    this.highlightedTile = undefined;
                });
                this.tiles[x][y].on("pointerover", (e: InteractionEvent) => {
                    if (e.data.buttons === 1) {
                        onTileClick(this.tiles[x][y]);
                    }
                    this.highlights[x][y].visible = true;
                    this.highlightedTile = this.tiles[x][y];
                });
                this.addChild(this.tiles[x][y]);
            }
        }

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.addChild(this.highlights[x][y]);
            }
        }
    }

    public getTile(x: number, y: number): Tile {
        return this.tiles[x][y];
    }

    public getHighlightedTile(): Tile | undefined {
        return this.highlightedTile;
    }

    public setTileStates(states: (TileState | undefined)[][], tileset?: Tileset): void {
        for (let x = 0; x < states.length; x++) {
            for (let y = 0; y < states[x].length; y++) {
                if (states[x][y]) {
                    this.tiles[x][y].setState({ ...states[x][y] }, tileset);
                }
            }
        }
    }

    public getTileStates(): TileState[][] {
        return this.tiles.map((tiles) => tiles.map((tile) => tile.getState()));
    }

    public clearLayer(): void {
        this.foreachTile((tile) => {
            tile.clear();
        });
    }

    public foreachTile(callback: (tile: Tile) => void): void {
        for (let x = 0; x < this.tiles.length; x++) {
            for (let y = 0; y < this.tiles[x].length; y++) {
                callback(this.tiles[x][y]);
            }
        }
    }
}
