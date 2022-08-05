import React from "react";
import { Container } from "semantic-ui-react";
import { Map } from "./components/map";
import { Game } from "./game";
import { GameCanvas } from "./game-canvas";
import { UI } from "./ui/ui";

interface IProperties {}
interface IState {
    game: Game;
    map?: Map;
}

export class Application extends React.Component<IProperties, IState> {
    constructor(props: IProperties) {
        super(props);

        this.state = {
            game: new Game()
        };
    }

    public render(): JSX.Element {
        return (
            <Container>
                <GameCanvas onMount={async (canvas) => {
                    const map = await this.state.game.init(canvas, 1500, 1000);
                    this.setState({ map });
                }} />
                <UI map={this.state.map} />
            </Container>
        );
    }
}