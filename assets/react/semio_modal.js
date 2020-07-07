import React, { useState } from "react";

import { ColorContainerComponent } from "./color_container";
import { SizeContainerComponent } from "./size_container";
import { OpacityContainerComponent } from "./opacity_container";

export const NodesSemioModalComponent = (props) => {
  //Props is what you receive from parent component
  let nodes_properties = props.nodes_properties;
  let semio = props.semio;
  console.log(semio, nodes_properties);
  //Keep track of the different modes in the modal (fixed/varied)
  let modes = {
    color: "fixed",
    color_type: null,
    size: "fixed",
    opacity: "fixed",
  };

  function extract_colors(semio) {
    //Extract colors
    if (modes.color === "fixed") {
      semio.color.mode = "fixed";
      let color_picker = document.getElementById("singleColorPicker");
      semio.color.fixed = color_picker.value;
    } else if (modes.color === "varied") {
      semio.color.mode = "varied";
      let color_ramp = document.getElementsByClassName("selectedRamp")[0];
      if (color_ramp === undefined) {
        alert("Pick a color");
        return false;
      }
      let colors = [];
      color_ramp.childNodes[0].childNodes.forEach((el) =>
        colors.push(el.getAttribute("fill"))
      );
      semio.color.varied = { colors: colors };

      //Check if inverted input is checked
      let inverseCheckBox = document.getElementById("inversedColorPalette");
      if (inverseCheckBox.checked === true) {
        semio.color.varied.inverted = true;
        semio.color.varied.colors = semio.color.varied.colors.reverse();
      } else {
        semio.color.varied.inverted = false;
      }
      //Extract discretization variable
      let variable = document.getElementById("colorVariable").value;
      semio.color.varied.var = variable;
      //Extract color discretization type
      let color_type = document.getElementById("colorType").value;
      semio.color.varied.type = color_type;
    }
  }
  function extract_size(semio) {
    if (modes.size === "fixed") {
      semio.size.mode = "fixed";
      let width = document.getElementById("ratioMinMaxSizeChangenode").value;

      if (width === "") {
        alert("Enter a width");
        return false;
      }

      semio.size.fixed = parseFloat(width);
    } else if (modes.size === "varied") {
      semio.size.mode = "varied";
      let variable = document.getElementById("semioSelectorSizeChangenode")
        .value;
      let scale = document.getElementById("typeSizeChangenode").value;
      let ratio = document.getElementById("ratioMinMaxSizeChangenode").value;

      if (ratio === "") {
        alert("Enter a ratio");
        return false;
      }
      semio.size.varied = {
        var: variable,
        scale: scale,
        maxval: parseFloat(ratio),
      };
    }
  }
  function extract_opacity(semio) {
    if (modes.opacity === "fixed") {
      semio.opacity.mode = "fixed";
      let opacity = document.getElementById("ratioMaxOpaChangenode").value;
      if (opacity === "") {
        alert("Enter opacity");
        return false;
      }
      if (opacity < 0 || opacity > 1) {
        alert("Opacity must be between 0 and 1 ");
        return false;
      }
      semio.opacity.fixed = parseFloat(opacity);
    } else if (modes.opacity === "varied") {
      semio.opacity.mode = "varied";
      let variable = document.getElementById("semioSelectorOpaChangenode")
        .value;
      let scale = document.getElementById("typeOpaChangenode").value;
      let min = document.getElementById("ratioMinOpaChangenode").value;

      let max = document.getElementById("ratioMaxOpaChangenode").value;

      if (min === "" || max === "") {
        alert("Enter opacity minimum and maximum");
        return false;
      }
      if (min < 0 || min > 1 || max < 0 || max > 1) {
        alert("Minimum and maximum opacity must be between 0 and 1");
        return false;
      }
      semio.opacity.varied = {
        var: variable,
        scale: scale,
        min: parseFloat(min),
        max: parseFloat(max),
      };
    }
  }
  //When the OK button is clicked, extract color, size, text and opacity from the modal
  //and send it back to the controller via the view's callback function
  function save_and_close() {
    let ext_colors = extract_colors(semio);

    let ext_size = extract_size(semio);
    semio.text.fixed = document.getElementById(
      "semioSelectorTextChangenode"
    ).value;
    let ext_opacity = extract_opacity(semio);

    //We block the extraction if a field is missing or not filled properly
    if (ext_colors === false || ext_size === false || ext_opacity === false) {
      return;
    }

    //Send new semio to controller
    props.update_semio(semio);
    //Close modal
  }

  return (
    <div
      class="modal fade"
      id="semioNodes"
      tabindex="-1"
      role="dialog"
      aria-labelledby="semioModalLabelNode"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title h2" id="semioModalLabelNode">
              Choose Nodes Semiology
            </h5>
          </div>
          <div class="modal-body">
            {/* Call the colorcontainer with nodes_properties for displaying in a select div */}
            <ColorContainerComponent
              //Allow to notify is mode is fixed or varied
              notify_state_change={(newState) => (modes.color = newState)}
              //Allow to notify if discretisation type is quantitative or qualitative
              notify_type_change={(newState) => (modes.color_type = newState)}
              nodes_properties={nodes_properties}
              semio={semio}
            />

            <hr></hr>
            <label for="select" class="h4 strong">
              Size
            </label>
            <SizeContainerComponent
              notify_state_change={(newState) => (modes.size = newState)}
              nodes_properties={nodes_properties}
              semio={semio}
            />
            <div class="row">
              <div class="col-md-2">
                <hr></hr>
                <label for="select" class="h4 strong">
                  Text
                </label>
                <div class="row" id="semioTextAddnode">
                  <div class="col-md-12">
                    <label class="text-muted h5">Variable</label>
                    <select
                      class="custom-select"
                      id="semioSelectorTextChangenode"
                      defaultValue={semio.text.fixed}
                    >
                      {/* We can iterate on the nodes properties to fill the select div  */}
                      {Object.keys(nodes_properties).map((p) => (
                        <option value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div class="col-md-10">
                <hr></hr>
                <label for="select" class="h4 strong">
                  Opacity
                </label>
                <OpacityContainerComponent
                  notify_state_change={(newState) => (modes.opacity = newState)}
                  nodes_properties={nodes_properties}
                  semio={semio}
                />
              </div>
            </div>
          </div>
          <button
            class="modal-footer btn btn-dark justify-content-center mt-2"
            type="button"
            id="addSemioButtonNode"
            onClick={save_and_close}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
