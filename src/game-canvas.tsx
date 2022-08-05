import React from "react";

interface IProperties {
    onMount: (canvas: HTMLCanvasElement) => void;
}

interface IState {

}

export class GameCanvas extends React.Component<IProperties, IState> {
    constructor(props: IProperties) {
        super(props);
        
        this.state = {

        };
    }

    public componentDidMount(): void {
        this.props.onMount(document.getElementById("game-canvas") as HTMLCanvasElement);
    }

    public render(): JSX.Element {
        return <canvas id="game-canvas" style={{ width: `100%`, height: "auto", padding: "20pt" }}></canvas>;
    }
}