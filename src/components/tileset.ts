import { Loader, Spritesheet, Texture } from "pixi.js";
import { Tile } from "./tile";

export class Tileset {
    private loader: Loader;
    private spritesheet?: Spritesheet;

    constructor() {
        this.loader = new Loader();
    }

    public load(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loader
                .add("assets/spritesheet.json")
                .load(() => {
                    this.spritesheet = this.loader.resources["assets/spritesheet.json"].spritesheet;
                    if (this.spritesheet) {
                        resolve();
                    } else {
                        reject("Spritesheet failed to load");
                    }
                });
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

    public getTile(id: string): Tile {
        return new Tile(this.getTexture(id));
    }
}
