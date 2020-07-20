import React, { useState } from "react";

import { ColorContainerComponent } from "./link_color_container";
import { SizeContainerComponent } from "./link_size_container";
import { OpacityContainerComponent } from "./link_opacity_container";

export const LinksSemioModalComponent = (props) => {
  //Props is what you receive from parent component
  let links_properties = props.links_properties;
  let semio = props.semio;
  console.log(semio, links_properties);
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
      let color_picker = document.getElementById("linkSingleColorPicker");
      semio.color.fixed = color_picker.value;
    } else if (modes.color === "varied") {
      semio.color.mode = "varied";
      let color_ramp = document.getElementsByClassName("selectedRamp")[0];
      if (color_ramp === undefined) {
        document.getElementById("linkColorAlertMessage").innerHTML =
          "Pick a color";
        return false;
      }
      //Empty the alert messages
      document.getElementById("colorAlertMessage").innerHTML = "";

      let colors = [];
      color_ramp.childNodes[0].childNodes.forEach((el) =>
        colors.push(el.getAttribute("fill"))
      );
      semio.color.varied = { colors: colors };

      //Check if inverted input is checked
      let inverseCheckBox = document.getElementById("linkInvertedColorPalette");
      if (inverseCheckBox.checked === true) {
        semio.color.varied.inverted = true;
        semio.color.varied.colors = semio.color.varied.colors.reverse();
      } else {
        semio.color.varied.inverted = false;
      }
      //Extract discretization variable
      let variable = document.getElementById("linkColorVariable").value;
      semio.color.varied.var = variable;
      //Extract color discretization type
      let color_type = document.getElementById("linkColorType").value;
      semio.color.varied.type = color_type;
    }
  }
  function extract_size(semio) {
    if (modes.size === "fixed") {
      semio.size.mode = "fixed";
      let width = document.getElementById("ratioMinMaxSizeChangeLink").value;

      if (width === "") {
        //We add invalid class if value is not correct
        let ratioDiv = document.getElementById("ratioMinMaxSizeChangeLink");
        ratioDiv.classList.add("is-invalid");
        ratioDiv.onchange = (e) => ratioDiv.classList.remove("is-invalid");
        return false;
      }

      semio.size.fixed = parseFloat(width);
    } else if (modes.size === "varied") {
      semio.size.mode = "varied";
      let variable = document.getElementById("semioSelectorSizeChangeLink")
        .value;
      let scale = document.getElementById("typeSizeChangeLink").value;
      let ratio = document.getElementById("ratioMinMaxSizeChangeLink").value;

      if (ratio === "") {
        let ratioDiv = document.getElementById("ratioMinMaxSizeChangeLink");
        ratioDiv.classList.add("is-invalid");
        ratioDiv.onchange = (e) => ratioDiv.classList.remove("is-invalid");
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
      let opacity = document.getElementById("ratioMaxOpaChangeLink").value;
      if (opacity === "") {
        let ratioDiv = document.getElementById("ratioMaxOpaChangeLink");
        ratioDiv.classList.add("is-invalid");
        ratioDiv.onchange = (e) => ratioDiv.classList.remove("is-invalid");
        return false;
      }
      if (opacity < 0 || opacity > 1) {
        let ratioDiv = document.getElementById("ratioMaxOpaChangeLink");
        ratioDiv.classList.add("is-invalid");
        ratioDiv.onchange = (e) => ratioDiv.classList.remove("is-invalid");
        return false;
      }
      semio.opacity.fixed = parseFloat(opacity);
    } else if (modes.opacity === "varied") {
      semio.opacity.mode = "varied";
      let variable = document.getElementById("semioSelectorOpaChangeLink")
        .value;
      let scale = document.getElementById("typeOpaChangeLink").value;
      let min = document.getElementById("ratioMinOpaChangeLink").value;

      let max = document.getElementById("ratioMaxOpaChangeLink").value;

      if (min === "" || max === "") {
        if (min === "") {
          let ratioDiv = document.getElementById("ratioMinOpaChangeLink");
          ratioDiv.classList.add("is-invalid");
          ratioDiv.onchange = (e) => ratioDiv.classList.remove("is-invalid");
        }
        if (max === "") {
          let ratioDiv = document.getElementById("ratioMaxOpaChangeLink");
          ratioDiv.classList.add("is-invalid");
          ratioDiv.onchange = (e) => ratioDiv.classList.remove("is-invalid");
        }
        return false;
      }
      if (min < 0 || min > 1 || max < 0 || max > 1) {
        if (min < 0 || min > 1) {
          let ratioDiv = document.getElementById("ratioMinOpaChangeLink");
          ratioDiv.classList.add("is-invalid");
          ratioDiv.onchange = (e) => ratioDiv.classList.remove("is-invalid");
        }
        if (max < 0 || max > 1) {
          let ratioDiv = document.getElementById("ratioMaxOpaChangeLink");
          ratioDiv.classList.add("is-invalid");
          ratioDiv.onchange = (e) => ratioDiv.classList.remove("is-invalid");
        }
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

    let ext_opacity = extract_opacity(semio);

    //We block the extraction if a field is missing or not filled properly
    if (ext_colors === false || ext_size === false || ext_opacity === false) {
      return;
    }

    //Send new semio to controller
    props.update_semio(semio);
  }

  return (
    <div
      class="modal fade"
      id="semioLinks"
      tabindex="-1"
      role="dialog"
      aria-labelledby="semioModalLabelLink"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title h2" id="semioModalLabelNode">
              Choose Links Semiology
            </h5>
          </div>
          <div class="modal-body">
            {/* Call the colorcontainer with links_properties for displaying in a select div */}
            <ColorContainerComponent
              //Allow to notify is mode is fixed or varied
              notify_state_change={(newState) => (modes.color = newState)}
              //Allow to notify if discretisation type is quantitative or qualitative
              notify_type_change={(newState) => (modes.color_type = newState)}
              links_properties={links_properties}
              semio={semio}
            />

            <hr></hr>
            <label for="select" class="h4 strong">
              Size
            </label>
            <SizeContainerComponent
              notify_state_change={(newState) => (modes.size = newState)}
              links_properties={links_properties}
              semio={semio}
            />
            <div class="row">
              <div class="col-md-10">
                <hr></hr>
                <label for="select" class="h4 strong">
                  Opacity
                </label>
                <OpacityContainerComponent
                  notify_state_change={(newState) => (modes.opacity = newState)}
                  links_properties={links_properties}
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
