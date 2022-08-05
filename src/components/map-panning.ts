import { InteractionEvent } from "pixi.js";
import { Map } from "./map";

export class MapPanning {
    private map: Map;

    private speed: number;

    private enabled: boolean;
    private panning: boolean;

    constructor(map: Map, speed: number) {
        this.map = map;

        this.speed = speed;

        this.enabled = false;
        this.panning = false;
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    public startPanning(): void {
        this.panning = this.enabled;
    };

    public stopPanning(): void {
        this.panning = false;
    };

    public pan(ev: InteractionEvent): void {
        if (this.panning && this.enabled) {
            const pointerEvent = ev.data.originalEvent as PointerEvent;
            const delta = { x: pointerEvent.movementX, y: pointerEvent.movementY };
            this.map.pan(delta.x * this.speed, delta.y * this.speed);
        } else {
            this.panning = false;
        }
    };
}
