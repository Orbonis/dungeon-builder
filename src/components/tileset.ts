import { Loader, Point, Renderer, Sprite, Spritesheet, Texture } from "pixi.js";
import { ApplyTileState } from "src/utils/tile-utils";
import { TileState } from "./tile";

export class Tileset {
    private loader: Loader;
    private renderer?: Renderer;
    private spritesheet?: Spritesheet;

    constructor() {
        this.loader = new Loader();
    }

    public load(spritesheet: string | Spritesheet, renderer?: Renderer): Promise<void> {
        if (renderer) {
            this.renderer = renderer;
        }

        return new Promise((resolve, reject) => {
            if (typeof(spritesheet) === "string") {
                this.loader
                    .add(spritesheet)
                    .load(() => {
                        this.spritesheet = this.loader.resources[spritesheet].spritesheet;
                        if (this.spritesheet) {
                            resolve();
                        } else {
                            reject("Spritesheet failed to load");
                        }
                    });
            } else {
                this.spritesheet = spritesheet;
                if (this.spritesheet) {
                    resolve();
                } else {
                    reject("Spritesheet failed to load");
                }
            }
        });
    }

    public getTextureList(): string[] {
        if (this.spritesheet) {
            return Object.keys(this.spritesheet.textures);
        } else {
            throw new Error(`Attempted to get texture list without an appropriate spritesheet loaded.`);
        }
    }

    public getTexture(id: string): Texture {
        if (this.spritesheet) {
            const texture = this.spritesheet.textures[id];
            if (texture) {
                return texture;
            } else {
                throw new Error(`Texture id ${id} does not exist in the loaded spritesheet.`);
            }
        } else {
            throw new Error(`Attempted to get tile ${id} without an appropriate spritesheet loaded.`);
        }
    }

    public getTextureURL(state: TileState): string | undefined {
        const tile = new Sprite();
        ApplyTileState(tile, state, new Point(0, 0), this);
        tile.anchor.set(0.5);
        tile.x = 0;
        tile.y = 0;
        const url = this.renderer?.extract.canvas(tile).toDataURL("image/png");
        tile.destroy();
        return url;
    }
}
