import { Application } from "pixi.js";
import { update as TweenUpdate } from "@tweenjs/tween.js";
import { LoadFonts } from "./utils/load-font";
import { Tileset } from "./components/tileset";
import { UI } from "./components/ui";
import { Map } from "./components/map";

export class Game {
    public tileset: Tileset;
    public ui: UI;
    public map: Map;

    public app?: Application;

    public delta: number = 0;
    private lastUpdateTime?: number;

    constructor() {
        this.tileset = new Tileset();
        this.map = new Map({ height: 10, width: 15 });
        this.ui = new UI(this.map, this.tileset);
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
            await this.tileset.load("assets/spritesheet.json");
            await this.ui.init(this.app, "assets/ui_sheet.json");
            await this.map.init(this.app, this.tileset);
    
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
            this.ui.update();
            TweenUpdate(time);
            this.app?.render();
        }

        this.lastUpdateTime = time;
        requestAnimationFrame((time) => this.render(time));
    }
}
