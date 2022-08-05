import React from "react";
import ReactDOM from "react-dom";

import "./core.scss";
import "./utils/contextual-css.scss";
import "src/style.scss";
import "semantic-ui-css/semantic.min.css";

import "@pixi/graphics-extras";

import { setupContextualCSS } from "./utils/contextual-css";
import { Application } from "./application";

const element = document.createElement("div");
element.id = "app";
document.body.appendChild(element);

setupContextualCSS();

ReactDOM.render(<Application />, element);
