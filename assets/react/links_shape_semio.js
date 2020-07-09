import React, { useState } from "react";

export const LinksShapeModalComponent = (props) => {
  let semio = props.semio;
  let [orientation, set_orientation] = useState(semio.shape.orientation);
  let [shape_type, set_shape_type] = useState(semio.shape.type);

  console.log(orientation, shape_type);

  let curve_arrow_settings = (
    <div class="row" id="ArrowPlaceSizeChange">
      <hr></hr>

      <label class="h5 p-2">
        Curve Arrow{" "}
        <img
          class="small-icon"
          src="assets/svg/si-glyph-circle-info.svg"
          data-html="true"
          data-container="body"
          data-toggle="popover"
          data-placement="right"
          data-content="The curve is created by the chaikin algorithm </br /></br /> - Heigth: The value is the percentage of the distance between the origin and the destination used to define the maximum height of the link </br /> - Base: The value ([0,1]) is the center of the curve, the point is select by select a percentage of the distance from the origin node of the link "
          title=""
          data-original-title="Arrow Size Parameter"
        ></img>
      </label>
      <div class="row p-2">
        <div class="col-md-6">
          <label class="text-muted h5">Heigth Curve</label>
          <input
            class="form-control"
            id="heightCurveArrowChange"
            min="0"
            step="0.1"
            max="10"
            type="number"
            defaultValue="0.5"
          ></input>
        </div>
        <div class="col-md-6">
          <label class="text-muted h5">Center Curve</label>
          <input
            class="form-control"
            id="baseCurveArrowChange"
            min="0"
            step="0.1"
            max="1"
            type="number"
            defaultValue="0.5"
          ></input>
        </div>
      </div>
    </div>
  );
  let arrow_head_settings = (
    <div class="row" id="ArrowHeadSizeChange">
      <hr></hr>

      <label class="p-2 h5">
        Arrow Head{" "}
        <img
          class="small-icon"
          src="assets/svg/si-glyph-circle-info.svg"
          data-html="true"
          data-container="body"
          data-toggle="popover"
          data-placement="right"
          data-content=" - Heigth: Choose the distance between the base and the arrow tip, the value is a percentage of the width of the link</br /> - Width: choose the base width of the arrow, the value represent a percentage of the arrow width"
          title=""
          data-original-title="Arrow Size Parameter"
        ></img>
      </label>
      <div class="row p-2">
        <div class="col-md-6">
          <label class="text-muted h5">Heigth</label>
          <input
            class="form-control"
            id="heightArrowChange"
            min="0"
            step="0.1"
            max="10"
            type="number"
            defaultValue="0.5"
          ></input>
        </div>
        <div class="col-md-6">
          <label class="text-muted h5">Width</label>
          <input
            class="form-control"
            id="widthArrowChange"
            min="0"
            step="0.1"
            max="10"
            type="number"
            defaultValue="0.5"
          ></input>
        </div>
      </div>
    </div>
  );
  //Define the settings according to orientation and type
  let settings_div;
  if (orientation === "noOriented") {
    if (shape_type === "CurveArrow" || shape_type === "CurveOneArrow") {
      settings_div = curve_arrow_settings;
    } else {
      settings_div = <div></div>;
    }
  } else if ((orientation = "oriented")) {
    if (
      shape_type === "StraightArrow" ||
      shape_type === "StraightNoHookArrow"
    ) {
      settings_div = arrow_head_settings;
    } else if (shape_type === "TriangleArrow") {
      settings_div = <div></div>;
    } else if (shape_type === "CurveArrow") {
      settings_div = (
        <>
          {arrow_head_settings} {curve_arrow_settings}
        </>
      );
    } else if (shape_type === "CurveOneArrow") {
      settings_div = curve_arrow_settings;
    }
  }

  function extract_arrow_curve() {
    semio.shape.orientation = orientation;
    semio.shape.type = shape_type;

    semio.shape.arrow_curve.height = parseFloat(
      document.getElementById("heightCurveArrowChange").value
    );
    semio.shape.arrow_curve.center = parseFloat(
      document.getElementById("baseCurveArrowChange").value
    );
  }
  function extract_arrow_head() {
    semio.shape.orientation = orientation;
    semio.shape.type = shape_type;

    semio.shape.arrow_head.height = parseFloat(
      document.getElementById("heightArrowChange").value
    );
    semio.shape.arrow_head.width = parseFloat(
      document.getElementById("widthArrowChange").value
    );
  }
  function save_and_close() {
    //When only arrow curve menu is visible
    if (
      shape_type === "curveOneArrow" ||
      (orientation === "noOriented" && shape_type === "CurveArrow")
    ) {
      extract_arrow_curve();
    }
    //When only arrow head menu is visible
    else if (
      orientation === "oriented" &&
      (shape_type === "StraightArrow" || shape_type === "StraightNoHookArrow")
    ) {
      extract_arrow_head();
    }
    //When both menus are visible
    else if (orientation === "oriented" && shape_type === "CurveArrow") {
      extract_arrow_curve();
      extract_arrow_head();
    } else {
      semio.shape.orientation = orientation;
      semio.shape.type = shape_type;
    }
    props.update_shape(semio);
    console.log(semio);
  }
  function shape_type_choices() {
    if (orientation === "oriented") {
      return [
        <option selected="" value="StraightArrow">
          Straight
        </option>,
        <option value="StraightNoHookArrow">Straight no Hook</option>,
        <option value="TriangleArrow">Triangle</option>,
        <option value="CurveArrow">Curve</option>,
        <option value="CurveOneArrow">Triangle Curve</option>,
      ];
    } else if (orientation === "noOriented") {
      return [
        <option selected="" value="StraightArrow">
          Straight
        </option>,
        <option value="CurveArrow">Curve</option>,
      ];
    }
  }
  return (
    <div
      class="modal fade show"
      id="changeGeometryModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="changeGeometryModalLink"
      aria-modal="true"
      style={{ display: "block" }}
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title h2" id="changeGeometryModalLink">
              Change Arrow Shape
            </h5>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-12" id="arrowSelectorChange">
                <div class="row">
                  <div class="col-md-6">
                    <label for="select" class="text-muted h5">
                      Orientation
                    </label>
                    <select
                      class="custom-select"
                      id="arrowDataChange"
                      defaultValue={semio.shape.orientation}
                      onChange={(e) => set_orientation(e.target.value)}
                    >
                      <option selected="" value="oriented">
                        Oriented
                      </option>
                      <option value="noOriented">Non Oriented</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label for="select" class="text-muted h5">
                      Type
                    </label>
                    <select
                      class="custom-select"
                      id="arrowtypeChange"
                      defaultValue={semio.shape.type}
                      onChange={(e) => set_shape_type(e.target.value)}
                    >
                      {shape_type_choices()}
                    </select>
                  </div>
                </div>
                <hr></hr>
                {settings_div}
              </div>
            </div>
          </div>
          <button
            class="modal-footer btn btn-dark justify-content-center mt-2"
            type="button"
            id="addGeometryButtonLink"
            // data-dismiss="modal"
            onClick={save_and_close}
          >
            Change arrow shape
          </button>
        </div>
      </div>
    </div>
  );
};
