import React, { useState } from "react";
import { Form, FormControl, Dropdown } from "react-bootstrap";
import Multiselect from "react-bootstrap-multiselect";

// I use this const to implement the search bar in the select
const CustomMenu = React.forwardRef(
  ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
    const [value, setValue] = useState("");

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <FormControl
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder="Type to filter..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child) =>
              !value || child.props.children.toLowerCase().startsWith(value)
          )}
        </ul>
      </div>
    );
  }
);

export const CategorialFilter = (props) => {
  let [selectedItems, setSelectedItems] = useState([]);

  function handleItemSelect(e) {
    let new_selection;
    let id = e.target.id;
    //If the element is already selected, we remove it from the selected items
    if (selectedItems.includes(id)) {
      new_selection = selectedItems.filter((e) => e !== id);
      setSelectedItems(new_selection);

      e.target.classList.remove("active");
    }
    //Add the clicked element to the selected ones if it's not
    else {
      new_selection = selectedItems.concat(id);
      setSelectedItems(new_selection);
      e.target.classList.add("active");
    }
    //According to the mode, we add or remove items from selection
    if (props.mode === "add") addItems(new_selection);
    else if (props.mode === "remove") removeItems(new_selection);
  }

  function addItems(new_selection) {
    //If there is no items selected, we just render every record of the dimension
    if (new_selection.length === 0) {
      props.dimension.filterAll();
      props.render_all();
      return;
    }

    props.dimension.filterAll();
    // Else we render only the selected ones
    props.dimension.filterFunction(function (d) {
      return new_selection.includes(d.toString());
    });

    props.render_all();
  }

  function removeItems(new_selection) {
    //If there is no items selected, we just render every record of the dimension
    if (new_selection.length === 0) {
      props.dimension.filterAll();
      props.render_all();
      return;
    }

    props.dimension.filterAll();
    // Else we render only the selected ones
    props.dimension.filterFunction(function (d) {
      return !new_selection.includes(d.toString());
    });
    console.log(props.dimension.top(Infinity));

    props.render_all();
  }

  function toggleButtonPlaceHolder() {
    if (selectedItems.length === 0) return "Choose...";
    else {
      if (selectedItems.length === 1) return selectedItems[0];
      let placeholder = "";

      for (let item of selectedItems) {
        if ((placeholder + item).length < 10) {
          if (selectedItems.indexOf(item) === selectedItems.length - 1)
            placeholder += item;
          else placeholder += item + ",";
        } else {
          if (
            placeholder.substring(
              placeholder.length - 3,
              placeholder.length
            ) === "..."
          )
            return placeholder;
          placeholder =
            placeholder.substring(0, placeholder.length - 1) + "...";
        }
      }

      return placeholder;
    }
  }

  function unselectAll() {
    setSelectedItems([]);
    props.dimension.filterAll();
    props.render_all();
    let active_elements = Array.from(
      document.querySelectorAll(
        "." + props.mode + "-" + props.variable + "-item" + ".active"
      )
    );
    for (let el of active_elements) {
      el.classList.remove("active");
    }
  }

  function selectAll() {
    const all_elements = props.filtering_properties.filter(onlyUnique);
    setSelectedItems(all_elements);
    if (props.mode === "add") addItems(all_elements);
    else if (props.mode === "remove") removeItems(all_elements);

    let all_divs = Array.from(
      document.querySelectorAll(
        "." + props.mode + "-" + props.variable + "-item"
      )
    );
    for (let el of all_divs) {
      el.classList.add("active");
    }
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  let toggle_button_mode;
  if (props.mode === "add") toggle_button_mode = "success";
  else if (props.mode === "remove") toggle_button_mode = "danger";
  return [
    <img
      class="flowFilterIcon"
      src="assets/svg/si-glyph-link.svg"
      style={{ width: "1em" }}
    ></img>,
    <label for="filterorigin" class="filterTitle">
      {props.variable}
    </label>,

    <Dropdown>
      <Dropdown.Toggle variant={toggle_button_mode} id="dropdown-basic">
        {toggleButtonPlaceHolder()}
      </Dropdown.Toggle>

      <Dropdown.Menu as={CustomMenu}>
        <Dropdown.Item onClick={selectAll}>Select all</Dropdown.Item>
        <Dropdown.Item onClick={unselectAll}>Unselect all</Dropdown.Item>
        {props.filtering_properties
          //remove duplicates
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((opt) => (
            <Dropdown.Item
              className={props.mode + "-" + props.variable + "-item"}
              onClick={handleItemSelect}
              id={opt}
            >
              {opt}
            </Dropdown.Item>
          ))}
      </Dropdown.Menu>
    </Dropdown>,

    <img
      class="icon categorialTrashIcon"
      src="assets/svg/si-glyph-trash.svg"
      onClick={(e) => props.delete_filter(e)}
    ></img>,
    <div class="filterBottomLine"></div>,
  ];
};
