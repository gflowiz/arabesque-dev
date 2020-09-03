import React, { useState } from "react";

export const NewGeojsonLayerModal = (props) => {
  console.log(props);
  function save_and_close(e) {
    e.preventDefault();
    e.stopPropagation();
    //Getting the loaded file
    const file = document.getElementById("geoJson").files[0];
    //Checking if it's a geojson
    if (file === undefined || file.type !== "application/geo+json") {
      document.getElementById("geoJson").classList.add("is-invalid");
      return;
    } else {
      document.getElementById("geoJson").classList.remove("is-invalid");
    }

    let name = document.getElementById("nameGeoJson").value;
    //Checking that name is not empty and not already loaded
    if (name === "" || props.layers.map((l) => l.name).includes(name)) {
      document.getElementById("nameGeoJson").classList.add("is-invalid");
      return;
    } else
      document.getElementById("nameGeoJson").classList.remove("is-invalid");

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
        //Dealing with unsupported geometries
        if (geojson_file.features[0].type === "Features") {
          document.getElementById("geoJson").classList.add("is-invalid");
          return;
        } else
          document.getElementById("geoJson").classList.remove("is-invalid");

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
    let name = e.target.files[0].name;
    console.log(name);
    document.getElementById("label_geoJson").innerHTML = name.substring(0, 15);
    document.getElementById("nameGeoJson").value = name
      .split(".")[0]
      .substring(0, 15);
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
                    File is not geojson format or invalid or has unrecognized
                    geometries (ex FeatureCollection with "Features" elements
                    instead of "Feature" )
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
                    defaultValue=""
                  ></input>
                  <div class="invalid-feedback">
                    Name must not be empty or be the same as the name of a layer
                    already loaded
                  </div>
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
                  defaultValue="#ff0000"
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
                  defaultValue="#ff0000"
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
