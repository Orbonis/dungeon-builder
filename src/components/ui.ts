import { cloneDeep } from "lodash";
import { Application, Container, Graphics, Point, Sprite } from "pixi.js";
import { Map } from "./map";
import { TileState } from "./tile";
import { Tileset } from "./tileset"

interface TileData {
    id: string;
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
    private tiles?: TileData[];

    private state: TileState;
    
    private selectedButton?: Sprite;
    private rotateButton?: Sprite;
    private fillButton?: Sprite;

    constructor(map: Map, uiTileset: Tileset, tileset: Tileset) {
        this.map = map;

        this.tileset = tileset;
        this.uiTileset = uiTileset;

        this.state = {
            texture: "",
            rotation: 0,
            offset: new Point(0, 0),
            tint: 0xFFFFFF
        };
    }

    public async init(app: Application): Promise<void> {

        this.container = new Container();
        this.container.x = 5;
        this.container.y = 5;
        this.container.scale.set(0.95);

        this.createTileContainer(app);
        this.createSelectedButton();
        this.createRotateButton();
        this.createFillButton();

        this.update();
        app.stage.addChild(this.container);
    }

    public getState(): TileState {
        return cloneDeep(this.state);
    }

    private update(): void {
        this.tiles?.forEach((tile, i) => {
            tile.selector.visible = tile.id === this.state.texture;

            if (tile.selector.visible && this.selectedButton) {
                this.selectedButton.texture = this.tileset.getTexture(tile.id);
                this.selectedButton.height = (this.selectedButton.texture.height / this.selectedButton.texture.width) * this.selectedButton.width;
                this.selectedButton.angle = this.state.rotation;
            }
        });
    }

    private createTileContainer(app: Application): void {
        const textures = this.tileset.getTextureList();
        this.state.texture = textures[0];

        this.tileContainer = new Container();
        this.tileContainer.visible = false;
        this.container?.addChild(this.tileContainer);

        const background = new Graphics();
        background.beginFill(0xFFFFFF);
        background.drawRect(-5, -5, 1010, 1010);
        background.endFill();
        this.tileContainer.addChild(background);

        this.tiles = textures.map((id, index) => {
            const texture = this.tileset.getTexture(id);
            const sprite = new Sprite(texture);
            sprite.buttonMode = true;
            sprite.interactive = true;
            sprite.width = 100;
            sprite.height = (texture.height / texture.width) * sprite.width;

            sprite.x = (index * 100) % app.screen.width;
            sprite.y = (Math.floor((index * 100) / app.screen.width) * 100) + ((sprite.width - sprite.height) / 2);

            const outline = new Graphics();
            outline.lineStyle(4, 0x330066);
            outline.drawRect(0, 0, 100, 100);
            outline.x = sprite.x;
            outline.y = sprite.y;
            outline.visible = false;

            const selector = new Graphics();
            selector.lineStyle(4, 0x993333);
            selector.drawRect(0, 0, 100, 100);
            selector.x = sprite.x;
            selector.y = sprite.y;
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
        this.selectedButton.x = 50;
        this.selectedButton.y = 50;
        this.selectedButton.width = 80;
        this.selectedButton.height = (this.selectedButton.texture.height / this.selectedButton.texture.width) * this.selectedButton.width;
        this.selectedButton.buttonMode = true;
        this.selectedButton.interactive = true;
        this.selectedButton.angle = this.state.rotation;
        this.selectedButton.anchor.set(0.5);
        this.container?.addChildAt(this.selectedButton, 0);

        const outline = new Graphics();
        outline.lineStyle(4, 0xCCCCCC);
        outline.drawRect(0, 0, 100, 100);
        outline.x = 0;
        outline.y = 0;
        this.container?.addChildAt(outline, 0);

        this.selectedButton.on("click", () => {
            this.tileContainer!.visible = true;
        });
    }

    private createRotateButton(): void {
        this.rotateButton = new Sprite(this.uiTileset.getTexture("arrow_clockwise.png"));
        this.rotateButton.x = 150;
        this.rotateButton.y = 50;
        this.rotateButton.width = 60;
        this.rotateButton.height = (this.rotateButton.texture.height / this.rotateButton.texture.width) * this.rotateButton.width;
        this.rotateButton.buttonMode = true;
        this.rotateButton.interactive = true;
        this.rotateButton.anchor.set(0.5);
        this.rotateButton.tint = 0x222222;
        this.container?.addChildAt(this.rotateButton, 0);

        const outline = new Graphics();
        outline.lineStyle(4, 0xCCCCCC);
        outline.drawRect(0, 0, 100, 100);
        outline.x = 100;
        outline.y = 0;
        this.container?.addChildAt(outline, 0);

        this.rotateButton.on("click", () => {
            this.state.rotation += 90;
            this.update();
        });
    }

    private createFillButton(): void {
        this.fillButton = new Sprite(this.uiTileset.getTexture("timer_100.png"));
        this.fillButton.x = 250;
        this.fillButton.y = 50;
        this.fillButton.width = 60;
        this.fillButton.height = (this.fillButton.texture.height / this.fillButton.texture.width) * this.fillButton.width;
        this.fillButton.buttonMode = true;
        this.fillButton.interactive = true;
        this.fillButton.anchor.set(0.5);
        this.fillButton.tint = 0x222222;
        this.container?.addChildAt(this.fillButton, 0);

        const outline = new Graphics();
        outline.lineStyle(4, 0xCCCCCC);
        outline.drawRect(0, 0, 100, 100);
        outline.x = 200;
        outline.y = 0;
        this.container?.addChildAt(outline, 0);

        this.fillButton.on("click", () => {
            this.map.fillTiles();
        });
    }
}
