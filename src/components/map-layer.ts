import { Container, InteractionEvent, Texture } from "pixi.js";
import { Tile, TileState } from "./tile";
import { Tileset } from "./tileset";

export class MapLayer extends Container {
    private tiles: Tile[][];

    constructor(width: number, height: number, tileSize: number, onTileClick: (tile: Tile) => void) {
        super();

        this.tiles = []
        for (let x = 0; x < width; x++) {
            this.tiles.push([]);
            for (let y = 0; y < height; y++) {
                this.tiles[x].push(new Tile(x, y, tileSize));
                this.tiles[x][y].on("pointerdown", (e: InteractionEvent) => {
                    if (e.data.buttons === 1) {
                        onTileClick(this.tiles[x][y]);
                    }
                });
                this.tiles[x][y].on("pointerover", (e: InteractionEvent) => {
                    if (e.data.buttons === 1) {
                        onTileClick(this.tiles[x][y]);
                    }
                });
                this.addChild(this.tiles[x][y]);
            }
        }
    }

    public getTile(x: number, y: number): Tile {
        return this.tiles[x][y];
    }

    public setTileStates(states: TileState[][], tileset?: Tileset): void {
        for (let x = 0; x < states.length; x++) {
            for (let y = 0; y < states[x].length; y++) {
                this.tiles[x][y].setState({ ...states[x][y] }, tileset);
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
