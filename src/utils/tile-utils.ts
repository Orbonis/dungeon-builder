import { Point, Sprite, Texture } from "pixi.js";
import { Tile, TileState } from "src/components/tile";
import { Tileset } from "src/components/tileset";

export function ApplyTileState(sprite: Sprite | Tile, state: TileState, coords: Point, tileset?: Tileset): void {
    if (tileset) {
        sprite.texture = (state.texture.length > 0) ? tileset.getTexture(state.texture) : Texture.WHITE;
    }
    
    sprite.x = (coords.x * sprite.width) + (sprite.width / 2) + state.offset.x;
    sprite.y = (coords.y * sprite.height) + (sprite.height / 2) + state.offset.y;
    sprite.alpha = state.alpha;
    sprite.angle = state.rotation;
    sprite.tint = state.tint;

    if (state.texture === "") {
        sprite.texture = Texture.WHITE;
        sprite.alpha = 0;
    }
}