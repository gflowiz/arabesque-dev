import * as d3 from "d3";
import React from "react";
import { measureTextWidths } from "ol/render/canvas";

export default class BarChartFilter {
  constructor(
    variable,
    filter_id,
    dimension,
    group,
    render_all,
    delete_filter
  ) {
    this.variable = variable;
    this.filter_id = filter_id;
    this.margin = { top: 10, right: 13, bottom: 20, left: 10 };

    let ga = group.all();

    //Transform keys to float to prevent problems
    ga.map((d) => (d.key = parseFloat(d.key)));
    console.log(ga);

    this.domain = [+ga[0].key, +ga[ga.length - 1].key];
    //We add an offset to the domain so we can see and select the last bar of the graph
    this.offset_x = (this.domain[1] - this.domain[0]) / 10;
    this.x = d3
      .scaleLinear()
      .range([0, 200])
      .domain([this.domain[0], this.domain[1] + this.offset_x]);
    this.y = d3.scaleLinear().range([100, 0]);
    this.axis = d3.axisBottom().ticks(5);
    this.brush = d3.brushX();
    this.brushDirty = false;
    this.dimension = dimension;
    this.group = group;

    this.render_all = render_all;
    this.delete_filter = delete_filter;
    this.brush.on("brush.chart", this.brush_listener(this, null));
    this.filter_div = document.createElement("div");
    this.filter_div.id = filter_id;
    this.filter_div.className = "barchartFilter";
  }

  brush_listener(that, activeRange) {
    console.log("brush listener");
    return function () {
      console.log(activeRange);
      const g = d3.select(this.parentNode);
      console.log(g);
      console.log(this);

      if (activeRange === null) {
        const brushRange = d3.event.selection || d3.brushSelection(this); // attempt to read brush range
        activeRange = brushRange;
      }
      console.log(activeRange);

      const hasRange =
        activeRange &&
        activeRange.length === 2 &&
        !isNaN(activeRange[0]) &&
        !isNaN(activeRange[1]);

      if (!hasRange) return; // quit early if we don't have a valid range

      // calculate current brush extents using x scale
      let extents = activeRange.map(that.x.invert);
      console.log(extents);

      //We remove the offset that we added to the graph to display the real biggest value
      // extents[1] = extents[1] - that.offset_x;

      // move brush handles to start and end of range
      g.selectAll(".brush-handle")
        .style("display", null)
        .attr("transform", (d, i) => `translate(${activeRange[i]}, 0)`);

      // resize sliding window to reflect updated range
      g.select(`#clip-${that.filter_id} rect`)
        .attr("x", activeRange[0])
        .attr("width", activeRange[1] - activeRange[0]);

      // filter the active dimension to the range extents

      that.dimension.filterFunction(function (d) {
        return parseFloat(d) >= extents[0] && d <= extents[1];
      });

      // console.log(that.dimension.top(Infinity));

      document.getElementById(
        "filterMinInput-" + that.filter_id
      ).value = Math.round(extents[0]);
      document.getElementById(
        "filterMaxInput-" + that.filter_id
      ).value = Math.round(extents[1]);

      // re-render the other charts accordingly
      that.render_all();
      //Reset the active range to null so it can be both called by brush move listener
      //Or onFilterMinChange and onFilterMaxChange functions
      activeRange = null;
    };
  }

  //Creates chart
  chart(div) {
    console.log("chart()");
    const width = this.x.range()[1];
    const height = this.y.range()[0];

    this.brush.extent([
      [0, 0],
      //We add width/10 otherwise the biggest values are not included (I guess it's
      //because of the width of the last bar)
      [width, height],
    ]);

    let min = this.group.all()[0].key;
    let max = this.group.all()[this.group.all().length - 1].key;

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
        .attr("class", "barchart")
        .append("g")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      g.append("clipPath")
        .attr("id", `clip-${this.filter_id}`)
        .append("rect")
        .attr("width", width)
        .attr("height", height);

      g.selectAll(".bar")
        .data(["background", "foreground"])
        .enter()
        .append("path")
        .attr("class", (d) => `${d} bar`)
        .datum(this.group.all());

      g.selectAll(".foreground.bar").attr(
        "clip-path",
        `url(#clip-${this.filter_id})`
      );

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

        g.selectAll(`#clip-${this.filter_id} rect`)
          .attr("x", 0)
          .attr("width", width);

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

        for (let d of groups) {
          path.push(
            "M",
            that.x(+parseFloat(d.key)),
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
  }

  onFilterMinChange(event) {
    //Get min and max from inputs
    let min = parseFloat(event.target.value);

    if (min > this.domain[1] || min < this.domain[0]) {
      document
        .getElementById("filterMinInput-" + this.filter_id)
        .classList.add("is-invalid");
      return;
    } else {
      document
        .getElementById("filterMinInput-" + this.filter_id)
        .classList.remove("is-invalid");
    }

    let max = parseFloat(
      document.getElementById("filterMaxInput-" + this.filter_id).value
    );
    //Convert it to the chart scale
    let brush_range = [min, max].map(this.x);

    //Execute the brush_listener function
    const brush = document.getElementsByClassName("brush")[0];
    const brush_listener = this.brush_listener(this, brush_range).bind(brush);
    brush_listener();

    //Update the selection range on the graph
    let chart_selection = document.getElementsByClassName("selection")[0];
    chart_selection.setAttribute("x", brush_range[0]);
    chart_selection.setAttribute("width", brush_range[1] - brush_range[0]);
  }
  onFilterMaxChange(event) {
    //Get min and max from inputs
    let max = parseFloat(event.target.value);
    if (max > this.domain[1] || max < this.domain[0]) {
      document
        .getElementById("filterMaxInput-" + this.filter_id)
        .classList.add("is-invalid");
      return;
    } else {
      document
        .getElementById("filterMaxInput-" + this.filter_id)
        .classList.remove("is-invalid");
    }
    let min = parseFloat(
      document.getElementById("filterMinInput-" + this.filter_id).value
    );
    //Convert it to the chart scale
    let brush_range = [min, max].map(this.x);

    //Execute the brush_listener function
    const brush = document.getElementsByClassName("brush")[0];
    const brush_listener = this.brush_listener(this, brush_range).bind(brush);
    brush_listener();

    //Update the selection range on the graph
    let chart_selection = document.getElementsByClassName("selection")[0];
    chart_selection.setAttribute("x", brush_range[0]);
    chart_selection.setAttribute("width", brush_range[1] - brush_range[0]);
  }
  render_title() {
    let title_icon = document.createElement("img");
    title_icon.className = "flowFilterIcon";
    title_icon.src = "assets/svg/si-glyph-link.svg";

    let title_div = document.createElement("label");
    title_div.className = "filterTitle";
    title_div.innerHTML = this.variable;
    this.filter_div.appendChild(title_icon);
    this.filter_div.appendChild(title_div);
  }

  render_chart() {
    let chart_div = document.createElement("div");
    // chart_div.id = `chart-${target}-${id}-${type}`;
    //In order to resize the graph
    this.chart(chart_div);
    this.filter_div.appendChild(chart_div);
  }

  render_minmax_inputs() {
    let min_max_div = document.createElement("div");
    min_max_div.id = "filterMinMax";

    let minLabel = document.createElement("div");
    minLabel.innerHTML = "Min";
    minLabel.className = "minMaxLabel";

    let minInput = document.createElement("input");
    minInput.className = "form-control filterMinInput";
    minInput.id = "filterMinInput-" + this.filter_id;
    minInput.value = Math.round(this.group.all()[0].key);
    minInput.onchange = this.onFilterMinChange.bind(this);

    let maxLabel = document.createElement("div");
    maxLabel.innerHTML = "Max";
    maxLabel.className = "maxMaxLabel";

    let maxInput = document.createElement("input");
    maxInput.className = "form-control filterMaxInput";
    maxInput.id = "filterMaxInput-" + this.filter_id;
    maxInput.value = Math.round(
      this.group.all()[this.group.all().length - 1].key
    );
    maxInput.onchange = this.onFilterMaxChange.bind(this);

    let min_invalid_feedback = document.createElement("div");
    min_invalid_feedback.className = "invalid-feedback";
    min_invalid_feedback.innerHTML = "Value is out of range";

    let max_invalid_feedback = document.createElement("div");
    max_invalid_feedback.className = "invalid-feedback";
    max_invalid_feedback.innerHTML = "Value is out of range";

    min_max_div.appendChild(minLabel);
    min_max_div.appendChild(minInput);
    // min_max_div.appendChild(min_invalid_feedback);
    min_max_div.appendChild(maxLabel);
    min_max_div.appendChild(maxInput);
    min_max_div.appendChild(max_invalid_feedback);

    this.filter_div.appendChild(min_max_div);
  }

  render_trash_icon() {
    let trash_div = document.createElement("img");
    trash_div.className = "barchartTrashIcon";
    trash_div.src = "assets/svg/si-glyph-trash.svg";
    trash_div.onclick = this.delete_filter;

    this.filter_div.appendChild(trash_div);
  }

  render_bottom_line() {
    let line = document.createElement("div");
    line.className = "filterBottomLine";

    this.filter_div.appendChild(line);
  }

  render() {
    this.render_title();
    this.render_chart();
    this.render_trash_icon();
    this.render_minmax_inputs();
    this.render_bottom_line();
    return this.filter_div;
  }
}
