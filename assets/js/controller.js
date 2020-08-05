import BarChartFilter from "./barchartfilter.js";
import { CategorialFilter } from "../react/filters/categorial_filter";
import { render } from "ol/control/Attribution";

import ReactDOM from "react-dom";
import React from "react";

export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    document
      .getElementById("ImportData")
      .addEventListener("click", this.import_handler.bind(this));
    document
      .getElementById("NodesImportFile")
      .addEventListener("change", this.import_nodes_file.bind(this));
    document
      .getElementById("ImportNodes")
      .addEventListener("click", this.import_nodes.bind(this));
    document
      .getElementById("LinksImportFile")
      .addEventListener("change", this.import_links_file.bind(this));
    document
      .getElementById("ImportLinks")
      .addEventListener("click", this.import_links.bind(this));
    document
      .getElementById("ImportZip")
      .addEventListener("change", this.import_zip.bind(this));
    document
      .getElementById("ExportMap")
      .addEventListener("click", this.model.export.bind(this.model));

    this.load_projections();
    document
      .getElementById("projection")
      .addEventListener("change", this.set_projection.bind(this));
    //Change node semio
    document
      .getElementById("buttonChangeLayernode")
      .addEventListener("click", this.show_nodes_semio.bind(this));

    document
      .getElementById("buttonChangeLayerlink")
      .addEventListener("click", this.show_links_semio.bind(this));
    document
      .getElementById("buttonChangeGeoLayerlink")
      .addEventListener("click", this.show_links_shape.bind(this));
    document
      .getElementById("legendButton")
      .addEventListener("click", this.toggle_legend.bind(this));
    document
      .getElementById("buttonHideLayernode")
      .addEventListener("click", this.hide_nodes.bind(this));
    document
      .getElementById("buttonHideLayerlink")
      .addEventListener("click", this.hide_links.bind(this));

    document
      .getElementById("selectFilterButton")
      .addEventListener("click", this.toggle_new_filter_modal.bind(this));

    for (let button of document.getElementsByClassName("addLayerButton"))
      button.addEventListener("click", this.view.newFilterModal.bind(this));

    //Everytime the zoom level changes, we update the legend
    this.view.renderer.map.on("moveend", this.render_legend.bind(this));

    this.charts = [];
  }

  import_handler() {
    this.view.import_nodes();
  }
  import_nodes_file() {
    let nodesfile = document.getElementById("NodesImportFile").files[0];
    this.view.set_nodes_file_name(nodesfile.name);
    if (nodesfile.type === "text/csv") {
      this.view.update_import_csv();
    }
    this.model
      .preprocess_nodes(nodesfile, this.view.update_import_nodes_modal)
      .catch(this.view.error_nodes_file());
  }
  import_nodes() {
    let nodesfile = document.getElementById("NodesImportFile").files[0];

    let id, lat, long;
    if (nodesfile.type === "text/csv") {
      id = document.getElementById("NodeImportID").value.replace(/\"/g, "");
      lat = document.getElementById("NodeImportLat").value.replace(/\"/g, "");
      long = document.getElementById("NodeImportLong").value.replace(/\"/g, "");
    }
    //If nodes is in geojson format, there is no proper varname
    else {
      id = document.getElementById("NodeImportID").value.replace(/\"/g, "");
      lat = null;
      long = null;
    }

    //Delete "" from values (they are already strings)

    this.model.set_nodes_varnames(id, lat, long);
    this.model
      .import_nodes(nodesfile, this.view.import_links)
      .catch(this.view.error_nodes_file());
  }
  import_links_file() {
    let linksfile = document.getElementById("LinksImportFile").files[0];
    this.view.set_links_file_name(linksfile.name);
    this.model
      .preprocess_links(linksfile, this.view.update_import_links_modal)
      .catch(this.view.error_links_file());
  }
  import_links() {
    let linksfile = document.getElementById("LinksImportFile").files[0];

    //Delete "" from values (they are already strings)
    let origin_id = document
      .getElementById("LinksImportOrigineID")
      .value.replace(/\"/g, "");
    let dest_id = document
      .getElementById("LinksImportDestinationID")
      .value.replace(/\"/g, "");
    let volume_id = document
      .getElementById("LinksImportVolume")
      .value.replace(/\"/g, "");

    this.model.set_links_varnames(origin_id, dest_id, volume_id);
    this.model.set_links_aggr(
      document.getElementById("LinksImportOrigineID").value
    );
    this.model
      .import_links(linksfile, this.view.import_end.bind(this.view))
      .catch(this.view.error_links_file());
  }
  import_zip() {
    let zipfile = document.getElementById("ImportZip").files[0];
    this.model
      .import_zip(zipfile, this.post_import_zip.bind(this))
      .catch(this.view.error_zip_file());
  }
  post_import_zip(res, config) {
    //Updating styles
    let nstyle = config.styles.nodes;
    let lstyle = config.styles.links;
    this.model.update_nodes_style(nstyle);

    this.render_filters(this.render_all.bind(this));

    this.view.import_end(
      res,
      this.model.get_nodes(),
      this.model.get_links(),
      config
    );
    document.getElementById(
      "projection-" + this.model.get_projection()
    ).selected = true;
    this.view.set_projection(
      this.model.get_projection(),
      this.model.get_nodes(),
      this.model.get_links(),
      config
    );
  }
  set_projection() {
    let proj_sel = document.getElementById("projection");
    let proj = proj_sel.options[proj_sel.selectedIndex].value;

    this.model.set_projection(proj);
    let config = this.model.config;
    this.view.set_projection(
      proj,
      this.model.get_nodes(),
      this.model.get_links(),
      config
    );
  }
  load_projections() {
    let projs = Object.keys(global.projections);
    document.getElementById("projection").innerHTML = projs
      .map(
        (p) =>
          "<option id='projection-" +
          p +
          "' value='" +
          p +
          "''>" +
          global.projections[p].name +
          "</option>"
      )
      .join("");
  }

  show_nodes_semio() {
    let nstyle = this.model.get_nodes_style();
    //We need them in the modal to be able to chose according to which property the color will vary
    //We take the first line to be able to identify data types for each property
    let nodes_properties = this.model.data.nodes[0].properties;

    //To open the semio modal
    this.view.update_nodes_semio(
      nstyle,
      nodes_properties,
      //This is the callback function when the modal is closed
      this.save_nodes_semio.bind(this)
    );
  }
  save_nodes_semio(new_semio) {
    //Update the model config
    this.model.update_nodes_style(new_semio);

    //Re-render the nodes with new style
    this.view.renderer.update_nodes(
      this.model.get_nodes(),
      this.model.get_nodes_style()
    );
    let lstyle = this.model.get_links_style();

    //Re-render the links because the depend on nodes size
    this.view.renderer.update_links(this.model.get_links(), lstyle);

    this.render_legend();
  }
  show_links_semio() {
    let lstyle = this.model.get_links_style();
    //We need them in the modal to be able to chose according to which property the color will vary
    //We take the first line to be able to identify data types for each property
    let links_properties = this.model.data.links[0];

    //To open the semio modal
    this.view.update_links_semio(
      lstyle,
      links_properties,
      //This is the callback function when the modal is closed
      this.save_links_semio.bind(this)
    );
  }
  save_links_semio(new_semio) {
    //Update the model config
    this.model.update_links_style(new_semio);

    this.view.renderer.update_links(
      this.model.get_links(),
      this.model.get_links_style()
    );
    this.render_legend();
  }
  show_links_shape() {
    let lstyle = this.model.get_links_style();
    this.view.update_links_shape(lstyle, this.save_links_shape.bind(this));
  }
  save_links_shape(new_semio) {
    this.model.update_links_style(new_semio);
    let links = this.model.get_links();
    this.view.renderer.update_links(links, new_semio);
    $("#changeGeometryModal").modal("hide");
  }
  render_legend() {
    let nstyle = this.model.get_nodes_style();
    let lstyle = this.model.get_links_style();
    let nodes = this.model.get_nodes();
    let links = this.model.get_links();

    //Update nodes radius in pixel (according to zoom level)
    this.view.renderer.update_circles_radius();
    let nodes_hash = this.view.renderer.proj_nodes_hash;

    //Same for links
    this.view.renderer.update_links_height(links, lstyle);
    let links_hash = this.view.renderer.proj_links_hash;

    this.view.render_legend(
      nodes,
      nodes_hash,
      nstyle,
      links,
      links_hash,
      lstyle
    );
  }
  toggle_legend() {
    let legendDiv = document.getElementById("legend");
    let style = getComputedStyle(legendDiv);

    if (legendDiv.style.display !== "none") legendDiv.style.display = "none";
    else legendDiv.style.display = "flex";
  }
  render_all() {
    let proj_sel = document.getElementById("projection");
    let proj = proj_sel.options[proj_sel.selectedIndex].value;

    this.view.renderer.render(
      this.model.get_nodes(),
      this.model.get_links(),
      this.model.get_nodes_style(),
      this.model.get_links_style()
    );
  }
  hide_nodes() {
    let nodes_layer = this.view.renderer.map.getLayers().array_[1];

    nodes_layer.setVisible(!nodes_layer.getVisible());

    //Changing the icon
    const eyeIcon = document.getElementById("nodesVisibility");
    if (nodes_layer.getVisible() === true)
      eyeIcon.src = "assets/svg/si-glyph-view.svg";
    else if (nodes_layer.getVisible() === false)
      eyeIcon.src = "assets/svg/si-glyph-noview.svg";
  }
  hide_links() {
    let links_layer = this.view.renderer.map.getLayers().array_[2];

    links_layer.setVisible(!links_layer.getVisible());

    //Changing the icon
    const eyeIcon = document.getElementById("linksVisibility");
    if (links_layer.getVisible() === true)
      eyeIcon.src = "assets/svg/si-glyph-view.svg";
    else if (links_layer.getVisible() === false)
      eyeIcon.src = "assets/svg/si-glyph-noview.svg";
  }
  toggle_new_filter_modal() {
    //We take the first node/link to be able to display properties,
    //as well as filter their types (numeral or string) in the filter modal
    let nodes_properties = this.model.data.nodes[0].properties;
    let links_properties = this.model.data.links[0];

    this.view.new_filter(
      nodes_properties,
      links_properties,
      this.add_filter.bind(this)
    );
  }

  render_filters() {
    document.getElementById("Filters").innerHTML = "";

    // this.model.config.filters = [{ id: "origin" }];
    let filters = this.model.config.filters;

    //Create filters
    for (let i = 0; i < filters.length; i++) {
      let variable = filters[i].id;
      let type = filters[i].type;
      let target = filters[i].target;

      let filter_div;
      if (type === "numeral") {
        filter_div = this.barchart_filter(
          target,
          variable,
          type,
          this.render_all.bind(this)
        );
      } else if (type === "categorial") {
        filter_div = document.createElement("div");
        const filter_id = "filter-" + target + "-" + variable + "-" + type;
        filter_div.id = filter_id;
        filter_div.className = "categorialFilter";
        document.getElementById("Filters").append(filter_div);
        //Fill the div with filter
        this.categorial_filter(target, variable, filter_id, "add");
      } else if (type === "remove") {
        filter_div = document.createElement("div");
        const filter_id = "filter-" + target + "-" + variable + "-" + type;
        filter_div.id = filter_id;
        filter_div.className = "categorialFilter";
        document.getElementById("Filters").append(filter_div);
        //Fill the div with filter
        this.categorial_filter(target, variable, filter_id, "remove");
      } else filter_div = <div>Lol</div>;

      document.getElementById("Filters").append(filter_div);
    }
  }
  add_filter(target, variable, type) {
    const filter_container = document.getElementById(
      "filter-" + target + "-" + variable + "-" + type
    );
    if (filter_container !== null) {
      document.getElementById("filterTypeSelect").classList.add("is-invalid");
      return;
    } else {
      document
        .getElementById("filterTypeSelect")
        .classList.remove("is-invalid");
      $("#FilterModal").modal("hide");
    }
    let filter = { target: target, id: variable, type: type };

    let filter_div;
    if (type === "numeral") {
      filter_div = this.barchart_filter(
        target,
        variable,
        type,
        this.render_all.bind(this)
      );
      document.getElementById("Filters").append(filter_div);
    } else if (type === "categorial") {
      filter_div = document.createElement("div");
      const filter_id = "filter-" + target + "-" + variable + "-" + type;
      filter_div.id = filter_id;
      filter_div.className = "categorialFilter";
      document.getElementById("Filters").append(filter_div);
      //Fill the div with filter
      this.categorial_filter(target, variable, filter_id, "add");
    } else if (type === "remove") {
      filter_div = document.createElement("div");
      const filter_id = "filter-" + target + "-" + variable + "-" + type;
      filter_div.id = filter_id;
      filter_div.className = "categorialFilter";
      document.getElementById("Filters").append(filter_div);
      //Fill the div with filter
      this.categorial_filter(target, variable, filter_id, "remove");
    } else {
      filter_div = <div>Lol</div>;
      document.getElementById("Filters").append(filter_div);
    }

    this.model.config.filters.push(
      filter

      // range: [
      //   +dimension.group().all()[0].key,
      //   +dimension.group().all()[dimension.group().all().length - 1].key,
      // ],
    );

    // this.render_filters();
  }
  delete_filter(event) {
    let filter_id = event.target.parentNode.id;

    //removing filter from model.config

    let new_filters = this.model.config.filters.filter((filter) => {
      let full_id =
        "filter-" + filter.target + "-" + filter.id + "-" + filter.type;
      console.log(full_id);
      return full_id !== filter_id;
    });
    this.model.config.filters = new_filters;

    //Removing dimension from the crossfilter
    this.model.data.filters[filter_id].dispose();

    //Removing the dimension from model.data
    delete this.model.data.filters[filter_id];

    let filter_div = document.getElementById(filter_id);
    document.getElementById("Filters").removeChild(filter_div);

    // this.render_filters();

    this.render_all();
  }

  barchart_filter(target, id, type, render_all) {
    const filter_id = `filter-${target}-${id}-${type}`;

    let dimension = this.create_dimension(id, filter_id);
    let group = dimension.group();

    let f = new BarChartFilter(
      id,
      filter_id,
      dimension,
      group,
      render_all,
      this.delete_filter.bind(this)
    );
    let filter_div = f.render();

    // this.charts.push(f);

    return filter_div;
  }
  categorial_filter(target, variable, filter_id, mode) {
    let dimension = this.create_dimension(variable, filter_id);
    let filtering_properties;
    if (target === "links") {
      filtering_properties = this.model.data.links.map(
        (link) => link[variable]
      );
    } else if (target === "nodes")
      filtering_properties = this.model.data.nodes.map(
        (node) => node.properties.variable
      );

    ReactDOM.render(
      <CategorialFilter
        variable={variable}
        filtering_properties={filtering_properties}
        dimension={dimension}
        render_all={this.render_all.bind(this)}
        delete_filter={this.delete_filter.bind(this)}
        mode={mode}
      />,
      document.getElementById(filter_id)
    );
  }

  create_dimension(vname, filter_id) {
    let dim = this.model.data.crossfilters.dimension((l) => l[vname]);
    // let range = [
    //   +dim.group().all()[0].key,
    //   +dim.group().all()[dim.group().all().length - 1].key,
    // ];

    // dim.filterRange(range);
    // console.log(dim.top(5000));
    this.model.data.filters[filter_id] = dim;

    // this.config.filters.push({
    //   id: vname,
    //   range: [
    //     +dim.group().all()[0].key,
    //     +dim.group().all()[dim.group().all().length - 1].key,
    //   ],
    // });

    return dim;
  }
}
