import { cloneDeep } from "lodash";
import { Application, Container, Graphics, Point, Sprite, Text, Texture } from "pixi.js";
import { Map } from "./map";
import { TileState } from "./tile";
import { Tileset } from "./tileset"
import { color, interpolateHsl, interpolateRgb } from "d3";

interface OptionData {
    id: string | number;
    sprite: Sprite;
    outline: Graphics;
    selector: Graphics;
}

export class UI {

    private map: Map;

    private uiTileset: Tileset;
    private tileset: Tileset;
    private container?: Container;

    private tileContainer?: Container;
    private tiles?: OptionData[];

    private colourContainer?: Container;
    private colours?: OptionData[];

    private alphaContainer?: Container;
    private alphas?: OptionData[];

    private state: TileState;
    
    private selectedButton?: Sprite;
    private rotateButton?: Sprite;
    private tintButton?: Sprite;
    private alphaButton?: Sprite;

    private layerUIContainer?: Container;
    private currentLayerLabel?: Text;
    private previousLayerButton?: Sprite;
    private nextLayerButton?: Sprite;
    private addLayerButton?: Sprite;
    private removeLayerButton?: Sprite;
    private clearLayerButton?: Sprite;
    private fillLayerButton?: Sprite;

    constructor(map: Map, tileset: Tileset) {
        this.map = map;

        this.tileset = tileset;
        this.uiTileset = new Tileset();

        this.state = {
            texture: "",
            rotation: 0,
            offset: new Point(0, 0),
            tint: 0xFFFFFF,
            alpha: 1
        };
    }

    public async init(app: Application): Promise<void> {

        const border = new Graphics();
        border.lineStyle(1, 0x000000, 0.2);
        border.drawRect(1, 0, app.screen.width - 1, app.screen.height - 1);
        app.stage.addChild(border);

        this.container = new Container();
        this.container.x = 5;
        this.container.y = 5;
        this.container.scale.set(0.95);

        this.createTileContainer(app);
        this.createColourContainer(app);
        this.createAlphaContainer(app);
        this.createSelectedButton();
        this.createRotateButton();
        this.createTintButton();
        this.createAlphaButton();
        this.createLayerButtons();

        app.stage.addChild(this.container);
    }

    public getState(): TileState {
        return cloneDeep(this.state);
    }

    public update(): void {
        this.tiles?.forEach((tile, i) => {
            tile.selector.visible = tile.id === this.state.texture;
            tile.sprite.tint = this.state.tint;
            tile.sprite.angle = this.state.rotation;

            if (tile.selector.visible && this.selectedButton) {
                const textureID: string = tile.id as string;
                this.selectedButton.texture = (textureID.length > 0) ? this.tileset.getTexture(textureID) : this.uiTileset.getTexture("cross.png");
                this.selectedButton.height = (this.selectedButton.texture.height / this.selectedButton.texture.width) * this.selectedButton.width;
                this.selectedButton.angle = this.state.rotation;
                this.selectedButton.tint = this.state.tint;
            }
        });

        if (this.currentLayerLabel) {
            this.currentLayerLabel.text = `Current Layer: ${this.map.getActiveLayer()}`;
        }

        if (this.tintButton) {
            const texture = (this.state.tint === 0xFFFFFF) ? "timer_0.png" : "timer_100.png";
            this.tintButton.texture = this.uiTileset.getTexture(texture);
            this.tintButton.tint = (this.state.tint === 0xFFFFFF) ? 0x000000: this.state.tint;
        }

        if (this.alphaButton) {
            this.alphaButton.alpha = this.state.alpha;
        }
    }

    public loadUITileset(path: string): Promise<void> {
        return this.uiTileset.load(path);
    }

    private createColourContainer(app: Application): void {
        const colours: number[] = [
            ...this.getColourRange("#FFFFFF", "#000000", 15),
            ...this.getColourRange("#FF0000", "#FFFF00", 10),
            ...this.getColourRange("#FFFF00", "#00FF00", 10),
            ...this.getColourRange("#00FF00", "#00FFFF", 10),
            ...this.getColourRange("#00FFFF", "#0000FF", 10),
            ...this.getColourRange("#0000FF", "#FF00FF", 10),
            ...this.getColourRange("#FF00FF", "#FF0000", 10)
        ];
        this.colourContainer = new Container();
        this.colourContainer.visible = false;
        this.container?.addChild(this.colourContainer);

        const background = new Graphics();
        background.beginFill(0xFFFFFF);
        background.drawRect(-5, -5, 1510, 1010);
        background.endFill();
        this.colourContainer.addChild(background);

        this.colours = colours.map((id, index) => {
            const texture = this.uiTileset.getTexture((id === 0xFFFFFF) ? "timer_0.png" : "timer_100.png");
            const sprite = new Sprite(texture);
            sprite.buttonMode = true;
            sprite.interactive = true;
            sprite.width = 60;
            sprite.height = (texture.height / texture.width) * sprite.width;
            sprite.anchor.set(0.5);
            sprite.tint = (id === 0xFFFFFF) ? 0x000000: id;

            sprite.x = ((index * 100) % app.screen.width) + (sprite.width / 2);
            sprite.y = (Math.floor((index * 100) / app.screen.width) * 100) + ((sprite.width - sprite.height) / 2) + (sprite.height / 2);

            const outline = new Graphics();
            outline.lineStyle(4, 0x330066);
            outline.drawRect(0, 0, 100, 100);
            outline.x = ((index * 100) % app.screen.width);
            outline.y = (Math.floor((index * 100) / app.screen.width) * 100);
            outline.visible = false;

            const selector = new Graphics();
            selector.lineStyle(4, 0x993333);
            selector.drawRect(0, 0, 100, 100);
            selector.x = ((index * 100) % app.screen.width);
            selector.y = (Math.floor((index * 100) / app.screen.width) * 100);
            selector.visible = false;

            this.colourContainer?.addChild(sprite, outline, selector);

            sprite.on("pointerover", () => {
                this.tiles?.forEach((tile, i) => {
                    tile.outline.visible = i === index;
                });
            });

            sprite.on("click", () => {
                this.state.tint = id;
                this.update();
                this.colourContainer!.visible = false;
            });

            return { id, sprite, outline, selector, selected: index === 0 };
        });
    }

    private createAlphaContainer(app: Application): void {
        const alphas: number[] = [ 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1 ];
        this.alphaContainer = new Container();
        this.alphaContainer.visible = false;
        this.container?.addChild(this.alphaContainer);

        const background = new Graphics();
        background.beginFill(0xFFFFFF);
        background.drawRect(-5, -5, 1510, 1010);
        background.endFill();
        this.alphaContainer.addChild(background);

        this.alphas = alphas.map((id, index) => {
            const texture = this.uiTileset.getTexture("timer_100.png");
            const sprite = new Sprite(texture);
            sprite.buttonMode = true;
            sprite.interactive = true;
            sprite.width = 60;
            sprite.height = (texture.height / texture.width) * sprite.width;
            sprite.anchor.set(0.5);
            sprite.tint = 0x000000;
            sprite.alpha = id;

            sprite.x = ((index * 100) % app.screen.width) + (sprite.width / 2);
            sprite.y = (Math.floor((index * 100) / app.screen.width) * 100) + ((sprite.width - sprite.height) / 2) + (sprite.height / 2);

            const outline = new Graphics();
            outline.lineStyle(4, 0x330066);
            outline.drawRect(0, 0, 100, 100);
            outline.x = ((index * 100) % app.screen.width);
            outline.y = (Math.floor((index * 100) / app.screen.width) * 100);
            outline.visible = false;

            const selector = new Graphics();
            selector.lineStyle(4, 0x993333);
            selector.drawRect(0, 0, 100, 100);
            selector.x = ((index * 100) % app.screen.width);
            selector.y = (Math.floor((index * 100) / app.screen.width) * 100);
            selector.visible = false;

            this.alphaContainer?.addChild(sprite, outline, selector);

            sprite.on("pointerover", () => {
                this.tiles?.forEach((tile, i) => {
                    tile.outline.visible = i === index;
                });
            });

            sprite.on("click", () => {
                this.state.alpha = id;
                this.update();
                this.alphaContainer!.visible = false;
            });

            return { id, sprite, outline, selector, selected: index === 0 };
        });
    }

    private createTileContainer(app: Application): void {
        const textures = [ "", ...this.tileset.getTextureList() ];
        this.state.texture = textures[1];

        this.tileContainer = new Container();
        this.tileContainer.visible = false;
        this.container?.addChild(this.tileContainer);

        const background = new Graphics();
        background.beginFill(0xFFFFFF);
        background.drawRect(-5, -5, 1510, 1010);
        background.endFill();
        this.tileContainer.addChild(background);

        this.tiles = textures.map((id, index) => {
            const texture = (id.length > 0) ? this.tileset.getTexture(id) : this.uiTileset.getTexture("cross.png");
            const sprite = new Sprite(texture);
            sprite.buttonMode = true;
            sprite.interactive = true;
            sprite.width = 100;
            sprite.height = (texture.height / texture.width) * sprite.width;
            sprite.anchor.set(0.5);

            sprite.x = ((index * 100) % app.screen.width) + (sprite.width / 2);
            sprite.y = (Math.floor((index * 100) / app.screen.width) * 100) + ((sprite.width - sprite.height) / 2) + (sprite.height / 2);

            const outline = new Graphics();
            outline.lineStyle(4, 0x330066);
            outline.drawRect(0, 0, 100, 100);
            outline.x = ((index * 100) % app.screen.width);
            outline.y = (Math.floor((index * 100) / app.screen.width) * 100);
            outline.visible = false;

            const selector = new Graphics();
            selector.lineStyle(4, 0x993333);
            selector.drawRect(0, 0, 100, 100);
            selector.x = ((index * 100) % app.screen.width);
            selector.y = (Math.floor((index * 100) / app.screen.width) * 100);
            selector.visible = false;

            this.tileContainer?.addChild(sprite, outline, selector);

            sprite.on("pointerover", () => {
                this.tiles?.forEach((tile, i) => {
                    tile.outline.visible = i === index;
                });
            });

            sprite.on("click", () => {
                this.state.texture = id;
                this.update();
                this.tileContainer!.visible = false;
            });

            return { id, sprite, outline, selector, selected: index === 0 };
        });
    }

    private createSelectedButton(): void {
        this.selectedButton = new Sprite(this.tileset.getTexture(this.state.texture));
        this.setupButton(this.selectedButton, 100, 60, new Point(0, 40), this.container!);
        this.container?.addChildAt(this.selectedButton, 0);

        this.selectedButton.on("click", () => {
            this.tileContainer!.visible = true;
            this.container?.addChild(this.tileContainer!);
        });
    }

    private createRotateButton(): void {
        this.rotateButton = new Sprite(this.uiTileset.getTexture("arrow_clockwise.png"));
        this.setupButton(this.rotateButton, 100, 60, new Point(100, 40), this.container!);
        this.container?.addChildAt(this.rotateButton, 0);

        this.rotateButton.on("click", () => {
            this.state.rotation += 90;
            this.update();
        });
    }

    private createTintButton(): void {
        this.tintButton = new Sprite(this.uiTileset.getTexture("timer_0.png"));
        this.setupButton(this.tintButton, 100, 60, new Point(200, 40), this.container!);
        this.container?.addChildAt(this.tintButton, 0);

        this.tintButton.on("click", () => {
            this.colourContainer!.visible = true;
            this.container?.addChild(this.colourContainer!);
        });
    }

    private createAlphaButton(): void {
        this.alphaButton = new Sprite(this.uiTileset.getTexture("timer_100.png"));
        this.setupButton(this.alphaButton, 100, 60, new Point(300, 40), this.container!);
        this.container?.addChildAt(this.alphaButton, 0);

        this.alphaButton.on("click", () => {
            this.alphaContainer!.visible = true;
            this.container?.addChild(this.alphaContainer!);
        });
    }

    private createLayerButtons(): void {
        this.layerUIContainer = new Container();
        this.layerUIContainer.x = 450;
        this.container?.addChild(this.layerUIContainer);

        this.currentLayerLabel = new Text("Current Layer: 0", {});
        this.layerUIContainer.addChild(this.currentLayerLabel);

        this.previousLayerButton = new Sprite(this.uiTileset.getTexture("arrow_right.png"));
        this.setupButton(this.previousLayerButton, 100, 60, new Point(0, 40), this.layerUIContainer);
        this.previousLayerButton.angle = 180;
        this.previousLayerButton.on("click", () => this.map.previousLayer());

        this.nextLayerButton = new Sprite(this.uiTileset.getTexture("arrow_right.png"));
        this.setupButton(this.nextLayerButton, 100, 60, new Point(100, 40), this.layerUIContainer);
        this.nextLayerButton.on("click", () => this.map.nextLayer());

        this.addLayerButton = new Sprite(this.uiTileset.getTexture("plus.png"));
        this.setupButton(this.addLayerButton, 100, 60, new Point(200, 40), this.layerUIContainer);
        this.addLayerButton.on("click", () => this.map.addLayerAbove());
        this.removeLayerButton = new Sprite(this.uiTileset.getTexture("minus.png"));
        this.setupButton(this.removeLayerButton, 100, 60, new Point(300, 40), this.layerUIContainer);
        this.removeLayerButton.on("click", () => this.map.removeLayer());
        this.clearLayerButton = new Sprite(this.uiTileset.getTexture("d6_outline.png"));
        this.setupButton(this.clearLayerButton, 100, 60, new Point(400, 40), this.layerUIContainer);
        this.clearLayerButton.on("click", () => this.map.clearLayer());
        this.fillLayerButton = new Sprite(this.uiTileset.getTexture("d6.png"));
        this.setupButton(this.fillLayerButton, 100, 60, new Point(500, 40), this.layerUIContainer);
        this.fillLayerButton.on("click", () => this.map.fillTiles());
    }

    private setupButton(button: Sprite, size: number, iconSize: number, offset: Point, parent: Container): void {
        button.x = (size / 2) + offset.x;
        button.y = (size / 2) + offset.y;
        button.width = iconSize;
        button.height = (button.texture.height / button.texture.width) * button.width;
        button.buttonMode = true;
        button.interactive = true;
        button.anchor.set(0.5);
        button.tint = 0x222222;
        parent.addChild(button);

        const outline = new Graphics();
        outline.lineStyle(4, 0xCCCCCC);
        outline.drawRect(0, 0, size, size);
        outline.x = button.x - (size / 2);
        outline.y = button.y - (size / 2);
        parent.addChild(outline);
    }

    private getColourRange(start: string, end: string, count: number): number[] {
        const colourInterpolator = interpolateRgb(color(start)!.formatRgb(), color(end)!.formatRgb());
        return new Array(count).fill(0).map((x, i) => Number(color(colourInterpolator(i / (count - 1)))!.formatHex().replace("#", "0x")));
    }
}
