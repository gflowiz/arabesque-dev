import React, { useState } from "react";
import { round_and_shorten, pxToMeters, pixelWidthToValue } from "./legend";

function placeRectangle(size, nb_rect, container_height, height) {
  let offset_y;
  if (nb_rect === 1) offset_y = 50;
  else {
    if (size === "big") offset_y = 34;
    else offset_y = 80;
  }
  if (size === "big") {
    let height_px = height;
    let height_pc = (height_px / container_height) * 100;

    return offset_y - height_pc / 2 + "%";
  }
  if (size === "small") {
    let height_px = height;
    let height_pc = (height_px / container_height) * 100;

    return offset_y - height_pc / 2 + "%";
  }
}

function bigRectangle(max_height, container_height, scale, map) {
  return (
    <>
      <svg id="legendShapes" class="squareContainer">
        <rect
          id="bigRectangle"
          class="legendSizeDrawing"
          x="35%"
          y={placeRectangle("big", 1, container_height, max_height)}
          height={max_height}
          width="50%"
          fill="none"
          stroke="black"
          strokeWidth="1px"
        ></rect>
      </svg>
      <div class="circleOneLabel">
        {round_and_shorten(pixelWidthToValue(max_height, scale, map))}
      </div>
    </>
  );
}

function smallRectangle(smallRectangleHeightM, container_height, scale, map) {
  let height = smallRectangleHeightM / map.getView().getResolution();
  return (
    <>
      <svg id="legendShapes" class="squareContainer">
        <rect
          id="smallRectangle"
          class="legendSizeDrawing"
          x="35%"
          y={placeRectangle("small", 1, container_height, height)}
          // r={size_scale(max_radius) + "%"}
          height={height}
          width="50%"
          fill="none"
          stroke="black"
          strokeWidth="1px"
        ></rect>
      </svg>
      <div class="circleOneLabel">
        {round_and_shorten(scale.invert(smallRectangleHeightM))}
      </div>
    </>
  );
}

function smallAndBigRectangles(
  smallRectangleHeight,
  max_height,
  container_height,
  scale,
  map
) {
  return [
    <svg id="legendShapes" class="squareContainer">
      <rect
        id="bigRectangle"
        class="legendSizeDrawing"
        x="35%"
        y={placeRectangle("big", 2, container_height, max_height)}
        //-2 to include the border
        height={max_height - 2}
        width="50%"
        fill="none"
        stroke="black"
        strokeWidth="1px"
      ></rect>
      <rect
        id="smallRectangle"
        class="legendSizeDrawing"
        x="35%"
        y={placeRectangle("small", 2, container_height, smallRectangleHeight)}
        height={smallRectangleHeight - 2}
        width="50%"
        fill="none"
        stroke="black"
        strokeWidth="1px"
      ></rect>
    </svg>,
    <div class="circleTwoLabels">
      <div
        style={{
          height: "68%",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "80%" }}>
          {" "}
          {round_and_shorten(pixelWidthToValue(max_height, scale, map))}
        </div>
      </div>
      <div
        style={{
          height: "24%",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        {" "}
        <div style={{ fontSize: "80%" }}>
          {" "}
          {round_and_shorten(
            pixelWidthToValue(smallRectangleHeight, scale, map)
          )}
        </div>
      </div>
    </div>,
  ];
}

function searchBiggerSmallRectangle(
  minimum_height,
  max_height,
  min_vis_diff,
  links_hash,
  map
) {
  let smallRectangleGoodSize;

  //We iterate over the quantiles (0.1,0.2,0.3 etc)
  for (let i = 0.1; i <= 0.9; i += 0.1) {
    i = Math.round(i * 10) / 10;

    let quantile_i_height = d3.quantile(
      Object.entries(links_hash)
        .map((link) => link[1].height_px)
        .sort(),
      i
    );

    //If the height is superior to the minimum displayable and that
    //there is enough difference with the big circle, the value is good enough
    //(and that the height is not the same as the big rectangle height)
    if (
      quantile_i_height > minimum_height &&
      max_height - quantile_i_height > min_vis_diff
    ) {
      smallRectangleGoodSize = quantile_i_height;
      break;
    }
  }
  console.log(smallRectangleGoodSize);
  return smallRectangleGoodSize;
}

export const Rectangles = (props) => {
  let min_height = props.min_height;
  let max_height = props.max_height;
  let container_height = props.container_height;
  let [smallRectangleHeight, setSmallRectangleHeight] = useState(min_height);
  let [smallRectangleHeightM, setSmallRectangleHeightM] = useState(
    pxToMeters(min_height, props.map)
  );
  //Minimum visible difference between two circles, in % of the div legendShapes squareContainer
  let min_vis_diff = 4;
  //Minimum height that we can display (in % too)
  let minimum_height = 2;

  //This will only be executed twice : at the first render and when the small circle
  //gets a big enough height. Then we fix it's height in meters and use it to
  //display it when it is rendered alone.
  React.useEffect(() => {
    if (smallRectangleHeight > minimum_height)
      setSmallRectangleHeightM(
        smallRectangleHeight * props.map.getView().getResolution()
      );
  }, [smallRectangleHeight > minimum_height]);

  //If the biggest rectangles is too small to be displayed
  if (max_height < minimum_height)
    return (
      <div class="zoomOutMessage">
        Rectangles are too small to be displayed. Zoom in to see them
      </div>
    );

  //If the small Rectangle is too big, we render the alert message
  if (
    smallRectangleHeightM / props.map.getView().getResolution() >
    container_height * 0.4
  )
    return (
      <div class="zoomOutMessage">Zoom out to see this part of the legend</div>
    );

  //If the big Rectangle is too big (height > 50% of his parent div),
  //we render only the small one

  if (max_height > container_height * 0.4) {
    return smallRectangle(
      smallRectangleHeightM,
      container_height,
      props.link_size_scale,
      props.map
    );
  }

  //If there isn't enough difference between the sizes of the small and big Rectangles,
  //We only display the big one
  if (max_height - smallRectangleHeight < min_vis_diff) {
    return bigRectangle(
      max_height,
      container_height,
      props.link_size_scale,
      props.map
    );
  }
  //If the difference between the big and small Rectangle is big enough, but that the small
  //Rectangle is to small to be displayed, we look for another height in the quantiles of
  //the distribution
  if (smallRectangleHeight < minimum_height) {
    let smallRectangleGoodSize = searchBiggerSmallRectangle(
      minimum_height,
      max_height,
      min_vis_diff,
      props.links_hash,
      props.map
    );
    //If we didn't find any good value, we display the single big Rectangle
    if (smallRectangleGoodSize === undefined)
      return bigRectangle(
        max_height,
        container_height,
        props.link_size_scale,
        props.map
      );
    //If we did, we set the state so the function will re-execute and directly
    //reach the last "return" (smallAndBIgRectangles) and render the two Rectangles
    else {
      setSmallRectangleHeight(smallRectangleGoodSize);
    }
  }
  return smallAndBigRectangles(
    smallRectangleHeight,
    max_height,
    container_height,
    props.link_size_scale,
    props.map
  );
};
