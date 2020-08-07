import React, { useState } from "react";

export const NewTileLayerModal = (props) => {
  console.log(props);
  function addLayer(e) {
    e.preventDefault();
    e.stopPropagation();
    const source = document.getElementById("tileLayersNameSelectorOptions")
      .value;

    //Check if it's already in the map
    if (props.layers.map((layer) => layer.name).includes(source)) {
      document
        .getElementById("tileLayersNameSelectorOptions")
        .classList.add("is-invalid");

      return;
    } else {
      document
        .getElementById("tileLayersNameSelectorOptions")
        .classList.remove("is-invalid");
      $("#tileLayerModal").modal("hide");
    }
    props.save_layer("tile", source);
  }
  return (
    <div
      class="modal fade show"
      id="tileLayerModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="OSMModalLabel"
      style={{ display: "flex" }}
      aria-modal="true"
      aria-hidden="true"
      data-backdrop="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="OSMModalLabel">
              {" "}
              Add Tile Layer
            </h5>
            <button
              type="button"
              class="close"
              ariaLabel="Close"
              data-dismiss="modal"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <label class="text-muted h5">Type</label>
                <select class="custom-select w-100" id="tileLayersAdd">
                  <option value="base">Base</option>
                  <option value="overlay">Overlay</option>
                  <option value="stamen">Stamen Map</option>
                  CARTO basemap
                  <option value="text">Text Tile</option>
                  <option value="carto">CARTO basemap</option>
                </select>
              </div>
              <div class="col-md-6" id="tileLayersNameSelector">
                {/* <label class="text-muted h5">Layer</label>
                <select class="custom-select w-100" id="TilelayersAdd">
                  <option selected>Choose...</option>
                </select> */}
                <label for="tileLayersNameSelectorOptions">Tiles</label>
                <select
                  class="custom-select"
                  id="tileLayersNameSelectorOptions"
                >
                  <option value="Wikimedia">Wikimedia</option>
                  <option value="OSM">OSM</option>
                  <option value="Humanitarian_OSM">Humanitarian OSM</option>
                  <option value="OSM_without_labels">OSM without labels</option>
                  <option value="wmflabs_OSM_BW">wmflabs OSM BW</option>
                  <option value="Öpnvkarte_Transport_Map">
                    Öpnvkarte_Transport_Map
                  </option>
                </select>
                <div class="invalid-feedback">
                  This layer has already been loaded
                </div>
              </div>
            </div>
            <hr></hr>
            <div class="row">
              <div class="col-md-6 m-2">
                <button
                  type="button"
                  class="btn btn-dark"
                  data-toggle="modal"
                  data-target="#baseLayerFromURLModal"
                  data-dismiss="modal"
                >
                  I Have My Tiles
                </button>
              </div>
            </div>
          </div>
          <button
            class="modal-footer btn btn-dark justify-content-center"
            type="button"
            id="addNewTileLayerButtonAdd"
            // data-dismiss="modal"
            onClick={addLayer}
          >
            ADD TILE LAYER
          </button>
        </div>
      </div>
    </div>
  );
};
