import React, { useState } from "react";

export const LayerSemioModal = (props) => {
  console.log(props);
  function save_and_close(e) {
    e.preventDefault();
    e.stopPropagation();

    const opacity = document.getElementById("opacityLayerChange").value;
    const fill = document.getElementById("fillColorpickerChange").value;
    const border_color = document.getElementById("layerStrokeColorPickerChange")
      .value;
    const config = {
      fill: fill,
      border: border_color,
      opacity: opacity,
    };

    //Sending back the style to the view and to the controller
    props.update_geojson(props.layer_name, config);
  }
  return (
    <div
      class="modal fade show"
      id="changeLayerSemioModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="changeLayerSemioModalLabel"
      style={{ display: "block" }}
      aria-modal="true"
      aria-hidden="true"
      data-backdrop="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="changeBaseLayerModalLabel">
              Change Layer Style
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
          <div class="modal-body">
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
                  id="opacityLayerChange"
                  defaultValue={props.semio[props.layer_name].opacity}
                ></input>
              </div>
            </div>
            <hr></hr>
            <div class="row">
              <div class="col-md-6">
                <label class="text-muted h5" for="customRange3">
                  Fill
                </label>
                <input
                  type="color"
                  id="fillColorpickerChange"
                  onchange="clickColor(0, -1, -1, 5)"
                  defaultValue={props.semio[props.layer_name].fill}
                ></input>
              </div>
              <div class="col-md-6">
                <label class="text-muted h5" for="customRange3">
                  Stroke
                </label>

                <input
                  type="color"
                  id="layerStrokeColorPickerChange"
                  onchange="clickColor(0, -1, -1, 5)"
                  defaultValue={props.semio[props.layer_name].border}
                ></input>
              </div>
            </div>
          </div>
          <button
            class="modal-footer btn btn-dark justify-content-center mt-2"
            type="button"
            id="addNewLayerButtonChange"
            data-dismiss="modal"
            onClick={save_and_close}
          >
            CHANGE
          </button>
        </div>
      </div>
    </div>
  );
};
