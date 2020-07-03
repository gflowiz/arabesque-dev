import React, { useState } from "react";
import { color } from "d3";

export const ColorContainerComponent = (props) => {
  //Works exactly like a class state
  let [color_mode, set_color_mode] = useState("fixed");
  let [color_type, set_color_type] = useState("quantitative");
  let nodes_properties = props.nodes_properties;
  console.log(props.nodes_properties);

  //Put a border when the ramp is clicked (or one of its children nodes)
  function selectColorRamp(e) {
    document
      .querySelectorAll(".selectedRamp")
      .forEach((el) => el.classList.remove("selectedRamp"));
    console.log(e.target.nodeName);

    let clickedElement = e.target;
    if (clickedElement.nodeName === "rect") {
      clickedElement.parentNode.parentNode.classList.add("selectedRamp");
    } else if (clickedElement.nodeName === "svg") {
      clickedElement.parentNode.classList.add("selectedRamp");
    } else {
      clickedElement.classList.add("selectedRamp");
    }
  }

  //Parses a string and returns NaN if it's not convertible into a float (stricter than parseFloat())
  function filter_float(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value))
      return Number(value);
    return NaN;
  }

  //Both color menu and container change according to the color mode (fixed or varied)
  let color_menu, color_container;
  if (color_mode === "fixed") {
    props.notify_state_change("fixed");
    props.notify_type_change(null);
    color_menu = (
      <select
        class="custom-select"
        id="semioColor"
        onChange={(e) => set_color_mode(e.target.value)}
      >
        <option value="fixed">Constant</option>
        <option value="varied">Conditional</option>
      </select>
    );
    color_container = <input id="singleColorPicker" type="color"></input>;
  } else if (color_mode === "varied") {
    props.notify_state_change("varied");
    props.notify_type_change(color_type);
    color_menu = (
      <>
        <label class="text-muted h5" for="colorMode">
          Mode
        </label>
        <select
          class="custom-select"
          id="colorMode"
          onChange={(e) => set_color_mode(e.target.value)}
        >
          <option value="fixed">Constant</option>
          <option value="varied" selected>
            Conditional
          </option>
        </select>

        <label class="text-muted h5" for="colorVariable">
          Variable
        </label>
        <select class="custom-select" id="colorVariable">
          {/* We can iterate on the nodes properties to fill the select div  */}
          {Object.keys(nodes_properties)
            .filter((p) => {
              //Checking if the property is a number
              if (color_type === "quantitative") {
                return isNaN(filter_float(nodes_properties[p])) === false;
              } else if (color_type === "qualitative") {
                return isNaN(filter_float(nodes_properties[p])) === true;
              }
            })
            .map((p) => (
              <option value={p}>{p}</option>
            ))}
        </select>

        <label class="text-muted h5" for="colorType">
          Type
        </label>
        <select
          class="custom-select"
          id="colorType"
          onChange={(e) => {
            console.log(e.target.value);
            set_color_type(e.target.value);
          }}
        >
          <option value="quantitative" selected>
            Quantitative
          </option>
          <option value="qualitative">Qualitative</option>
        </select>

        <div class="form-check mt-2">
          <input
            class="form-check-input position-static"
            type="checkbox"
            id="inversedColorPalette"
          ></input>
          <div class="form-check-label text-muted h6"> Inverse</div>
        </div>
      </>
    );

    if (color_type === "quantitative") {
      color_container = (
        <div class="col-md-9" id="colorPickerChangenode">
          <div class="colorSubContainer">
            <tr class="rampContainerAndLabel">
              <td>
                <label class="text-muted h5" for="divergingChangenode">
                  Diverging
                </label>
              </td>
              <td id="divergingChangenode" class="rampContainer">
                <div
                  id="BrBGChangenode"
                  value="BrBG"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(140, 81, 10)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(191, 129, 45)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(223, 194, 125)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(246, 232, 195)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(199, 234, 229)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(128, 205, 193)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(53, 151, 143)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(1, 102, 94)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="PRGnChangenode"
                  value="PRGn"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(118, 42, 131)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(153, 112, 171)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(194, 165, 207)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(231, 212, 232)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(217, 240, 211)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(166, 219, 160)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(90, 174, 97)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(27, 120, 55)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="PiYGChangenode"
                  value="PiYG"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(197, 27, 125)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(222, 119, 174)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(241, 182, 218)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(253, 224, 239)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(230, 245, 208)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(184, 225, 134)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(127, 188, 65)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(77, 146, 33)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="PuOrChangenode"
                  value="PuOr"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(84, 39, 136)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(128, 115, 172)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(178, 171, 210)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(216, 218, 235)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(254, 224, 182)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(253, 184, 99)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(224, 130, 20)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(179, 88, 6)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="RdBuChangenode"
                  value="RdBu"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(178, 24, 43)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(214, 96, 77)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(244, 165, 130)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(253, 219, 199)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(209, 229, 240)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(146, 197, 222)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(67, 147, 195)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(33, 102, 172)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="RdGyChangenode"
                  value="RdGy"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(178, 24, 43)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(214, 96, 77)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(244, 165, 130)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(253, 219, 199)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(224, 224, 224)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(186, 186, 186)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(135, 135, 135)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(77, 77, 77)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="RdYlBuChangenode"
                  value="RdYlBu"
                  class="ramps selected"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(215, 48, 39)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(244, 109, 67)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(253, 174, 97)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(254, 224, 144)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(224, 243, 248)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(171, 217, 233)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(116, 173, 209)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(69, 117, 180)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="RdYlGnChangenode"
                  value="RdYlGn"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(215, 48, 39)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(244, 109, 67)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(253, 174, 97)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(254, 224, 139)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(217, 239, 139)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(166, 217, 106)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(102, 189, 99)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(26, 152, 80)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="SpectralChangenode"
                  value="Spectral"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(213, 62, 79)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(244, 109, 67)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(253, 174, 97)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(254, 224, 139)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(230, 245, 152)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(171, 221, 164)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(102, 194, 165)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(50, 136, 189)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
              </td>
            </tr>
            <tr class="rampContainerAndLabel">
              <td>
                <label class="text-muted h5" for="divergingChangenode">
                  Extra Palettes
                </label>
              </td>
              <td class="ml-1" id="diverColorChangenode" class="rampContainer">
                <div
                  id="ViridisChangenode"
                  value="Viridis"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(68, 1, 84)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(70, 52, 128)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(53, 95, 141)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(37, 132, 142)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(30, 156, 137)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(68, 191, 112)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(155, 217, 60)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(253, 231, 37)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="InfernoChangenode"
                  value="Inferno"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(0, 0, 4)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(43, 11, 87)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(106, 23, 110)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(168, 46, 95)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(204, 66, 72)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(243, 120, 25)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(251, 190, 35)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(252, 255, 164)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="MagmaChangenode"
                  value="Magma"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(0, 0, 4)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(37, 18, 85)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(100, 26, 128)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(161, 48, 126)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(202, 62, 114)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(247, 112, 92)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(254, 183, 126)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(252, 253, 191)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="PlasmaChangenode"
                  value="Plasma"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(13, 8, 135)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(86, 1, 164)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(143, 13, 164)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(191, 57, 132)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(214, 85, 109)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(242, 132, 75)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(254, 186, 44)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(240, 249, 33)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="WarmChangenode"
                  value="Warm"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(110, 64, 170)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(171, 60, 178)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(228, 65, 157)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(255, 84, 115)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(255, 106, 84)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(251, 150, 51)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(212, 199, 51)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(175, 240, 91)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="CoolChangenode"
                  value="Cool"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(110, 64, 170)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(87, 97, 211)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(54, 140, 225)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(29, 186, 206)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(26, 212, 179)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(48, 239, 130)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(103, 247, 94)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(175, 240, 91)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="CubehelixDefaultChangenode"
                  value="CubehelixDefault"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(0, 0, 0)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(26, 39, 68)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(31, 102, 66)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(122, 122, 53)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(190, 121, 106)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(207, 156, 218)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(197, 222, 242)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(255, 255, 255)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="RainbowChangenode"
                  value="Rainbow"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(110, 64, 170)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(228, 65, 157)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(255, 120, 71)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(198, 214, 60)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(127, 246, 88)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(29, 223, 163)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(54, 140, 225)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(110, 64, 170)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="SinebowChangenode"
                  value="Sinebow"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 64, 64)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(202, 179, 1)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(88, 252, 42)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(6, 222, 154)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(6, 154, 222)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(88, 42, 252)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(202, 1, 179)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(255, 64, 64)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
              </td>
            </tr>
          </div>
          <td>
            <label class="text-muted h4">Sequential</label>
          </td>

          <div class="colorSubContainer">
            <tr class="rampContainerAndLabel">
              <td>
                <label class="text-muted h5" for="multiChangenode">
                  Multi Hue
                </label>
              </td>
              <td id="multiChangenode" class="rampContainer">
                <div
                  id="BuGnChangenode"
                  value="BuGn"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(247, 252, 253)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(229, 245, 249)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(204, 236, 230)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(153, 216, 201)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(102, 194, 164)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(65, 174, 118)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(35, 139, 69)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(0, 88, 36)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="BuPuChangenode"
                  value="BuPu"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(247, 252, 253)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(224, 236, 244)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(191, 211, 230)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(158, 188, 218)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(140, 150, 198)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(140, 107, 177)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(136, 65, 157)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(110, 1, 107)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="GnBuChangenode"
                  value="GnBu"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(247, 252, 240)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(224, 243, 219)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(204, 235, 197)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(168, 221, 181)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(123, 204, 196)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(78, 179, 211)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(43, 140, 190)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(8, 88, 158)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="OrRdChangenode"
                  value="OrRd"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 247, 236)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(254, 232, 200)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(253, 212, 158)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(253, 187, 132)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(252, 141, 89)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(239, 101, 72)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(215, 48, 31)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(153, 0, 0)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="PuBuGnChangenode"
                  value="PuBuGn"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 247, 251)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(236, 226, 240)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(208, 209, 230)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(166, 189, 219)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(103, 169, 207)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(54, 144, 192)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(2, 129, 138)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(1, 100, 80)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="PuBuChangenode"
                  value="PuBu"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 247, 251)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(236, 231, 242)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(208, 209, 230)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(166, 189, 219)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(116, 169, 207)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(54, 144, 192)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(5, 112, 176)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(3, 78, 123)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="PuRdChangenode"
                  value="PuRd"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(247, 244, 249)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(231, 225, 239)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(212, 185, 218)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(201, 148, 199)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(223, 101, 176)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(231, 41, 138)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(206, 18, 86)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(145, 0, 63)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="RdPuChangenode"
                  value="RdPu"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 247, 243)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(253, 224, 221)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(252, 197, 192)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(250, 159, 181)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(247, 104, 161)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(221, 52, 151)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(174, 1, 126)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(122, 1, 119)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="YlGnBuChangenode"
                  value="YlGnBu"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 255, 217)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(237, 248, 177)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(199, 233, 180)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(127, 205, 187)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(65, 182, 196)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(29, 145, 192)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(34, 94, 168)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(12, 44, 132)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="YlGnChangenode"
                  value="YlGn"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 255, 229)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(247, 252, 185)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(217, 240, 163)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(173, 221, 142)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(120, 198, 121)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(65, 171, 93)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(35, 132, 67)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(0, 90, 50)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="YlOrBrChangenode"
                  value="YlOrBr"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 255, 229)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(255, 247, 188)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(254, 227, 145)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(254, 196, 79)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(254, 153, 41)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(236, 112, 20)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(204, 76, 2)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(140, 45, 4)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="YlOrRdChangenode"
                  value="YlOrRd"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 255, 204)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(255, 237, 160)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(254, 217, 118)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(254, 178, 76)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(253, 141, 60)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(252, 78, 42)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(227, 26, 28)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(177, 0, 38)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
              </td>
            </tr>
            <tr class="rampContainerAndLabel">
              <td>
                <label class="text-muted h5" for="singleChangenode">
                  Single Hue
                </label>
              </td>
              <td class="ml-1" id="singleChangenode" class="rampContainer">
                <div
                  id="BluesChangenode"
                  value="Blues"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(247, 251, 255)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(222, 235, 247)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(198, 219, 239)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(158, 202, 225)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(107, 174, 214)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(66, 146, 198)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(33, 113, 181)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(8, 69, 148)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="GreensChangenode"
                  value="Greens"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(247, 252, 245)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(229, 245, 224)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(199, 233, 192)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(161, 217, 155)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(116, 196, 118)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(65, 171, 93)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(35, 139, 69)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(0, 90, 50)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="GreysChangenode"
                  value="Greys"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 255, 255)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(240, 240, 240)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(217, 217, 217)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(189, 189, 189)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(150, 150, 150)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(115, 115, 115)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(82, 82, 82)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(37, 37, 37)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="OrangesChangenode"
                  value="Oranges"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 245, 235)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(254, 230, 206)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(253, 208, 162)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(253, 174, 107)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(253, 141, 60)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(241, 105, 19)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(217, 72, 1)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(140, 45, 4)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="PurplesChangenode"
                  value="Purples"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(252, 251, 253)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(239, 237, 245)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(218, 218, 235)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(188, 189, 220)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(158, 154, 200)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(128, 125, 186)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(106, 81, 163)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(74, 20, 134)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
                <div
                  id="RedsChangenode"
                  value="Reds"
                  class="ramps"
                  onClick={(e) => selectColorRamp(e)}
                >
                  <svg width="15" height="120">
                    <rect
                      fill="rgb(255, 245, 240)"
                      width="15"
                      height="15"
                      y="0"
                    ></rect>
                    <rect
                      fill="rgb(254, 224, 210)"
                      width="15"
                      height="15"
                      y="15"
                    ></rect>
                    <rect
                      fill="rgb(252, 187, 161)"
                      width="15"
                      height="15"
                      y="30"
                    ></rect>
                    <rect
                      fill="rgb(252, 146, 114)"
                      width="15"
                      height="15"
                      y="45"
                    ></rect>
                    <rect
                      fill="rgb(251, 106, 74)"
                      width="15"
                      height="15"
                      y="60"
                    ></rect>
                    <rect
                      fill="rgb(239, 59, 44)"
                      width="15"
                      height="15"
                      y="75"
                    ></rect>
                    <rect
                      fill="rgb(203, 24, 29)"
                      width="15"
                      height="15"
                      y="90"
                    ></rect>
                    <rect
                      fill="rgb(153, 0, 13)"
                      width="15"
                      height="15"
                      y="105"
                    ></rect>
                  </svg>
                </div>
              </td>
            </tr>
          </div>
        </div>
      );
    } else if (color_type === "qualitative") {
      color_container = (
        <div class="col-md-9" id="colorPickerChangenode">
          <div class="rampContainerAndLabel">
            <label class="text-muted h5">Palette</label>
            <div class="rampContainer">
              <div
                id="Category10Changenode"
                value="Category10"
                class="ramps selected"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(31, 119, 180)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(255, 127, 14)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(44, 160, 44)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(214, 39, 40)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(148, 103, 189)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(140, 86, 75)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(227, 119, 194)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(127, 127, 127)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
              <div
                id="AccentChangenode"
                value="Accent"
                class="ramps"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(127, 201, 127)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(190, 174, 212)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(253, 192, 134)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(255, 255, 153)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(56, 108, 176)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(240, 2, 127)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(191, 91, 23)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(102, 102, 102)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
              <div
                id="Dark2Changenode"
                value="Dark2"
                class="ramps"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(27, 158, 119)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(217, 95, 2)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(117, 112, 179)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(231, 41, 138)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(102, 166, 30)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(230, 171, 2)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(166, 118, 29)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(102, 102, 102)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
              <div
                id="PairedChangenode"
                value="Paired"
                class="ramps"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(166, 206, 227)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(31, 120, 180)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(178, 223, 138)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(51, 160, 44)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(251, 154, 153)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(227, 26, 28)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(253, 191, 111)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(255, 127, 0)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
              <div
                id="Pastel1Changenode"
                value="Pastel1"
                class="ramps"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(251, 180, 174)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(179, 205, 227)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(204, 235, 197)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(222, 203, 228)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(254, 217, 166)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(255, 255, 204)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(229, 216, 189)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(253, 218, 236)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
              <div
                id="Pastel2Changenode"
                value="Pastel2"
                class="ramps"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(179, 226, 205)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(253, 205, 172)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(203, 213, 232)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(244, 202, 228)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(230, 245, 201)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(255, 242, 174)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(241, 226, 204)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(204, 204, 204)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
              <div
                id="Set1Changenode"
                value="Set1"
                class="ramps"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(228, 26, 28)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(55, 126, 184)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(77, 175, 74)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(152, 78, 163)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(255, 127, 0)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(255, 255, 51)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(166, 86, 40)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(247, 129, 191)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
              <div
                id="Set2Changenode"
                value="Set2"
                class="ramps"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(102, 194, 165)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(252, 141, 98)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(141, 160, 203)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(231, 138, 195)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(166, 216, 84)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(255, 217, 47)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(229, 196, 148)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(179, 179, 179)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
              <div
                id="Set3Changenode"
                value="Set3"
                class="ramps"
                onClick={(e) => selectColorRamp(e)}
              >
                <svg width="15" height="120">
                  <rect
                    fill="rgb(141, 211, 199)"
                    width="15"
                    height="15"
                    y="0"
                  ></rect>
                  <rect
                    fill="rgb(255, 255, 179)"
                    width="15"
                    height="15"
                    y="15"
                  ></rect>
                  <rect
                    fill="rgb(190, 186, 218)"
                    width="15"
                    height="15"
                    y="30"
                  ></rect>
                  <rect
                    fill="rgb(251, 128, 114)"
                    width="15"
                    height="15"
                    y="45"
                  ></rect>
                  <rect
                    fill="rgb(128, 177, 211)"
                    width="15"
                    height="15"
                    y="60"
                  ></rect>
                  <rect
                    fill="rgb(253, 180, 98)"
                    width="15"
                    height="15"
                    y="75"
                  ></rect>
                  <rect
                    fill="rgb(179, 222, 105)"
                    width="15"
                    height="15"
                    y="90"
                  ></rect>
                  <rect
                    fill="rgb(252, 205, 229)"
                    width="15"
                    height="15"
                    y="105"
                  ></rect>
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div class="row" id="NodesSemioColorRow">
      <div class="col-md-2">{color_menu}</div>
      {color_container}
    </div>
  );
};
