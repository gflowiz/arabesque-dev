import React, { useState } from "react";

export const SizeContainerComponent = (props) => {
  let nodes_properties = props.nodes_properties;
  let [size_mode, set_size_mode] = useState(props.semio.size.mode);

  //Parses a string and returns NaN if it's not convertible into a float (stricter than parseFloat())
  function filter_float(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value))
      return Number(value);
    return NaN;
  }

  function enablePopup() {
    if (document.getElementById("sizeRatioIcon") !== null) {
      $("#sizeRatioIcon").popover();
    }

    if (document.getElementById("sizeWidthIcon") !== null) {
      $("#sizeWidthIcon").popover();
    }
  }

  //The size container changes according to the size mode (fixed or varied)
  let size_container;
  if (size_mode === "fixed") {
    props.notify_state_change("fixed");
    size_container = (
      <div class="row" id="semioSizeChangenode">
        <div class="col-md-2">
          <label for="select" class="text-muted h5">
            -
          </label>
          <select
            class="custom-select"
            id="semioSizeBaseTypeChangenode"
            onChange={(e) => set_size_mode(e.target.value)}
            defaultValue={size_mode}
          >
            <option value="fixed">Fixed</option>
            <option value="varied">Varied</option>
          </select>
        </div>
        <div id="semioSizeRatioChangenode" class="col-md-4">
          <label class="text-muted h5">
            Radius{" "}
            <img
              id="sizeWidthIcon"
              class="small-icon"
              src="assets/svg/si-glyph-circle-info.svg"
              data-html="true"
              data-container="body"
              data-toggle="popover"
              data-placement="right"
              data-content="This radius is then multiplied by 1000 times the length of the smallest side of the data bounding box"
              onLoad={enablePopup}
            ></img>{" "}
          </label>
          <input
            class="form-control"
            id="ratioMinMaxSizeChangenode"
            type="number"
            defaultValue={props.semio.size.fixed}
          ></input>
          <div class="invalid-feedback">Enter a width</div>
        </div>
      </div>
    );
  } else if (size_mode === "varied") {
    props.notify_state_change("varied");
    size_container = (
      <div class="row" id="semioSizeChangenode">
        <div class="col-md-2">
          <label for="select" class="text-muted h5">
            -
          </label>
          <select
            class="custom-select"
            id="semioSizeBaseTypeChangenode"
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
            id="semioSelectorSizeChangenode"
            defaultValue={props.semio.size.varied.var}
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
        <div id="semioSizeRatioCatChangenode" class="col-md-4">
          <label class="text-muted h5">Scale</label>
          <select
            class="custom-select"
            id="typeSizeChangenode"
            defaultValue={props.semio.size.varied.scale}
          >
            <option value="Pow">Square</option>
            <option value="Sqrt">SquareRoot</option>
            <option value="Log">Logarithmic</option>
          </select>
          <div class="invalid-feedback">
            Error : Can't use log scale with this data. All values must be
            superior to 0
          </div>
        </div>
        <div id="semioSizeRatioChangenode" class="col-md-4">
          <label class="text-muted h5">
            Ratio{" "}
            <img
              id="sizeRatioIcon"
              class="small-icon"
              src="assets/svg/si-glyph-circle-info.svg"
              data-html="true"
              data-container="body"
              data-toggle="popover"
              data-placement="right"
              data-content="This ratio is used to calculate the radius of the biggest node"
              data-original-title=""
              title=""
              onLoad={enablePopup}
            ></img>
          </label>
          <input
            class="form-control"
            id="ratioMinMaxSizeChangenode"
            type="number"
            defaultValue={props.semio.size.varied.maxval}
          ></input>
          <div class="invalid-feedback">Enter a ratio</div>
        </div>
      </div>
    );
  }

  return size_container;
};
