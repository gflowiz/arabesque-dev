import React, { useState } from "react";

export const FilterMinMax = (props) => {
  return [
    <div style={{ display: "flex", alignItems: "center" }}>Min</div>,
    <input
      style={{ margin: "5%" }}
      class="form-control"
      id="filterMinInput"
    ></input>,
    <div style={{ display: "flex", alignItems: "center" }}>Max</div>,
    <input
      style={{ margin: "5%" }}
      class="form-control"
      id="filterMaxInput"
    ></input>,
  ];
};
