import React, { useState } from "react";

export const NewTileLayerModal = (props) => {
  return (
    <div
      class="modal fade show"
      id="OSMModal"
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
              dataDismiss="modal"
              ariaLabel="Close"
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
                <label class="text-muted h5">Layer</label>
                <select class="custom-select w-100" id="TilelayersAdd">
                  <option selected>Choose...</option>
                </select>
                <label for="tileLayersNameSelectorOptions">Tiles</label>
                <select
                  class="custom-select"
                  id="tileLayersNameSelectorOptions"
                >
                  <option value="OSM">OSM</option>
                  <option value="Wikimedia">Wikimedia</option>
                  <option value="Humanitarian OSM">Humanitarian OSM</option>
                  <option value="OSM_no_labels">OSM_no_labels</option>
                  <option value="wmflabs_OSM_BW">wmflabs_OSM_BW</option>
                  <option value="Öpnvkarte_Transport_Map">
                    Öpnvkarte_Transport_Map
                  </option>
                </select>
              </div>
            </div>
            <hr></hr>
            <div class="row">
              <div class="col-md-6 m-2">
                {/* <button
                  type="button"
                  class="btn btn-dark"
                  data-toggle="modal"
                  data-target="#baseLayerFromURLModal"
                  data-dismiss="modal"
                >
                  I Have My Tiles
                </button> */}
              </div>
            </div>
          </div>
          <button
            class="modal-footer btn btn-dark justify-content-center"
            type="button"
            id="addNewTileLayerButtonAdd"
            data-dismiss="modal"
          >
            ADD TILE LAYER
          </button>
        </div>
      </div>
    </div>
  );
};
