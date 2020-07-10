import React, { useState } from "react";

export const LegendComponent = (props) => {
  let nodesColorMode = props.nstyle.color.mode;
  let nodesSizeMode = props.nstyle.size.mode;
  let linksColorMode = props.lstyle.color.mode;
  let linksSizeMode = props.lstyle.size.mode;
  let important_values = extract_important_values();
  console.log(important_values);
  console.log(nodesColorMode, nodesSizeMode, linksColorMode, linksSizeMode);

  let [
    nodesColorDiv,
    nodesSizeDiv,
    linksColorDiv,
    linksSizeDiv,
  ] = set_containers_style();

  function extract_important_values() {
    let node_size_var = props.nstyle.size.varied.var;
    let node_color_var = props.nstyle.color.varied.var;

    //Getting min and max of links and nodes data so we can display it in the legend

    //First we look at the color variable
    let min_node_color_data = parseFloat(
      d3.min(props.nodes.map((n) => n.properties[node_color_var]))
    );
    let max_node_color_data = parseFloat(
      d3.max(props.nodes.map((n) => n.properties[node_color_var]))
    );

    //Then at the size variable
    let min_node_size_data = parseFloat(
      d3.min(props.nodes.map((n) => n.properties[node_size_var]))
    );
    let max_node_size_data = parseFloat(
      d3.max(props.nodes.map((n) => n.properties[node_size_var]))
    );

    //For the links, there is only one variable, which is value/count/volume
    let min_link_data = parseFloat(d3.min(props.links.map((l) => l.value)));
    let max_link_data = parseFloat(d3.max(props.links.map((l) => l.value)));

    return {
      nodes: {
        color: { min: min_node_color_data, max: max_node_color_data },
        size: { min: min_node_size_data, max: max_node_size_data },
      },
      links: { min: min_link_data, max: max_link_data },
    };
  }

  function set_containers_style() {
    let nodesColorDiv, nodesSizeDiv, linksColorDiv, linksSizeDiv;
    let nodes_colors = props.nstyle.color.varied.colors;
    let links_colors = props.lstyle.color.varied.colors;
    if (nodesColorMode === "varied") {
      nodesColorDiv = (
        <div id="nodesColorLegend" class="legendSubSubContainer">
          {color_ramp(
            nodes_colors,
            important_values.nodes.color.min,
            important_values.nodes.color.max
          )}
        </div>
      );
    } else {
      nodesColorDiv = <div></div>;
    }
    if (nodesSizeMode === "varied") {
      nodesSizeDiv = (
        <div id="nodesSizeLegend" class="legendSubSubContainer"></div>
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
            important_values.links.max
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

  function color_ramp(colors, min, max) {
    console.log(min, max);
    let max_or_min = max;
    let visibility;
    return (
      <div class="legendColorRamp">
        {colors.reverse().map((col) => {
          console.log(colors.indexOf(col));
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
                  width: "2em",
                  height: "1.2em",
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
