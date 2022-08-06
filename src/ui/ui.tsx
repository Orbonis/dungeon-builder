import React from "react";
import { Container, Dropdown, Grid, Icon, Image, Input, Menu, Modal, SemanticICONS } from "semantic-ui-react";
import { Map } from "src/components/map";
import { saveAs } from "file-saver";
import fileDialog from "file-dialog";
import { Spritesheet, Texture } from "pixi.js";
import { Tile, TileState } from "src/components/tile";

enum InteractionMode {
    Normal = 0,
    Delete,
    Collision,
    Pan
}

interface IProperties {
    map?: Map;
}

interface IState {
    tileSelector: boolean;
    tileState: TileState;
    mode: InteractionMode;
    lastMode: InteractionMode;
}

interface IInputState {
    leftMouseDown: boolean;
    rightMouseDown: boolean;
    offsetChanged: boolean;
}

export class UI extends React.Component<IProperties, IState> {
    private inputState: IInputState = {
        leftMouseDown: false,
        rightMouseDown: false,
        offsetChanged: false
    };

    constructor(props: IProperties) {
        super(props);

        this.state = {
            tileSelector: false,
            tileState: {
                texture: "",
                alpha: 1,
                offset: { x: 0, y: 0 },
                rotation: 0,
                scale: 1,
                tint: 0xFFFFFF
            },
            mode: InteractionMode.Normal,
            lastMode: InteractionMode.Normal
        };

        document.addEventListener("contextmenu", (ev) => ev.preventDefault());

        document.addEventListener("pointerdown", (ev: PointerEvent) => {
            if (ev.button === 0) {
                this.inputState.leftMouseDown = true;
            } else if (ev.button === 2) {
                this.inputState.rightMouseDown = true;
                ev.preventDefault();
            }
        });

        document.addEventListener("pointerup", (ev: PointerEvent) => {
            if (ev.button === 0) {
                this.inputState.leftMouseDown = false;
                if (this.inputState.offsetChanged) {
                    this.inputState.offsetChanged = false;
                    this.props.map?.updateHistory();
                }
            } else if (ev.button === 2) {
                this.inputState.rightMouseDown = false;
                ev.preventDefault();
            }
        });

        document.addEventListener("keydown", (ev: KeyboardEvent) => {
            switch (ev.key) {
                case " ":
                    if (ev.repeat !== true) {
                        this.setState({ mode: InteractionMode.Pan, lastMode: this.state.mode });
                        ev.preventDefault();
                    }
                    break;
            }
            if (this.state.mode === InteractionMode.Normal) {
                if (this.inputState.leftMouseDown) {
                    switch (ev.key) {
                        case "ArrowUp":
                            this.props.map?.nudgeHighlightedTile(0, -1);
                            this.inputState.offsetChanged = true;
                            break;
                        case "ArrowDown":
                            this.props.map?.nudgeHighlightedTile(0, 1);
                            this.inputState.offsetChanged = true;
                            break;
                        case "ArrowLeft":
                            this.props.map?.nudgeHighlightedTile(-1, 0);
                            this.inputState.offsetChanged = true;
                            break;
                        case "ArrowRight":
                            this.props.map?.nudgeHighlightedTile(1, 0);
                            this.inputState.offsetChanged = true;
                            break;
                    }
                } else if (this.inputState.rightMouseDown) {
                    switch (ev.key) {
                        case "ArrowUp":
                            this.props.map?.scaleHighlightedTile(0.1);
                            break;
                        case "ArrowDown":
                            this.props.map?.scaleHighlightedTile(-0.1);
                            break;
                        case "ArrowLeft":
                            this.props.map?.rotateHighlightedTile(-1);
                            break;
                        case "ArrowRight":
                            this.props.map?.rotateHighlightedTile(1);
                            break;
                    }
                } else {
                    switch (ev.key) {
                        case "Delete":
                            this.props.map?.clearHighlightedTile();
                            break;
                    }
                }
            }

            if (this.state.mode === InteractionMode.Collision) {
                switch (ev.key) {
                    case "ArrowUp":
                        this.props.map?.toggleCollisionOnHighlightedTile("north");
                        break;
                    case "ArrowDown":
                        this.props.map?.toggleCollisionOnHighlightedTile("south");
                        break;
                    case "ArrowLeft":
                        this.props.map?.toggleCollisionOnHighlightedTile("west");
                        break;
                    case "ArrowRight":
                        this.props.map?.toggleCollisionOnHighlightedTile("east");
                        break;
                }
            }
        });

        document.addEventListener("keyup", (ev: KeyboardEvent) => {
            switch (ev.key) {
                case " ":
                    this.setState({ mode: this.state.lastMode });
                    ev.preventDefault();
                    break;
            }
        });
    }

    public componentDidUpdate(): void {
        if (this.props.map) {
            if (this.state.tileState.texture.length === 0) {
                const { tileState } = this.state;
                tileState.texture = this.props.map.getTileset()?.getTextureList()[0] ?? "";
                this.setState({ tileState });
            }

            this.props.map.setOnTileClickCallback((tile: Tile) => {
                switch (this.state.mode) {
                    case InteractionMode.Normal:
                        tile.setState(this.state.tileState, this.props.map?.getTileset());
                        return true;
                    case InteractionMode.Delete:
                        tile.clear();
                        return true;
                }

                return false;
            });

            this.props.map.enablePanning(this.state.mode === InteractionMode.Pan);
            this.props.map.showCollisionDebug(this.state.mode === InteractionMode.Collision);
        }
    }

    public render(): JSX.Element {
        return (
            <Container textAlign="center">
                <Menu key="top-menu">
                    <Menu.Item>
                        <Menu.Header content="Dungeon Builder" />
                    </Menu.Item>
                    <Dropdown item text="File">
                        <Dropdown.Menu>
                            <Dropdown.Item icon="file outline" content="New" onClick={() => {
                                this.props.map?.new();
                                this.forceUpdate();
                            }} />
                            <Dropdown.Item icon="save" content="Save" onClick={() => this.save()} />
                            <Dropdown.Item icon="folder open outline" content="Open" onClick={() => this.open()}/>
                            <Dropdown.Item icon="images outline" content="Open Tileset" onClick={() => this.openTileset()}/>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown item text="Layers">
                        <Dropdown.Menu>
                            <Dropdown.Item icon="plus" content="Add Layer Above" onClick={() => {
                                this.props.map?.addLayerAbove();
                                this.forceUpdate();
                            }} />
                            <Dropdown.Item icon="minus" content="Remove Layer" onClick={() => {
                                this.props.map?.removeLayer();
                                this.forceUpdate();
                            }} />
                            <Dropdown.Item icon="square" content="Fill Layer" onClick={() => this.props.map?.fillTiles(this.state.tileState)} />
                            <Dropdown.Item icon="square outline" content="Clear Layer" onClick={() => this.props.map?.clearLayer()} />
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu>
                <Menu key="tools-menu" style={{ minHeight: "50pt" }}>
                    <Dropdown item text={`Layer ${this.props.map?.getActiveLayer() ?? 0}`}>
                        <Dropdown.Menu>
                            {
                                new Array(this.props.map?.getLayerCount() ?? 1).fill(0).map((x, i) => {
                                    return <Dropdown.Item active={i === this.props.map?.getActiveLayer() ?? 0} content={`Layer ${i.toString()}`} onClick={() => {
                                        this.props.map?.setActiveLayer(i);
                                        this.forceUpdate();
                                    }}/>;
                                })
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown item text={`Tool: ${this.getInteractionModes()[this.state.mode]}`}>
                        <Dropdown.Menu>
                            {
                                this.getInteractionModes().map((x, i) => {
                                    return <Dropdown.Item active={i === this.state.mode} content={x} onClick={() => {
                                        this.setState({ mode: i });
                                    }}/>;
                                })
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                    <Menu.Item onClick={() => this.setState({ tileSelector: true })} style={{ minWidth: "50pt" }}>
                        <Image size="mini" src={(this.state.tileState.texture.length === 0) ? "" : this.props.map?.getTileset()?.getTextureURL(this.state.tileState)} />
                    </Menu.Item>
                    <Menu.Item onClick={() => this.openColourPicker()} style={{ minWidth: "50pt" }}>
                        <Icon name="paint brush" size="big" fitted color="blue" />
                    </Menu.Item>
                    <Menu.Item onClick={() => this.setState({ tileState: { ...this.state.tileState, rotation: this.state.tileState.rotation + 90 } })} style={{ minWidth: "50pt" }}>
                        <Icon name="retweet" size="big" fitted />
                    </Menu.Item>

                    <Menu.Menu position="right">
                        <Menu.Item onClick={() => this.props.map?.undo()} style={{ minWidth: "50pt" }}>
                            <Icon name="undo" size="big" fitted />
                        </Menu.Item>
                        <Menu.Item onPointerEnter={() => this.props.map?.revealMap(true)} onPointerLeave={() => this.props.map?.revealMap(false)} style={{ minWidth: "50pt", cursor: "pointer" }}>
                            <Icon name="eye" size="big" fitted />
                        </Menu.Item>
                        <Menu.Item onClick={() => this.props.map?.resetPan()} style={{ minWidth: "50pt", cursor: "pointer" }}>
                            <Icon name="hand paper" size="big" fitted />
                        </Menu.Item>
                    </Menu.Menu>

                    <Modal open={this.state.tileSelector} onClose={() => this.setState({ tileSelector: false })} closeOnDimmerClick={true} closeIcon="close">
                        <Modal.Header content="Tile Selector" />
                        <Modal.Content>
                            <Grid columns={10}>
                                { this.getTileImages() }
                            </Grid>
                        </Modal.Content>
                    </Modal>
                </Menu>
            </Container>
        );
    }

    private save(): void {
        const data = this.props.map?.save();
        if (data) {
            const json = JSON.stringify(data);
            const blob = new Blob([json], {type: "application/json;charset=utf-8"});
            saveAs(blob, "map.json");
        }
    }

    private async open(): Promise<void> {
        const files = await fileDialog();
        if (files.length === 1) {
            const file = files.item(0);
            if (file) {
                const contents = await file.text();
                try {
                    this.props.map?.load(JSON.parse(contents));
                    this.forceUpdate();
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    private async openTileset(): Promise<void> {
        const files = await fileDialog({ multiple: true });
        if (files.length === 2) {
            const fileData = [ files.item(0), files.item(1) ];
            const json = fileData.find((data) => data?.name.endsWith("json"));
            const image = fileData.find((data) => data?.name.endsWith("png"));
            if (json && image) {
                try {
                    const tileset = JSON.parse(await json.text());
                    const texture = Texture.from(URL.createObjectURL(image));
                    const spritesheet = new Spritesheet(texture, tileset);
                    spritesheet.parse(() => {
                        this.props.map?.changeTileset(spritesheet);
                    })
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    private getTileImages(): JSX.Element[] {
        return this.props.map?.getTileset()?.getTextureList()?.map((id) => {
            const state = { ...this.state.tileState, texture: id };
            const url = this.props.map?.getTileset()?.getTextureURL(state);
            const outline = (this.state.tileState.texture === id) ? "2pt #CC3300 solid" : "";
            return (
                <Grid.Column key={`image-col-${id}`}>
                    <Image src={url} style={{ cursor: "pointer", outline }} onClick={() => {
                        const { tileState } = this.state;
                        tileState.texture = id;
                        this.setState({ tileState });
                    }} />
                </Grid.Column>
            );
        }) ?? [];
    }

    private getInteractionModes(): string[] {
        return Object.keys(InteractionMode).filter((x) => isNaN(Number(x)));
    }

    private openColourPicker(): void {
        const input = document.createElement("input") as HTMLInputElement;
        input.id = "color-picker";
        input.type = "color";
        input.click();
        let timeout: number | undefined;
        input.addEventListener("input", (ev: Event) => {
            if (timeout) {
                window.clearTimeout(timeout);
                timeout = undefined;
            }
            timeout = window.setTimeout(() => {
                const tileState = this.state.tileState;
                tileState.tint = Number(input.value.replace("#", "0x"));
                this.setState({ tileState });
            }, 100);
        });
    }
}
