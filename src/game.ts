import { Application } from "pixi.js";
import { update as TweenUpdate } from "@tweenjs/tween.js";
import { LoadFonts } from "./utils/load-font";
import { Tileset } from "./components/tileset";
import { TileSelect } from "./components/tile-select";

export class Game {
    public tileset: Tileset;
    public tileSelect: TileSelect;

    public app?: Application;

    public delta: number = 0;
    private lastUpdateTime?: number;

    constructor() {
        this.tileset = new Tileset();
        this.tileSelect = new TileSelect(this.tileset);
    }

    public async init(canvas: HTMLCanvasElement): Promise<void> {
        this.app = new Application({
            view: canvas,
            autoStart: false,
            width: 1500,
            height: 1000,
            transparent: true
        });

        try {
            await LoadFonts("Roboto Condensed");
            await this.tileset.load();
            await this.tileSelect.init(this.app);
    
            this.app.render();
            canvas.style.display = "block";
            requestAnimationFrame((time) => this.render(time));
        } catch (e: any) {
            throw new Error(e);
        }
    }

    private render(time: number): void {
        this.delta = (time - (this.lastUpdateTime ?? 0)) / 1000;

        if (this.lastUpdateTime) {
            TweenUpdate(time);
            this.app?.render();
        }

        this.lastUpdateTime = time;
        requestAnimationFrame((time) => this.render(time));
    }
}
