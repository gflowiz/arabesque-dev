import React, { useState } from "react";
import { round_and_shorten, pxToMeters, pixelWidthToValue } from "./legend";

function getCircleContainerWidth() {
  let parent_container_width = parseFloat(
    window
      .getComputedStyle(document.getElementById("legendCircleContainer"))
      .width.split("px")[0]
  );

  let parent_container_height = parseFloat(
    window
      .getComputedStyle(document.getElementById("legendCircleContainer"))
      .height.split("px")[0]
  );
  return "100px";
}
function smallCircle(smallCircleRadiusM, scale, map) {
  return (
    <>
      <svg id="legendShapes">
        <circle
          id="bigLegendSizeDrawing"
          cx="50%"
          cy="50%"
          r={smallCircleRadiusM / map.getView().getResolution()}
          fill="none"
          stroke="black"
          strokeWidth="1px"
        ></circle>
      </svg>
      <div class="circleOneLabel">
        {round_and_shorten(scale.invert(smallCircleRadiusM))}
      </div>
    </>
  );
}

function bigCircle(max_radius, scale, map) {
  return (
    <>
      <svg id="legendShapes">
        <circle
          id="bigLegendSizeDrawing"
          cx="50%"
          cy="50%"
          r={max_radius}
          fill="none"
          stroke="black"
          strokeWidth="1px"
        ></circle>
      </svg>
      <div class="circleOneLabel">
        {round_and_shorten(pixelWidthToValue(max_radius, scale, map))}
      </div>
    </>
  );
}

function smallAndBigCircles(smallCircleRadius, max_radius, scale, map) {
  return [
    <svg id="legendShapes">
      <circle
        id="bigCircle"
        cx="50%"
        cy="35%"
        r={max_radius}
        fill="none"
        stroke="black"
        strokeWidth="1px"
      ></circle>
      <circle
        id="smallCircle"
        cx="50%"
        cy="80%"
        r={smallCircleRadius}
        fill="none"
        stroke="black"
        strokeWidth="1px"
      ></circle>
    </svg>,
    <div class="circleTwoLabels">
      <div
        // class="circleOneLabel"
        style={{
          height: "65%",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "80%" }}>
          {" "}
          {round_and_shorten(pixelWidthToValue(max_radius, scale, map))}
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
          {round_and_shorten(pixelWidthToValue(smallCircleRadius, scale, map))}
        </div>
      </div>
    </div>,
  ];
}

function searchBiggerSmallCircle(
  minimum_radius,
  max_radius,
  min_vis_diff,
  nodes_hash,
  container_width,
  container_height
) {
  let smallCircleGoodSize;
  let big_circle_max_y_px = 0.35 * container_height + 0.45 * container_width;
  let big_circle_max_y_pc = (big_circle_max_y_px / container_height) * 100;
  let max_radius_allowed = (container_height - big_circle_max_y_pc) / 2;

  //We iterate over the quantiles (0.1,0.2,0.3 etc)
  for (let i = 0.1; i <= 0.9; i += 0.1) {
    i = Math.round(i * 10) / 10;

    let quantile_i_radius = d3.quantile(
      Object.entries(nodes_hash)
        .map((node) => node[1].radius_px)
        .sort(),
      i
    );

    //If the radius is superior to the minimum displayable and that
    //there is enough difference with the big circle, the value is good enough
    if (
      quantile_i_radius > minimum_radius &&
      max_radius - quantile_i_radius > min_vis_diff &&
      quantile_i_radius < max_radius_allowed
    ) {
      smallCircleGoodSize = quantile_i_radius;
      break;
    }
  }
  return smallCircleGoodSize;
}

export const Circles = (props) => {
  let min_radius = props.min_radius;
  let max_radius = props.max_radius;
  let container_width = props.container_width;
  let [smallCircleRadius, setSmallCircleRadius] = useState(min_radius);
  //radius of the small circle in meters
  let [smallCircleRadiusM, setSmallCircleRadiusM] = useState(
    pxToMeters(min_radius, props.map)
  );
  //Minimum visible difference between two circles, in % of the div legendShapes
  let min_vis_diff = 4;
  //Minimum radius that we can display (in % too)
  let minimum_radius = 2;

  //This will only be executed twice : at the first render and when the small circle
  //gets a big enough radius. Then we fix it's radius in meters and use it to
  //display it when it is rendered alone.
  React.useEffect(() => {
    if (smallCircleRadius > minimum_radius)
      setSmallCircleRadiusM(
        smallCircleRadius * props.map.getView().getResolution()
      );
  }, [smallCircleRadius > minimum_radius]);

  if (max_radius < minimum_radius)
    return (
      <div class="zoomOutMessage">
        Circles are too small to be displayed. Zoom in to see them
      </div>
    );

  //If the small circle is too big, we render the alert message
  if (
    smallCircleRadiusM / props.map.getView().getResolution() >
    container_width * 0.4
  )
    return (
      <div class="zoomOutMessage">Zoom out to see this part of the legend</div>
    );

  //If the big circle is too big (radius > 40% of his parent div),
  //we render only the small one
  if (max_radius > container_width * 0.4) {
    return smallCircle(smallCircleRadiusM, props.node_size_scale, props.map);
  }

  //If the difference between the big and small circle is not big enough,or that the small
  //circle is to small to be displayed, we look for another radius in the quantiles of
  //the distribution
  if (
    max_radius - smallCircleRadius < min_vis_diff ||
    smallCircleRadius < minimum_radius
  ) {
    let smallCircleGoodSize = searchBiggerSmallCircle(
      minimum_radius,
      max_radius,
      min_vis_diff,
      props.nodes_hash,
      container_width,
      props.container_height
    );
    //If we didn't find any good value, we display the single big circle
    if (smallCircleGoodSize === undefined)
      return bigCircle(max_radius, props.node_size_scale, props.map);
    //If we did, we set the state so the function will re-execute and directly
    //reach the last "return" (smallAndBIgCircles) and render the two circles
    else {
      setSmallCircleRadius(smallCircleGoodSize);
    }
  }
  return smallAndBigCircles(
    smallCircleRadius,
    max_radius,
    props.node_size_scale,
    props.map
  );
};
