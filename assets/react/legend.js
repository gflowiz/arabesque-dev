import React, { useState } from "react";

export const LegendComponent = (props) => {
  let nodesColorMode = props.nstyle.color.mode;
  let nodesSizeMode = props.nstyle.size.mode;
  let linksColorMode = props.lstyle.color.mode;
  let linksSizeMode = props.lstyle.size.mode;
  let important_values = extract_important_values();
  console.log(props.nodes_hash);
  //Defining and filling the different containers of the legend
  let [
    nodesColorDiv,
    nodesSizeDiv,
    linksColorDiv,
    linksSizeDiv,
  ] = set_containers_style();

  //Round values and transform them into exponential notation if they are too long
  //(to prevent legend displaying problems)
  function round_and_shorten(number) {
    let rounded = Math.round(number * 10) / 10;

    let nb_digits = String(rounded).replace(".", "").length;

    if (nb_digits > 5) {
      return rounded.toExponential(1);
    }
    return rounded;
  }

  //Extract useful values for the legend (max, min)
  function extract_important_values() {
    let node_size_var = props.nstyle.size.varied.var;
    let node_color_var = props.nstyle.color.varied.var;

    //Getting min and max of links and nodes data so we can display it in the legend

    //First we look at the color variable

    let min_node_color_data = round_and_shorten(
      d3.min(
        props.nodes
          .filter((n) => parseFloat(n.properties[node_color_var]) !== NaN)
          .map((n) => parseFloat(n.properties[node_color_var]))
      )
    );

    let max_node_color_data = round_and_shorten(
      d3.max(
        props.nodes
          .filter((n) => parseFloat(n.properties[node_color_var]) !== NaN)
          .map((n) => parseFloat(n.properties[node_color_var]))
      )
    );

    //Then at the size variable
    let min_node_size_data = round_and_shorten(
      parseFloat(
        d3.min(
          props.nodes
            .filter((n) => parseFloat(n.properties[node_size_var]) !== NaN)
            .map((n) => parseFloat(n.properties[node_size_var]))
        )
      )
    );
    let max_node_size_data = round_and_shorten(
      parseFloat(
        d3.max(
          props.nodes
            .filter((n) => parseFloat(n.properties[node_size_var]) !== NaN)
            .map((n) => parseFloat(n.properties[node_size_var]))
        )
      )
    );

    let mid_node_size_data = round_and_shorten(
      parseFloat(
        d3.median(
          props.nodes
            .filter((n) => parseFloat(n.properties[node_size_var]) !== NaN)
            .map((n) => parseFloat(n.properties[node_size_var]))
        )
      )
    );

    //For the links, there is only one variable, which is value/count/volume
    let min_link_data = round_and_shorten(
      d3.min(
        props.links
          .filter((l) => parseFloat(l.value) !== NaN)
          .map((l) => parseFloat(l.value))
      )
    );

    let max_link_data = round_and_shorten(
      d3.max(
        props.links
          .filter((l) => parseFloat(l.value) !== NaN)
          .map((l) => parseFloat(l.value))
      )
    );

    let mid_link_data = round_and_shorten(
      d3.median(
        props.links
          .filter((l) => parseFloat(l.value) !== NaN)
          .map((l) => parseFloat(l.value))
      )
    );

    return {
      nodes: {
        color: { min: min_node_color_data, max: max_node_color_data },
        size: {
          min: min_node_size_data,
          mid: mid_node_size_data,
          max: max_node_size_data,
        },
      },
      links: { min: min_link_data, mid: mid_link_data, max: max_link_data },
    };
  }

  function set_containers_style() {
    let nodesColorDiv, nodesSizeDiv, linksColorDiv, linksSizeDiv;
    let nodes_colors = props.nstyle.color.varied.colors;
    let links_colors = props.lstyle.color.varied.colors;
    if (nodesColorMode === "varied") {
      nodesColorDiv = (
        <>
          <div id="nodesColorLegend" class="legendSubSubContainer">
            {color_ramp(
              nodes_colors,
              important_values.nodes.color.min,
              important_values.nodes.color.max,
              "nodes"
            )}
          </div>
        </>
      );
    } else {
      nodesColorDiv = <div></div>;
    }
    if (nodesSizeMode === "varied") {
      nodesSizeDiv = (
        <div id="nodesSizeLegend" class="legendSubSubContainer">
          {node_size_ramp(
            important_values.nodes.size.min,
            important_values.nodes.size.mid,
            important_values.nodes.size.max
          )}
        </div>
      );
    } else {
      nodesSizeDiv = <div></div>;
    }

    if (linksColorMode === "varied") {
      linksColorDiv = (
        <div id="linksColorLegend" class="legendSubSubContainer">
          {color_ramp(
            links_colors,
            important_values.links.min,
            important_values.links.max,
            "links"
          )}
        </div>
      );
    } else {
      linksColorDiv = <div></div>;
    }
    if (linksSizeMode === "varied") {
      linksSizeDiv = (
        <div id="linksSizeLegend" class="legendSubSubContainer"></div>
      );
    } else {
      linksSizeDiv = <div></div>;
    }
    return [nodesColorDiv, nodesSizeDiv, linksColorDiv, linksSizeDiv];
  }

  function color_ramp(colors, min, max, data_type) {
    let max_or_min = max;
    let visibility;
    let variable;
    if (data_type === "links") {
      variable = props.lstyle.color.varied.var;
    } else if (data_type === "nodes") {
      variable = props.nstyle.color.varied.var;
    }

    return (
      <div class="legendColorRamp">
        <div style={{ paddingBottom: "5%" }}>{variable.substring(0, 12)}</div>

        {colors.reverse().map((col) => {
          if (colors.indexOf(col) < 7 && colors.indexOf(col) > 0) {
            visibility = "hidden";
          }
          if (colors.indexOf(col) === colors.length - 1) {
            max_or_min = min;
            visibility = "visible";
          }

          return (
            <div class="colorAndLabel">
              <div
                id="legendColorRectangle"
                style={{
                  width: "28%",
                  height: "100%",
                  background: col,
                }}
              ></div>
              <div class="legendColorLabel" style={{ visibility: visibility }}>
                {max_or_min}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  function node_size_ramp(min, mid, max) {
    let max_radius = d3.max(
      Object.entries(props.nodes_hash).map((node) => node[1].radius)
    );
    //For log scale, we musn't have values equal to zero
    if (max_radius === 0 || max_radius === -Infinity) {
      max_radius = 0.01;
    }
    let min_radius = d3.min(
      Object.entries(props.nodes_hash).map((node) => node[1].radius)
    );
    if (min_radius === 0 || min_radius === -Infinity) {
      min_radius = 0.01;
    }
    let median_radius = d3.median(
      Object.entries(props.nodes_hash).map((node) => node[1].radius)
    );
    if (median_radius === 0 || median_radius === -Infinity) {
      median_radius = 0.01;
    }

    console.log(min_radius, median_radius, max_radius);
    let scale_type = props.nstyle.size.varied.scale;

    let size_scale;
    if (scale_type === "Linear") {
      size_scale = d3.scaleLinear();
    } else if (scale_type === "Sqrt") {
      size_scale = d3.scaleSqrt();
    } else if (scale_type === "Pow") {
      size_scale = d3.scalePow();
    } else if (scale_type === "Log") {
      size_scale = d3.scaleLog();
    }

    size_scale.range([1, 17]).domain([min_radius, max_radius]);

    return (
      <div class="legendSizeRamp">
        <div style={{ position: "absolute", top: "2em", left: "1%" }}>
          {props.nstyle.size.varied.var.substring(0, 12)}
        </div>
        <div class="legendCircles">
          <svg class="circleAndLabel">
            <circle
              class="legendSizeDrawing"
              cx="25%"
              cy="50%"
              r={size_scale(max_radius) + "%"}
              fill="red"
            ></circle>
            <text class="labelMin" x="50%" y="60%" fontSize="0.9em">
              {round_and_shorten(max)}
            </text>
          </svg>

          <svg class="circleAndLabel">
            <circle
              class="legendSizeDrawing"
              cx="25%"
              cy="50%"
              r={size_scale(median_radius) + "%"}
              fill="red"
            ></circle>
            <text class="labelMid" x="50%" y="60%" fontSize="0.9em">
              {round_and_shorten(mid)}
            </text>
          </svg>

          <svg class="circleAndLabel">
            <circle
              class="legendSizeDrawing"
              cx="25%"
              cy="50%"
              r={size_scale(min_radius) + "%"}
              fill="red"
            ></circle>
            <text class="labelMin" x="50%" y="60%" fontSize="0.9em">
              {round_and_shorten(min)}
            </text>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div id="legend">
      <div id="nodesLegend" class="legendSubContainer">
        <label style={{ position: "absolute", top: "0.5em" }}>Nodes</label>
        <>
          {" "}
          {nodesSizeDiv}
          {nodesColorDiv}
        </>
      </div>
      <div id="linksLegend" class="legendSubContainer">
        <label style={{ position: "absolute", top: "0.5em" }}>Links</label>
        <>
          {" "}
          {linksSizeDiv}
          {linksColorDiv}
        </>
      </div>
    </div>
  );
};
