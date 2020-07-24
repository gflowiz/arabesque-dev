import React, { useState } from "react";
import { Circles } from "./circles";
import { Rectangles } from "./rectangles";

export function pxToMeters(px_length, map) {
  return px_length * map.getView().getResolution();
}

export function pixelWidthToValue(radius_px, size_scale, map) {
  let resolution = map.getView().getResolution();
  let radius_m = radius_px * resolution;
  let value = size_scale.invert(radius_m);

  return value;
}

//Round values and transform them into exponential notation if they are too long
//(to prevent legend displaying problems)
export function round_and_shorten(number) {
  let rounded = Math.round(number * 10) / 10;

  let nb_digits = String(rounded).replace(".", "").length;

  if (nb_digits > 5) {
    return rounded.toExponential(1);
  }
  return rounded;
}

export const LegendComponent = (props) => {
  let nodesColorMode = props.nstyle.color.mode;
  let nodesSizeMode = props.nstyle.size.mode;
  let linksColorMode = props.lstyle.color.mode;
  let linksSizeMode = props.lstyle.size.mode;
  let important_values = extract_important_values();

  //Defining and filling the different containers of the legend
  let [nodeContainer, linkContainer] = get_containers();

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

  function get_containers() {
    let nodesColorDiv, nodesSizeDiv, linksColorDiv, linksSizeDiv;
    let nodes_colors = props.nstyle.color.varied.colors;
    let links_colors = props.lstyle.color.varied.colors;

    if (nodesColorMode === "varied") {
      nodesColorDiv = (
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
          {node_size_container()}
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
          {link_size_container()}
        </div>
      );
    } else {
      linksSizeDiv = <div></div>;
    }

    //If the two subcontainers of each container are empty, the container is empty
    let nodeContainer, linkContainer;
    if (nodesColorMode === "fixed" && nodesSizeMode === "fixed") {
      nodeContainer = <div></div>;
    } else
      nodeContainer = (
        <div id="nodesLegend" class="legendSubContainer">
          <label
            style={{ position: "absolute", top: "0.5em", fontWeight: "bold" }}
          >
            Nodes
          </label>
          {nodesSizeDiv}
          {nodesColorDiv}
        </div>
      );
    if (linksColorMode === "fixed" && linksSizeMode === "fixed")
      linkContainer = <div></div>;
    else
      linkContainer = (
        <div id="linksLegend" class="legendSubContainer">
          <label
            style={{ position: "absolute", top: "0.5em", fontWeight: "bold" }}
          >
            Links
          </label>
          {linksSizeDiv}
          {linksColorDiv}
        </div>
      );

    return [nodeContainer, linkContainer];
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
  function node_size_container() {
    //Compute the size of the direct parent of the circles (#legendCircleContainer),
    // in order to prevent overflowing. We can't directly compute its width
    //as it's not rendered yet
    let container_width =
      ((document.getElementById("Mapcontainer").clientWidth * 0.7) / 4) * 0.64;

    let container_height =
      document.getElementById("Mapcontainer").clientHeight * 0.35 * 0.95 * 0.7;

    //Circles radius in pixels
    let max_radius = d3.max(
      Object.entries(props.nodes_hash).map((node) => node[1].radius_px)
    );

    let min_radius = d3.min(
      Object.entries(props.nodes_hash).map((node) => node[1].radius_px)
    );

    return (
      <div id="legendCircleContainer">
        {/* <div
          class="subContainerLabel"
          style={{ left: placeLabels("node", "size") }}
        >
          {props.nstyle.size.varied.var.substring(0, 10)}
        </div> */}
        {/* {getCircles(min_radius, max_radius, container_width)} */}
        <Circles
          map={props.map}
          node_size_scale={props.node_size_scale}
          min_radius={min_radius}
          max_radius={max_radius}
          container_width={container_width}
          container_height={container_height}
          nodes_hash={props.nodes_hash}
        />
      </div>
    );
  }

  function link_size_container() {
    //Compute the size of the direct parent of the circles, in order to prevent
    //Overflowing. We can't directly compute its height as it's not rendered yet
    let container_height =
      document.getElementById("Mapcontainer").clientHeight * 0.35 * 0.723;

    //Rectangles height in pixels
    let max_height = d3.max(
      Object.entries(props.links_hash).map((link) => link[1].height_px)
    );

    let min_height = d3.min(
      Object.entries(props.links_hash).map((link) => link[1].height_px)
    );

    return (
      <div id="legendCircleContainer">
        {/* <div
          class="subContainerLabel"
          style={{ left: placeLabels("link", "size") }}
        >
          {props.lstyle.size.varied.var.substring(0, 10)}
        </div> */}
        {/* {getRectangles(min_height, max_height, container_height)} */}
        <Rectangles
          map={props.map}
          link_size_scale={props.link_size_scale}
          min_height={min_height}
          max_height={max_height}
          container_height={container_height}
          links_hash={props.links_hash}
        />
      </div>
    );
  }

  function get_nodes_var_labels() {
    let [nodeColorVar, nodeSizeVar] = [
      props.nstyle.color.varied.var,
      props.nstyle.size.varied.var,
    ];

    if (nodesColorMode === "varied" && nodesSizeMode === "varied")
      return [
        <div class="subContainerLabel" style={{ left: "1%" }}>
          {nodeSizeVar.substring(0, 12)}
        </div>,
        <div class="subContainerLabel" style={{ left: "25%" }}>
          {nodeColorVar.substring(0, 12)}
        </div>,
      ];
    if (nodesColorMode === "fixed" && nodesSizeMode === "fixed") return <p></p>;
    if (nodesColorMode === "varied" && nodesSizeMode === "fixed")
      return [
        <div class="subContainerLabel" style={{ left: "11%" }}>
          {nodeColorVar}
        </div>,
      ];
    if (nodesColorMode === "fixed" && nodesSizeMode === "varied")
      return [
        <div class="subContainerLabel" style={{ left: "11%" }}>
          {nodeSizeVar}
        </div>,
      ];
  }

  function get_links_var_labels() {
    let [linkColorVar, linkSizeVar] = [
      props.lstyle.color.varied.var,
      props.lstyle.size.varied.var,
    ];
    //If node container is empty, the link container is positionned directly to the left
    let offset_x;
    if (nodesColorMode === "fixed" && nodesSizeMode === "fixed") offset_x = 0;
    else offset_x = 50;

    if (linksColorMode === "varied" && linksSizeMode === "varied")
      return [
        <div class="subContainerLabel" style={{ left: offset_x + "%" }}>
          {linkSizeVar.substring(0, 12)}
        </div>,
        <div class="subContainerLabel" style={{ left: offset_x + 25 + "%" }}>
          {linkColorVar.substring(0, 12)}
        </div>,
      ];
    if (linksColorMode === "fixed" && linksSizeMode === "fixed") return <p></p>;
    if (linksColorMode === "varied" && linksSizeMode === "fixed")
      return [
        <div class="subContainerLabel" style={{ left: offset_x + 13 + "%" }}>
          {linkColorVar}
        </div>,
      ];
    if (linksColorMode === "fixed" && linksSizeMode === "varied")
      return [
        <div class="subContainerLabel" style={{ left: offset_x + 13 + "%" }}>
          {linkSizeVar}
        </div>,
      ];
  }

  return (
    <div id="legend">
      {get_nodes_var_labels()}
      {get_links_var_labels()}
      {nodeContainer}
      {linkContainer}
    </div>
  );
};
