import { DisplayObject } from "pixi.js";

export function moveChildToTop(element?: DisplayObject): void {
    if (element) {
        element.parent?.addChildAt(element, element.parent.children.length);
    }
}