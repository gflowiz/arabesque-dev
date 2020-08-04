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
  console.log(selectedItems);

  function handleItemSelect(s, e) {
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
    filterItems(new_selection);
  }

  function filterItems(new_selection) {
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

  return [
    <img
      class="flowFilterIcon"
      src="assets/svg/si-glyph-link.svg"
      style={{ width: "1em" }}
    ></img>,
    <label for="filterorigin" class="filterTitle">
      {props.variable}
    </label>,

    <Dropdown onSelect={handleItemSelect}>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        {toggleButtonPlaceHolder()}
      </Dropdown.Toggle>

      <Dropdown.Menu as={CustomMenu}>
        {props.filtering_properties
          //remove duplicates
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((opt) => (
            <Dropdown.Item id={opt}>{opt}</Dropdown.Item>
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
