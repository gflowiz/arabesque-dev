import React, { useState } from "react";

export const OpacityContainerComponent = (props) => {
  //Getting props from parent
  let links_properties = props.links_properties;
  let [opacity_mode, set_opacity_mode] = useState(props.semio.opacity.mode);

  //Parses a string and returns NaN if it's not convertible into a float (stricter than parseFloat())
  function filter_float(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value))
      return Number(value);
    return NaN;
  }

  //The opacity container changes according to the opacity mode (fixed or varied)
  let opacity_container;
  if (opacity_mode === "fixed") {
    props.notify_state_change("fixed");
    opacity_container = (
      <div class="row" id="semioOpaChangeLink">
        <div class="col-md-2">
          <label for="select" class="text-muted h5">
            -
          </label>
          <select
            class="custom-select"
            id="semioOpaBaseTypeChangeLink"
            onChange={(e) => set_opacity_mode(e.target.value)}
            defaultValue={opacity_mode}
          >
            <option value="fixed">Fixed</option>
            <option value="varied">Varied</option>
          </select>
        </div>
        <div id="semioOpaMaxRatioChangeLink" class="col-md-3">
          <label class="text-muted h5">Value</label>
          <input
            class="form-control"
            id="ratioMaxOpaChangeLink"
            min="0"
            step="0.05"
            max="1"
            type="number"
            defaultValue={props.semio.opacity.fixed}
          ></input>
          <div class="invalid-feedback">Enter a value between 0 and 1 </div>
        </div>
      </div>
    );
  } else if (opacity_mode === "varied") {
    //Notify semio_modal of the state change
    props.notify_state_change("varied");
    opacity_container = (
      <div class="row" id="semioOpaChangeLink">
        <div class="col-md-2">
          <label for="select" class="text-muted h5">
            -
          </label>
          <select
            class="custom-select"
            id="semioOpaBaseTypeChangeLink"
            onChange={(e) => set_opacity_mode(e.target.value)}
            defaultValue={opacity_mode}
          >
            <option selected="" value="fixed">
              Fixed
            </option>
            <option value="varied">Varied</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="text-muted h5">Variable</label>
          <select
            class="custom-select"
            id="semioSelectorOpaChangeLink"
            // defaultValue={props.semio.color.varied.var}
          >
            <option value="count">count</option>
          </select>
        </div>
        <div id="semioOpaRatioCatChangeLink" class="col-md-3">
          <label class="text-muted h5">Scale</label>
          <select
            class="custom-select"
            id="typeOpaChangeLink"
            defaultValue={props.semio.opacity.varied.scale}
          >
            <option value="Linear">Linear</option>
            <option value="Pow">Square</option>
            <option value="Sqrt">SquareRoot</option>
            <option value="Log">Logarithmic</option>
          </select>
          <div class="invalid-feedback">
            Error : all values must be inferior to 0
          </div>
        </div>
        <div id="semioOpaMinRatioChangeLink" class="col-md-2">
          <label class="text-muted h5">Min</label>
          <input
            class="form-control"
            id="ratioMinOpaChangeLink"
            min="0"
            step="0.05"
            max="1"
            type="number"
            defaultValue={props.semio.opacity.varied.min}
          ></input>
          <div class="invalid-feedback">Enter a value between 0 and 1 </div>
        </div>
        <div id="semioOpaMaxRatioChangeLink" class="col-md-2">
          <label class="text-muted h5">Max</label>
          <input
            class="form-control"
            id="ratioMaxOpaChangeLink"
            min="0"
            step="0.05"
            max="1"
            type="number"
            defaultValue={props.semio.opacity.varied.max}
          ></input>
          <div class="invalid-feedback">Enter a value between 0 and 1 </div>
        </div>
      </div>
    );
  }
  return opacity_container;
};
