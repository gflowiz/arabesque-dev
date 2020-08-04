import React, { useState } from "react";
import { filter } from "jszip/lib/object";

export const NewFilterModal = (props) => {
  let [targetLayer, settargetLayer] = useState("links");
  let [linksVariable, setLinksVariable] = useState("origin");
  console.log(props);

  function save_and_close(e) {
    let target = targetLayer;
    let variable = document.getElementById("filterVariableSelect").value;
    let type = document.getElementById("filterTypeSelect").value;

    e.preventDefault();
    e.stopPropagation();
    props.add_filter(target, variable, type);
  }
  function changeLinksVariable(e) {
    console.log(e.target.value);
    setLinksVariable(e.target.value);
  }

  //Filling the variable and filter type <select>
  let variableSelect, typeOptions;
  if (targetLayer === "links") {
    variableSelect = (
      <div class="col-md-4">
        <label for="filterVariableSelect">Variable </label>
        <select
          class="custom-select"
          id="filterVariableSelect"
          onChange={changeLinksVariable}
        >
          {Object.entries(props.links_properties).map((prop) => (
            <option value={prop[0]}>{prop[0]}</option>
          ))}
        </select>
      </div>
    );
    //If the selected variable is origin or dest, we can't have a barchart filter
    //(it is only for numeral values)
    if (isNaN(props.links_properties[linksVariable]))
      typeOptions = [
        { value: "categorial", label: "Categorial" },
        { value: "remove", label: "Remove" },
        { value: "temporal", label: "One Category" },
        { value: "timeLapse", label: "Temporal" },
      ];
    else
      typeOptions = [
        { value: "categorial", label: "Categorial" },
        { value: "numeral", label: "Bar Chart" },
        { value: "remove", label: "Remove" },
        { value: "temporal", label: "One Category" },
        { value: "timeLapse", label: "Temporal" },
      ];
  } else if (targetLayer === "nodes")
    variableSelect = (
      <div class="col-md-4">
        <label for="valueTofilter">Variable </label>
        <select class="custom-select" id="valueTofilter">
          {props.nodes_properties.map((p) => (
            <option value={p}>{p}</option>
          ))}
        </select>
      </div>
    );
  return (
    <div
      class="modal fade show"
      id="FilterModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      style={{ display: "block" }}
      aria-modal="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              New Filter
            </h5>
          </div>
          <div class="modal-body" id="filterLayerBody">
            <div class="row">
              <div class="col-md-4">
                <label for="filteredLayer">Layer </label>
                <select
                  class="custom-select"
                  id="filteredLayer"
                  onChange={(e) => setFilterLayer(e.target.value)}
                >
                  <option value="links" selected>
                    Links
                  </option>
                  <option value="nodes">Nodes</option>
                </select>
              </div>
              {variableSelect}
              <div class="col-md-4">
                <label for="filterTypeSelect">
                  Type{" "}
                  <img
                    class="small-icon"
                    data-html="true"
                    data-container="body"
                    data-toggle="popover"
                    data-placement="right"
                    data-content="- Categorial => qualitative selector  <br />- Remove => qualitative removal <br /> - One Category => quick selector of one category <br />  - Numeral => quantitative selector <br /> Temporal => Select time area (must precise a time format)"
                    title=""
                    src="assets/svg/si-glyph-circle-info.svg"
                    data-original-title="Select the type of filter:"
                  ></img>
                </label>
                <select class="custom-select" id="filterTypeSelect">
                  {typeOptions.map((opt) => (
                    <option value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div class="invalid-feedback">
                  A filter already exists for these parameters
                </div>
              </div>
            </div>
          </div>
          <button
            class="modal-footer btn btn-dark justify-content-center mt-2"
            type="button"
            id="addFilterButton"
            onClick={save_and_close}
          >
            ADD FILTER
          </button>
        </div>
      </div>
    </div>
  );
};
