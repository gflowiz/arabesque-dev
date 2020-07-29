import React from "react";
import BarChartFilter from "../../js/barchartfilter";

export const BarChart = (props) => {
  let id = props.id;
  let data = props.data;
  let render_all = props.render_all;
  let dimension = create_dimension(id);
  let group = dimension.group();
  let f = new BarChartFilter(id, dimension, group, render_all);
  let div = document.createElement("div");
  div.id = "filter-" + id;
  f.chart(div);
  let html_div = { __html: div.outerHTML };

  function create_dimension(vname) {
    let dim = data.crossfilters.dimension((l) => +l[vname]);
    data.filters[vname] = dim;

    // this.config.filters.push({
    //   id: vname,
    //   range: [
    //     +dim.group().all()[0].key,
    //     +dim.group().all()[dim.group().all().length - 1].key,
    //   ],
    // });

    return dim;
  }
  return <div dangerouslySetInnerHTML={html_div}></div>;
};
