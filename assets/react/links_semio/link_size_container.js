import React, { useState } from "react";

export const SizeContainerComponent = (props) => {
  let links_properties = props.links_properties;
  let [size_mode, set_size_mode] = useState(props.semio.size.mode);

  //Parses a string and returns NaN if it's not convertible into a float (stricter than parseFloat())
  function filter_float(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value))
      return Number(value);
    return NaN;
  }

  //The size container changes according to the size mode (fixed or varied)
  let size_container;
  if (size_mode === "fixed") {
    props.notify_state_change("fixed");
    size_container = (
      <div class="row" id="semioSizeChangeLink">
        <div class="col-md-2">
          <label for="select" class="text-muted h5">
            -
          </label>
          <select
            class="custom-select"
            id="semioSizeBaseTypeChangeLink"
            onChange={(e) => set_size_mode(e.target.value)}
            defaultValue={size_mode}
          >
            <option value="fixed">Fixed</option>
            <option value="varied">Varied</option>
          </select>
        </div>
        <div id="semioSizeRatioChangeLink" class="col-md-4">
          <label class="text-muted h5">
            Width{" "}
            <img
              class="small-icon"
              src="assets/svg/si-glyph-circle-info.svg"
              data-html="true"
              data-container="body"
              data-toggle="popover"
              data-placement="right"
              data-content="It is the fixed width in pixel for each links"
            ></img>{" "}
          </label>
          <input
            class="form-control"
            id="ratioMinMaxSizeChangeLink"
            type="number"
            defaultValue={props.semio.size.fixed}
          ></input>
        </div>
      </div>
    );
  } else if (size_mode === "varied") {
    props.notify_state_change("varied");
    size_container = (
      <div class="row" id="semioSizeChangeLink">
        <div class="col-md-2">
          <label for="select" class="text-muted h5">
            -
          </label>
          <select
            class="custom-select"
            id="semioSizeBaseTypeChangeLink"
            onChange={(e) => set_size_mode(e.target.value)}
            defaultValue={size_mode}
          >
            <option value="fixed">Fixed</option>
            <option value="varied">Varied</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="text-muted h5">Variable</label>
          <select
            class="custom-select"
            id="semioSelectorSizeChangeLink"
            // defaultValue={props.semio.size.varied.var}
          >
            <option value="count">count</option>
          </select>
        </div>
        <div id="semioSizeRatioCatChangeLink" class="col-md-4">
          <label class="text-muted h5">Scale</label>
          <select
            class="custom-select"
            id="typeSizeChangeLink"
            defaultValue={props.semio.size.varied.scale}
          >
            <option value="Pow">Square</option>
            <option value="Sqrt">SquareRoot</option>
            <option value="Log">Logarithmic</option>
          </select>
        </div>
        <div id="semioSizeRatioChangeLink" class="col-md-4">
          <label class="text-muted h5">
            Ratio{" "}
            <img
              class="small-icon"
              src="assets/svg/si-glyph-circle-info.svg"
              data-html="true"
              data-container="body"
              data-toggle="popover"
              data-placement="right"
              data-content="it represent the max width in pixel of the visualisation "
              data-original-title=""
              title=""
            ></img>
          </label>
          <input
            class="form-control"
            id="ratioMinMaxSizeChangeLink"
            type="number"
            defaultValue={props.semio.size.varied.maxval}
          ></input>
        </div>
      </div>
    );
  }

  return size_container;
};
