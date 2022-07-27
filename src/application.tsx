import React from "react";
import { Game } from "./game";
import { GameCanvas } from "./game-canvas";

interface IProperties {}
interface IState {}

export class Application extends React.Component<IProperties, IState> {
    private game: Game;

    constructor(props: IProperties) {
        super(props);

        this.state = {};

        this.game = new Game();
    }

    public render(): JSX.Element[] {
        return [
            <GameCanvas key="game-canvas" onMount={(canvas) => this.game.init(canvas)} />
        ];
    }
}