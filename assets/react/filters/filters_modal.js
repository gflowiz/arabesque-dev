import React, { useState } from "react";
import { filter } from "jszip/lib/object";

export const NewFilterModal = (props) => {
  let [targetLayer, settargetLayer] = useState("links");

  function save_and_close(e) {
    let target = targetLayer;
    let variable = document.getElementById("filterVariableSelect").value;
    let type = document.getElementById("filterTypeSelect").value;

    e.preventDefault();
    props.add_filter(target, variable, type);
  }

  console.log(targetLayer);
  let variableContainer;
  if (targetLayer === "links")
    variableContainer = (
      <div class="col-md-4">
        <label for="filterVariableSelect">Variable </label>
        <select class="custom-select" id="filterVariableSelect">
          <option value="origin">origin</option>
          <option value="dest">dest</option>
          <option value="count">count</option>
          <option value="distance">distance</option>
        </select>
      </div>
    );
  else if (targetLayer === "nodes")
    variableContainer = (
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
              {variableContainer}
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
                  <option selected=""></option>
                  <option value="categorial">Categorial</option>
                  <option value="numeral">Numeral</option>
                  <option value="remove">Remove</option>
                  <option value="temporal">One Category</option>
                  <option value="timeLapse">Temporal</option>
                </select>
              </div>
            </div>
          </div>
          <button
            class="modal-footer btn btn-dark justify-content-center mt-2"
            type="button"
            id="addFilterButton"
            data-dismiss="modal"
            onClick={save_and_close}
          >
            ADD FILTER
          </button>
        </div>
      </div>
    </div>
  );
};
