import React, { useState } from "react";
import { BarChart } from "./barchart";

export const Filters = (props) => {
  console.log(props);
  let filters = props.config.filters;
  for (let filter of filters) {
    return (
      <BarChart
        id={filter.id}
        data={props.data}
        render_all={props.render_all}
      />
    );
  }
};
