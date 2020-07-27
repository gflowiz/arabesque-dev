import React, { useState } from "react";

export const FilterContainer = (props) => {
  return (
    <div class="row align-items-center m-3 border-top border-secondary filter-bar">
      <img class="icon-filter" src="assets/svg/si-glyph-link.svg"></img>
      <label for="filterNumdistance" class="h5">
        distance
      </label>
      <div class="col-sm-11 p-0" id="filterNumdistance"></div>
      <div class="col-sm-1 p-0">
        <button
          type="button"
          class="close center-block"
          id="buttonFilterdistance"
          aria-label="Close"
        >
          <img class="icon" src="assets/svg/si-glyph-trash.svg"></img>
        </button>
      </div>
      <div class="col-sm-6">
        <div class="row">
          <div class="col-md-3">Min:</div>
          <div class="col-md-9">
            <input
              class="form-control"
              id="numMinFilterdistance"
              min="6.491051123632014"
              max="277.4746920145835"
              step="0.01"
              type="number"
            ></input>
          </div>
        </div>
      </div>
      <div class="col-sm-6">
        <div class="row">
          <div class="col-md-3">Max:</div>
          <div class="col-md-9">
            <input
              class="form-control"
              id="numMaxFilterdistance"
              min="6.491051123632014"
              max="277.4746920145835"
              step="0.01"
              type="number"
            ></input>
          </div>
        </div>
      </div>
    </div>
  );
};
