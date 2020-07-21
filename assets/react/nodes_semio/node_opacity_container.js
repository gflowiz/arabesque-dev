import React, { useState } from "react";

export const OpacityContainerComponent = (props) => {
  //Getting props from parent
  let nodes_properties = props.nodes_properties;
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
      <div class="row" id="semioOpaChangenode">
        <div class="col-md-2">
          <label for="select" class="text-muted h5">
            -
          </label>
          <select
            class="custom-select"
            id="semioOpaBaseTypeChangenode"
            onChange={(e) => set_opacity_mode(e.target.value)}
            defaultValue={opacity_mode}
          >
            <option value="fixed">Fixed</option>
            <option value="varied">Varied</option>
          </select>
        </div>
        <div id="semioOpaMaxRatioChangenode" class="col-md-3">
          <label class="text-muted h5">Value</label>
          <input
            class="form-control"
            id="ratioMaxOpaChangenode"
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
      <div class="row" id="semioOpaChangenode">
        <div class="col-md-2">
          <label for="select" class="text-muted h5">
            -
          </label>
          <select
            class="custom-select"
            id="semioOpaBaseTypeChangenode"
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
            id="semioSelectorOpaChangenode"
            defaultValue={props.semio.color.varied.var}
          >
            {/* We can iterate on the nodes properties to fill the select div  */}
            {Object.keys(nodes_properties)
              .filter((p) => {
                //Checking if the property is a number
                return isNaN(filter_float(nodes_properties[p])) === false;
              })
              .map((p) => (
                <option value={p}>{p}</option>
              ))}
          </select>
        </div>
        <div id="semioOpaRatioCatChangenode" class="col-md-3">
          <label class="text-muted h5">Scale</label>
          <select
            class="custom-select"
            id="typeOpaChangenode"
            defaultValue={props.semio.opacity.varied.scale}
          >
            <option value="Linear">Linear</option>
            <option value="Pow">Square</option>
            <option value="Sqrt">SquareRoot</option>
            <option value="Log">Logarithmic</option>
          </select>
          <div class="invalid-feedback">
            Error : Can't use log scale with this data. All values must be
            superior to 0
          </div>
        </div>
        <div id="semioOpaMinRatioChangenode" class="col-md-2">
          <label class="text-muted h5">Min</label>
          <input
            class="form-control"
            id="ratioMinOpaChangenode"
            min="0"
            step="0.05"
            max="1"
            type="number"
            defaultValue={props.semio.opacity.varied.min}
          ></input>
          <div class="invalid-feedback">Enter a value between 0 and 1 </div>
        </div>
        <div id="semioOpaMaxRatioChangenode" class="col-md-2">
          <label class="text-muted h5">Max</label>
          <input
            class="form-control"
            id="ratioMaxOpaChangenode"
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
