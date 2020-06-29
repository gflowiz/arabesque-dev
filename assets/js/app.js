
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/css/bootstrap.css";

import "bootstrap-select/dist/css/bootstrap-select.min.css";
import "bootstrap-select/dist/js/bootstrap-select.min.js";


import "../css/control.css";
import "../css/ol.css"

import "./projections.js"
import "./example.js"

import Controller from "./controller.js"
import Model from "./model.js"
import OlRenderer from "./olrenderer.js"
import View from "./view.js"



const model = new Model();
const renderer = new OlRenderer("Map");
const view = new View(renderer);
const controller = new Controller(model,view);
