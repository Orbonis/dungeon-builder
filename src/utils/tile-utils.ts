import { Point, Sprite, Texture } from "pixi.js";
import { Tile, TileState } from "src/components/tile";
import { Tileset } from "src/components/tileset";

export function ApplyTileState(tile: Sprite, state: TileState, tileSize: number, tileset?: Tileset): void {
    if (tileset) {
        tile.texture = (state.texture.length > 0) ? tileset.getTexture(state.texture) : Texture.WHITE;
    }

    tile.alpha = state.alpha;
    tile.angle = state.rotation;
    tile.tint = state.tint;
    tile.x = (tileSize / 2) + state.offset.x;
    tile.y = (tileSize / 2) + state.offset.y;

    if (state.texture === "") {
        tile.texture = Texture.WHITE;
        tile.alpha = 0;
    }
}