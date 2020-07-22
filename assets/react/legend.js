import React, { useState } from "react";

export const LegendComponent = (props) => {
  let nodesColorMode = props.nstyle.color.mode;
  let nodesSizeMode = props.nstyle.size.mode;
  let linksColorMode = props.lstyle.color.mode;
  let linksSizeMode = props.lstyle.size.mode;
  let important_values = extract_important_values();
  // console.log(props);

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
          <div
            id="nodesColorLegend"
            class="legendSubSubContainer smallSubSubContainer"
          >
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
        <div
          id="nodesSizeLegend"
          class="legendSubSubContainer bigSubSubContainer"
        >
          {node_size_container(
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
        <div
          id="linksColorLegend"
          class="legendSubSubContainer smallSubSubContainer"
        >
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
        <div
          id="linksSizeLegend"
          class="legendSubSubContainer bigSubSubContainer"
        >
          {link_size_container(
            important_values.links.min,
            important_values.links.mid,
            important_values.links.max
          )}
        </div>
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
    let style;
    if (data_type === "links") {
      variable = props.lstyle.color.varied.var;
      style = props.lstyle;
    } else if (data_type === "nodes") {
      variable = props.nstyle.color.varied.var;
      style = props.nstyle;
    }

    return (
      <div class="legendColorRamp">
        <div style={{ paddingBottom: "5%" }}>{variable.substring(0, 12)}</div>
        {/* 
        We set the conditional rendering of the label min and max (only if it's quantitative,
        otherwise there is no min and max) */}

        {colors.map((col, i) => {
          if (i < 7 && i > 0) {
            visibility = "hidden";
          }
          if (i === colors.length - 1) {
            max_or_min = min;
            visibility = "visible";
          }

          //Hide the labels if it's qualitatiative (no min and max)
          if (style.color.varied.type === "qualitative") visibility = "hidden";

          return (
            <div class="colorAndLabel">
              <div
                id="legendColorRectangle"
                style={{
                  width: "34%",
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
  function node_size_container(min, mid, max) {
    //Compute the size of the direct parent of the circles (#legendCircleContainer),
    // in order to prevent overflowing. We can't directly compute its width
    //as it's not rendered yet
    let container_width =
      ((document.getElementById("Mapcontainer").clientWidth * 0.7) / 4) * 0.64;

    //Circles radius in pixels
    let max_radius = d3.max(
      Object.entries(props.nodes_hash).map((node) => node[1].radius_px)
    );

    let min_radius = d3.min(
      Object.entries(props.nodes_hash).map((node) => node[1].radius_px)
    );

    return (
      <div id="legendCircleContainer">
        <div class="subContainerLabel">
          {props.nstyle.size.varied.var.substring(0, 10)}
        </div>
        {getCircles(min_radius, max_radius, container_width)}
      </div>
    );
  }
  function getCircles(min_radius, max_radius, container_width) {
    let [smallCircleRadius, setSmallCircleRadius] = useState(min_radius);
    //Minimum visible difference between two circles, in % of the div legendCircles
    let min_vis_diff = 4;
    //Minimum radius that we can display (in % too)
    let minimum_radius = 2;
    if (max_radius < minimum_radius)
      return (
        <div class="zoomOutMessage">
          Circles are too small to be displayed. Zoom in to see them
        </div>
      );

    let onlyBigCircle = (
      <>
        <svg id="legendCircles">
          <circle
            id="bigLegendSizeDrawing"
            cx="52%"
            cy="50%"
            r={max_radius}
            fill="black"
          ></circle>
        </svg>
        <div class="circleOneLabel">
          {round_and_shorten(
            pixelWidthToValue(max_radius, props.node_size_scale, props.map)
          )}
        </div>
      </>
    );
    let onlySmallCircle = (
      <>
        <svg id="legendCircles">
          <circle
            id="bigLegendSizeDrawing"
            cx="52%"
            cy="50%"
            r={smallCircleRadius}
            fill="black"
          ></circle>
        </svg>
        <div class="circleOneLabel">
          {round_and_shorten(
            pixelWidthToValue(
              smallCircleRadius,
              props.node_size_scale,
              props.map
            )
          )}
        </div>
      </>
    );

    //If it's too big (radius > 50% of his parent div)
    if (max_radius > container_width * 0.5) {
      return onlySmallCircle;
    }

    if (smallCircleRadius > container_width * 0.5)
      return (
        <div class="zoomOutMessage">
          Zoom out to see this part of the legend
        </div>
      );

    //If there isn't enough difference between the sizes of the small and big circles,
    //We only display the big one
    if (max_radius - smallCircleRadius < min_vis_diff) {
      return onlyBigCircle;
    }
    //If the difference between the big and small circle is big enough, but that the small
    //circle is to small to be displayed, we look for another value in the quantiles of
    //the distribution
    if (smallCircleRadius < minimum_radius) {
      let smallCircleGoodSize;
      for (let i = 0.1; i <= 0.9; i += 0.1) {
        i = Math.round(i * 10) / 10;

        let quantile_i_radius = d3.quantile(
          Object.entries(props.nodes_hash)
            .map((node) => node[1].radius_px)
            .sort(),
          i
        );

        //If these two conditions are filled, the value is good enough
        if (
          quantile_i_radius > minimum_radius &&
          max_radius - quantile_i_radius > min_vis_diff
        ) {
          smallCircleGoodSize = quantile_i_radius;
          break;
        }
      }
      //If we didn't find any good value, we display the single big circle
      if (smallCircleGoodSize === undefined) return onlyBigCircle;
      //If we did, we set the state so the function will re-execute and directly
      //reach the last "return" (underneath)
      else setSmallCircleRadius(smallCircleGoodSize);
    }
    return [
      <svg id="legendCircles">
        <circle
          id="bigLegendSizeDrawing"
          cx="52%"
          cy="35%"
          r={max_radius}
          fill="red"
        ></circle>
        <circle
          id="medianLegendSizeDrawing"
          cx="52%"
          cy="85%"
          r={smallCircleRadius}
          fill="blue"
        ></circle>
      </svg>,
      <div class="circleTwoLabels">
        <div
          // class="circleOneLabel"
          style={{
            height: "70%",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "80%" }}>
            {" "}
            {round_and_shorten(
              pixelWidthToValue(max_radius, props.node_size_scale, props.map)
            )}
          </div>
        </div>
        <div
          // class="circleOneLabel"
          style={{
            height: "30%",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {" "}
          <div style={{ fontSize: "80%" }}>
            {" "}
            {round_and_shorten(
              pixelWidthToValue(
                smallCircleRadius,
                props.node_size_scale,
                props.map
              )
            )}
          </div>
        </div>
      </div>,
    ];
  }
  function link_size_container(min, mid, max) {
    for (let a of Object.entries(props.links_hash)) {
    }
    //Circles radius in pixels
    let max_width = d3.max(
      Object.entries(props.links_hash).map((link) => link[1].width_px)
    );

    let min_width = d3.min(
      Object.entries(props.links_hash).map((link) => link[1].width_px)
    );

    let median_width = d3.median(
      Object.entries(props.links_hash).map((link) => link[1].width_px)
    );

    //Compute the size of the direct parent of the circles, in order to prevent
    //Overflowing. We can't directly compute its width as it's not rendered yet
    let container_height =
      document.getElementById("Mapcontainer").clientHeight * 0.35 * 0.723;
    if (max_width > container_height * 0.25) {
      return (
        <div class="zoomOutMessage">
          Zoom out to see this part of the legend
        </div>
      );
    }

    return [
      <div style={{ position: "absolute", top: "2em", left: "60%" }}>
        {props.lstyle.size.varied.var.substring(0, 12)}
      </div>,
      <svg id="legendLinkSquares">
        <rect
          class="legendSizeDrawing"
          x="40%"
          y="25%"
          // r={size_scale(max_radius) + "%"}
          height={max_width + "px"}
          width="40%"
          fill="none"
          stroke="black"
          strokeWidth="1px"
        ></rect>
        <rect
          class="legendSizeDrawing"
          x="40%"
          y="55%"
          // r={size_scale(median_width) + "%"}
          height={median_width + 1 + "px"}
          width="40%"
          fill="none"
          stroke="black"
          strokeWidth="1px"
        ></rect>
        <rect
          class="legendSizeDrawing"
          x="40%"
          y="85%"
          // r={size_scale(min_width) + "%"}
          height={min_width + 1 + "px"}
          width="40%"
          fill="none"
          stroke="black"
          strokeWidth="1px"
        ></rect>
      </svg>,
    ];
  }

  function pixelWidthToValue(radius_px, size_scale, map) {
    let resolution = map.getView().getResolution();
    let radius_m = radius_px * resolution;
    let value = size_scale.invert(radius_m);

    return value;
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
