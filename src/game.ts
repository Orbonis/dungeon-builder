import { Application, Container, Loader } from "pixi.js";
import { update as TweenUpdate } from "@tweenjs/tween.js";
import { LoadFonts } from "./utils/load-font";
import { Tileset } from "./components/tileset";
import { Map } from "./components/map";

export class Game {
    public tileset: Tileset;
    public map: Map;

    public app?: Application;

    public delta: number = 0;
    private lastUpdateTime?: number;

    constructor() {
        this.tileset = new Tileset();
        this.map = new Map({ height: 5, width: 5, history: true });
    }

    public async init(canvas: HTMLCanvasElement, width: number, height: number): Promise<Map> {
        this.app = new Application({
            view: canvas,
            autoStart: false,
            width,
            height,
            transparent: true
        });

        try {
            (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
        } catch (e: any) {}

        try {
            await LoadFonts("Roboto Condensed");
            await this.tileset.load("assets/spritesheet.json", this.app.renderer);
            await this.map.init(this.app, this.tileset);
    
            this.app.render();
            canvas.style.display = "block";
            requestAnimationFrame((time) => this.render(time));

            return this.map;
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
