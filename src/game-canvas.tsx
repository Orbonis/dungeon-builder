import React from "react";

interface IProperties {
    onMount: (canvas: HTMLCanvasElement) => void;
}

interface IState {
    top: number;
    left: number;
    width: number;
    height: number;
}

export class GameCanvas extends React.Component<IProperties, IState> {
    constructor(props: IProperties) {
        super(props);
        
        this.state = {
            top: 0,
            left: 0,
            width: 0,
            height: 0
        };

        window.addEventListener("resize", () => this.updateSize());
    }

    public componentDidMount(): void {
        this.updateSize();
        this.props.onMount(document.getElementById("game-canvas") as HTMLCanvasElement);
    }

    public render(): JSX.Element {
        return <canvas id="game-canvas" style={this.getStyling()}></canvas>;
    }

    private updateSize(): void {
        const width: number = Math.min((window.innerWidth - 200), (window.innerHeight - 200) * 1.5);
        const height: number = Math.min((window.innerWidth - 200) / 1.5, (window.innerHeight - 200));
        const top: number = (window.innerHeight / 2) - (height / 2);
        const left: number = (window.innerWidth / 2) - (width / 2);

        this.setState({ top, left, width, height });
    }

    private getStyling(): React.CSSProperties {
        return {
            position: "absolute",
            top: `${this.state.top}px`,
            left: `${this.state.left}px`,
            width: `${this.state.width}px`,
            height: `${this.state.height}px`
        };
    }
}