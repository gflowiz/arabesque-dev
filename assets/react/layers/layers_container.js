import React, { useState } from "react";

export const LayerCardsContainer = (props) => {
  function on_layer_card_drop(e) {
    let layers = {};

    //Extracting the layers cards and their y position (from viewport)
    let layersContainer = document.getElementById("accordionLayerControl");
    const layersCards = Array.from(layersContainer.childNodes).filter(
      (div) => div instanceof HTMLElement
    );
    let layersMiddleYPosition = layersCards.map(
      (div) =>
        (div.getBoundingClientRect().bottom + div.getBoundingClientRect().top) /
        2
    );

    for (let i in layersCards) {
      layers[layersCards[i].id] = layersMiddleYPosition[i];
    }
    //We set the clientY of the dragged div in the layers Object
    layers[e.target.id] = e.clientY;

    //Sort our div by y position ascendant and retrieve the div thanks to its id
    let sorted_layers = Object.entries(layers)
      .sort(function (l, e) {
        return l[1] - e[1];
      })
      .map((l) => document.getElementById(l[0]));

    //Empty the layers container and append the divs in the right order
    layersContainer.innerHTML = "";
    for (const div of sorted_layers) layersContainer.appendChild(div);

    set_z_indexes(sorted_layers);
  }
  function set_z_indexes(sorted_layers) {
    const map_layers = props.map.getLayers().array_;
    const model_layers = props.layers;
    let z_indexes = {};
    for (let div of sorted_layers) {
      //Extract the name of layer from the id of his card
      z_indexes[div.id.split("card")[1]] = -sorted_layers.indexOf(div);
    }

    for (let layer of map_layers) {
      layer.setZIndex(z_indexes[layer.values_.name]);
    }
  }

  function remove_layer(e) {
    //Compute layerName according to the target of the click (the img or the button)
    let layerName;
    if (e.target.tagName === "IMG")
      layerName = e.target.parentNode.id.split("buttonRemoveLayer")[1];
    else if (e.target.tagName === "BUTTON")
      layerName = e.target.id.split("buttonRemoveLayer")[1];

    //Remove layer from model config
    props.delete_layer(layerName);
  }

  const layers = props.layers.map((layer) => {
    if (layer.name === "nodes")
      return (
        <li
          class="card mt-2 border-dark"
          id="cardnodes"
          value="node"
          draggable="true"
          onDragEnd={on_layer_card_drop}
        >
          <div class="card-header text-dark h-5 panel-heading" id="panelnode">
            node
            <button
              type="button"
              id="buttonChangeLayernode"
              class="close center-block ml-1"
              aria-label="Close"
              data-target="#changeSemioModal"
              data-toggle="modal"
              rel="tooltip"
              data-placement="right"
              title="Change style of the layer"
            >
              <img class="icon" src="assets/svg/si-glyph-brush-1.svg"></img>
            </button>
            <button
              type="button"
              id="buttonHideLayernodes"
              class="close center-block ml-1"
              aria-label="Close"
              data-toggle="tooltip"
              data-placement="right"
              title="Hide the layer"
              data-animation="false"
              onClick={(e) => props.change_layer_visibility(e)}
            >
              <img
                class="icon"
                id="nodesVisibility"
                src="assets/svg/si-glyph-view.svg"
              ></img>
            </button>
          </div>
        </li>
      );
    else if (layer.name === "links")
      return (
        <li
          class="card mt-2 border-dark"
          id="cardlinks"
          value="link"
          draggable="true"
          onDragEnd={on_layer_card_drop}
        >
          <div class="card-header text-dark h-5 panel-heading" id="panellink">
            link
            <button
              type="button"
              id="buttonChangeGeoLayerlink"
              class="close center-block ml-1"
              aria-label="Close"
              data-target="#changeGeometryModal"
              data-toggle="modal"
              rel="tooltip"
              data-placement="right"
              title="Change shape of the links"
            >
              <img class="icon" src="assets/svg/si-glyph-ruler.svg"></img>
            </button>
            <button
              type="button"
              id="buttonChangeLayerlink"
              class="close center-block ml-1"
              aria-label="Close"
              data-target="#changeSemioLinkModal"
              data-toggle="modal"
              rel="tooltip"
              data-placement="right"
              title="Change style of the links"
            >
              <img class="icon" src="assets/svg/si-glyph-brush-1.svg"></img>
            </button>
            <button
              type="button"
              id="buttonHideLayerlinks"
              class="close center-block ml-1"
              aria-label="Close"
              rel="tooltip"
              data-placement="right"
              title="Hide the layer"
              onClick={(e) => props.change_layer_visibility(e)}
            >
              <img
                class="icon"
                id="linksVisibility"
                src="assets/svg/si-glyph-view.svg"
              ></img>
            </button>
          </div>
        </li>
      );
    else
      return (
        <li
          class="card mt-2 border-dark"
          id={"card" + layer.name}
          value={layer.name}
          draggable="true"
          onDragEnd={on_layer_card_drop}
        >
          <div
            class="card-header text-dark h-5 panel-heading"
            id={"panel" + layer.name}
          >
            {layer.name}
            <button
              onClick={remove_layer}
              type="button"
              id={"buttonRemoveLayer" + layer.name}
              class="close center-block ml-1"
              aria-label="Close"
              data-toggle="tooltip"
              data-placement="right"
              title="Remove the layer"
              data-animation="false"
            >
              <img class="icon" src="assets/svg/si-glyph-trash.svg"></img>
            </button>
            <button
              type="button"
              id={"buttonHideLayer" + layer.name}
              class="close center-block ml-1"
              aria-label="Close"
              rel="tooltip"
              data-placement="right"
              title="Hide the layer"
              onClick={(e) => props.change_layer_visibility(e)}
            >
              <img
                class="icon"
                id={layer.name + "Visibility"}
                src="assets/svg/si-glyph-view.svg"
              ></img>
            </button>
          </div>
        </li>
      );
  });

  return layers;
};
