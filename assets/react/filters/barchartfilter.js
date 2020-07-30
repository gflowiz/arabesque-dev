import * as d3 from "d3";
import React from "react";
import BarChartFilter from "../../js/barchartfilter";

export class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.id = props.id;
    this.data = props.data;

    this.dimension = this.create_dimension(this.id);
    this.group = this.dimension.group();
    this.render_all = props.render_all;

    this.margin = { top: 10, right: 13, bottom: 20, left: 10 };
    let ga = this.group.all();
    this.x = d3
      .scaleLinear()
      .range([0, 200])
      .domain([+ga[0].key, +ga[ga.length - 1].key]);
    this.y = d3.scaleLinear().range([100, 0]);
    this.axis = d3.axisBottom().ticks(5);
    this.brush = d3.brushX();
    this.brushDirty = false;

    this.brush.on("brush.chart", this.brush_listener(this));
    // console.log('BarChartFilter');
    // console.log(this)
  }

  brush_listener(that) {
    console.log("brush");
    return function () {
      const g = d3.select(this.parentNode);
      const brushRange = d3.event.selection || d3.brushSelection(this); // attempt to read brush range
      let activeRange = brushRange;
      console.log(brushRange);
      const hasRange =
        activeRange &&
        activeRange.length === 2 &&
        !isNaN(activeRange[0]) &&
        !isNaN(activeRange[1]);

      if (!hasRange) return; // quit early if we don't have a valid range

      // calculate current brush extents using x scale
      let extents = activeRange.map(that.x.invert);

      // move brush handles to start and end of range
      g.selectAll(".brush-handle")
        .style("display", null)
        .attr("transform", (d, i) => `translate(${activeRange[i]}, 0)`);

      // resize sliding window to reflect updated range
      g.select(`#clip-${that.id} rect`)
        .attr("x", activeRange[0])
        .attr("width", activeRange[1] - activeRange[0]);

      // filter the active dimension to the range extents
      that.dimension.filterRange(extents);

      document.getElementById("filterMinInput").value = Math.round(extents[0]);
      document.getElementById("filterMaxInput").value = Math.round(extents[1]);

      // re-render the other charts accordingly
      that.render_all();
    };
  }

  chart() {
    let div = document.createElement("div");
    const width = this.x.range()[1];
    const height = this.y.range()[0];

    this.brush.extent([
      [0, 0],
      [width, height],
    ]);

    this.y.domain([0, this.group.top(1)[0].value]);

    let g = d3.select(div).select("g");

    // Create the skeletal chart.
    if (g.empty()) {
      let w = width + this.margin.left + this.margin.right;
      let h = height + this.margin.top + this.margin.bottom;
      g = d3
        .select(div)
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .attr("width", "100%")
        .attr("height", "250px")
        .append("g")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      g.append("clipPath")
        .attr("id", `clip-${this.id}`)
        .append("rect")
        .attr("width", width)
        .attr("height", height);

      g.selectAll(".bar")
        .data(["background", "foreground"])
        .enter()
        .append("path")
        .attr("class", (d) => `${d} bar`)
        .datum(this.group.all());

      g.selectAll(".foreground.bar").attr("clip-path", `url(#clip-${this.id})`);

      g.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(this.x).ticks(5));
    }

    // Initialize the brush component with pretty resize handles.
    var gBrush = g.append("g").attr("class", "brush").call(this.brush);

    gBrush
      .selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }])
      .enter()
      .append("path")
      .attr("class", "brush-handle")
      .attr("cursor", "ew-resize")
      .attr("d", this.resizePath)
      .style("display", "none");

    // Only redraw the brush if set externally.
    if (this.brushDirty !== false) {
      const filterVal = brushDirty;
      this.brushDirty = false;

      div
        .select(".title a")
        .style("display", d3.brushSelection(div) ? null : "none");

      if (!filterVal) {
        g.call(this.brush);

        g.selectAll(`#clip-${this.id} rect`).attr("x", 0).attr("width", width);

        g.selectAll(".brush-handle").style("display", "none");
        renderAll();
      } else {
        const range = filterVal.map(x);
        this.brush.move(gBrush, range);
      }
    }

    g.selectAll(".bar").attr("d", barPathF(this));

    function barPathF(that) {
      return function barPath(groups) {
        const path = [];
        let i = -1;
        const n = groups.length;
        let d;
        while (++i < n) {
          d = groups[i];
          path.push(
            "M",
            that.x(+d.key),
            ",",
            height,
            "V",
            that.y(d.value),
            "h9V",
            height
          );
        }
        return path.join("");
      };
    }

    function resizePath(d) {
      const e = +(d.type === "e");
      const x = e ? 1 : -1;
      const y = height / 3;
      return `M${0.5 * x},${y}A6,6 0 0 ${e} ${6.5 * x},${y + 6}V${
        2 * y - 6
      }A6,6 0 0 ${e} ${0.5 * x},${2 * y}ZM${2.5 * x},${y + 8}V${2 * y - 8}M${
        4.5 * x
      },${y + 8}V${2 * y - 8}`;
    }

    this.brush.on("brush.chart", this.brush_listener(this));
    return { __html: div.childNodes[0].outerHTML };
  }

  create_dimension(vname) {
    let dim = this.data.crossfilters.dimension((l) => +l[vname]);
    this.data.filters[vname] = dim;

    // this.config.filters.push({
    //   id: vname,
    //   range: [
    //     +dim.group().all()[0].key,
    //     +dim.group().all()[dim.group().all().length - 1].key,
    //   ],
    // });

    return dim;
  }

  // create_barchart() {
  //   let div = document.createElement("div");
  //   div.id = "filter-count";
  //   this.chart(div);
  //   return div.outerHTML;
  // }

  render() {
    return [
      <div dangerouslySetInnerHTML={this.chart()}></div>,
      // <div class="row align-items-center m-3 border-top border-secondary filter-bar">
      //   <img class="icon-filter" src="assets/svg/si-glyph-link.svg"></img>
      //   <label for="filterNumdistance" class="h5">
      //     distance
      //   </label>
      //   <div class="col-sm-11 p-0" id="filterNumdistance"></div>
      //   <div class="col-sm-1 p-0">
      //     <button
      //       type="button"
      //       class="close center-block"
      //       id="buttonFilterdistance"
      //       aria-label="Close"
      //     >
      //       <img class="icon" src="assets/svg/si-glyph-trash.svg"></img>
      //     </button>
      //   </div>
      //   <div class="col-sm-6">
      //     <div class="row">
      //       <div class="col-md-3">Min:</div>
      //       <div class="col-md-9">
      //         <input
      //           class="form-control"
      //           id="numMinFilterdistance"
      //           min="6.491051123632014"
      //           max="277.4746920145835"
      //           step="0.01"
      //           type="number"
      //         ></input>
      //       </div>
      //     </div>
      //   </div>
      //   <div class="col-sm-6">
      //     <div class="row">
      //       <div class="col-md-3">Max:</div>
      //       <div class="col-md-9">
      //         <input
      //           class="form-control"
      //           id="numMaxFilterdistance"
      //           min="6.491051123632014"
      //           max="277.4746920145835"
      //           step="0.01"
      //           type="number"
      //         ></input>
      //       </div>
      //     </div>
      //   </div>
      // </div>,
    ];
  }
}