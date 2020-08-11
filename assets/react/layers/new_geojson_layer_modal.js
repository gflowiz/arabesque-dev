import React, { useState } from "react";

export const NewGeojsonLayerModal = (props) => {
  function save_and_close(e) {
    e.preventDefault();
    e.stopPropagation();
    //Getting the loaded file
    const file = document.getElementById("geoJson").files[0];
    console.log(file);
    //Checking if it's a geojson
    if (file.type !== "application/geo+json") {
      document.getElementById("geoJson").classList.add("is-invalid");
      return;
    } else {
      document.getElementById("geoJson").classList.remove("is-invalid");
    }

    const name = document.getElementById("nameGeoJson").value;
    const opacity = document.getElementById("opacityGeoJson").value;
    const fill = document.getElementById("fillColorpickerGeoJson").value;
    const border_color = document.getElementById("strokeColorpickerGeoJson")
      .value;
    const config = { fill: fill, border: border_color, opacity: opacity };
    //Extracting data from the file
    if (file) {
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function (e) {
        let geojson_file = JSON.parse(e.target.result);

        config.file = geojson_file;
        props.save_layer("geojson", name, config);
        $("#geojsonModal").modal("hide");
      };
      reader.onerror = function (e) {
        console.log(e);
      };
    }
  }

  function on_file_loaded(e) {
    document.getElementById("label_geoJson").innerHTML = e.target.files[0].name;
  }
  return (
    <div
      class="modal fade show"
      id="geojsonModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="geojsonModalLabel"
      style={{ display: "block", ariaModal: "true" }}
      aria-modal="true"
      aria-hidden="true"
      data-backdrop="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="geojsonModalLabel">
              {" "}
              Import GeoJson
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body" id="geoJsonModalBody">
            <div class="row">
              <div class="col-md-6">
                <label class="text-muted h5">GeoJson</label>
                <div class="input-group">
                  <label class="h5" for="geoJson">
                    Import Data
                  </label>
                  <input
                    type="file"
                    id="geoJson"
                    class="custom-file-input"
                    aria-describedby="inputGroupFileAddon01"
                    onChange={on_file_loaded}
                  ></input>
                  <div class="invalid-feedback">
                    File must be at geojson format
                  </div>
                  <label
                    class="custom-file-label"
                    id="label_geoJson"
                    for="geoJson"
                  >
                    Choose a file...
                  </label>
                </div>
              </div>
              <div class="col-md-6">
                <label class="text-muted h5" for="nameGeoJson">
                  Name Layer
                </label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="GeoJson"
                    id="nameGeoJson"
                  ></input>
                </div>
              </div>
            </div>
            <hr></hr>
            <div class="row">
              <div class="col-md-12">
                <label class="text-muted h5" for="customRange3">
                  Opacity
                </label>
                <input
                  type="range"
                  class="custom-range"
                  min="0"
                  max="1"
                  step="0.05"
                  id="opacityGeoJson"
                ></input>
              </div>
            </div>
            <hr></hr>{" "}
            <div class="row">
              <div class="col-md-6">
                <label class="text-muted h5" for="customRange3">
                  Fill
                </label>
                <input
                  type="color"
                  id="fillColorpickerGeoJson"
                  onchange="clickColor(0, -1, -1, 5)"
                  value="#ff0000"
                ></input>
              </div>
              <div class="col-md-6">
                <label class="text-muted h5" for="customRange3">
                  Stroke
                </label>
                <input
                  type="color"
                  id="strokeColorpickerGeoJson"
                  onchange="clickColor(0, -1, -1, 5)"
                  value="#ff0000"
                ></input>
              </div>
            </div>
          </div>
          <button
            class="modal-footer btn btn-dark justify-content-center mt-2"
            type="button"
            id="addNewLayerButtonGeoJson"
            onClick={save_and_close}
          >
            ADD LAYER
          </button>
        </div>
      </div>
    </div>
  );
};
