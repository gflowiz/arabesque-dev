import BarChart from "./barchartfilter.js";
import { render } from "ol/control/Attribution";
import { Filters } from "../react/filters/filters";
import ReactDOM from "react-dom";
import React from "react";
import { FilterMinMax } from "../react/filters/filterminmax";

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

    //Render filters
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
    console.log(legendDiv.style.visibility);
    if (legendDiv.style.display !== "none") legendDiv.style.display = "none";
    else legendDiv.style.display = "flex";
  }
  render_all() {
    console.log("renderall");
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
    console.log(nodes_layer);
    nodes_layer.setVisible(!nodes_layer.getVisible());
  }
  hide_links() {
    let links_layer = this.view.renderer.map.getLayers().array_[2];
    console.log(links_layer);
    links_layer.setVisible(!links_layer.getVisible());
  }
  toggle_new_filter_modal() {
    let nodes_properties = Object.keys(this.model.data.nodes[0].properties);
    this.view.new_filter(nodes_properties, this.add_filter.bind(this));
  }

  render_filters() {
    document.getElementById("Filters").innerHTML = "";

    // this.model.config.filters = [{ id: "origin" }];
    let filters = this.model.config.filters;
    console.log(filters);

    //Create filters
    for (let i = 0; i < filters.length; i++) {
      let id = filters[i].id;
      let filter_div = this.barchart_filter(id, this.render_all.bind(this));

      document.getElementById("Filters").append(filter_div);
    }
  }
  add_filter(target, variable, type) {
    console.log(this, variable, target, type);
    this.model.config.filters.push({ id: variable });
    console.log(this.model.config.filters);
    this.render_filters();
  }
  delete_filter(e) {
    let filter_id = e.target.parentNode.id.split("-")[1];
    console.log(e.target.parentNode.id);
    console.log(filter_id);

    console.log(this.model.config.filters);
    const new_filters = this.model.config.filters.filter((filter) => {
      return filter.id !== filter_id;
    });

    this.model.config.filters = new_filters;
    console.log(this.model.config.filters);
    this.render_filters();
  }

  barchart_filter(id, render_all) {
    let dimension = this.create_dimension(id);
    let group = dimension.group();
    let f = new BarChart(id, dimension, group, render_all);

    let filter_div = document.createElement("div");
    filter_div.id = `filter-${id}`;

    /*Title*/
    let title_div = document.createElement("div");
    title_div.id = "filterTitle";
    title_div.innerHTML = id;

    /*Chart*/
    let chart_div = document.createElement("div");
    chart_div.id = `chart-${id}`;
    //In order to resize the graph
    f.chart(chart_div);
    this.charts.push(f);

    /*Min/Max*/
    let min_max_div = document.createElement("div");
    min_max_div.id = "filterMinMax";

    let minLabel = document.createElement("div");
    minLabel.innerHTML = "Min";
    minLabel.className = "minMaxLabel";

    let minInput = document.createElement("input");
    minInput.className = "form-control filterMinInput";

    let maxLabel = document.createElement("div");
    maxLabel.innerHTML = "Max";
    maxLabel.className = "maxMaxLabel";

    let maxInput = document.createElement("input");
    maxInput.className = "form-control filterMaxInput";

    min_max_div.appendChild(minLabel);
    min_max_div.appendChild(minInput);
    min_max_div.appendChild(maxLabel);
    min_max_div.appendChild(maxInput);

    /*Trash Icon*/
    let trash_div = document.createElement("img");
    trash_div.id = "filterTrashIcon";
    trash_div.src = "assets/svg/si-glyph-trash.svg";
    trash_div.onclick = this.delete_filter.bind(this);

    filter_div.appendChild(title_div);
    filter_div.appendChild(chart_div);
    filter_div.appendChild(trash_div);
    filter_div.appendChild(min_max_div);

    return filter_div;
  }
  create_dimension(vname) {
    let dim = this.model.data.crossfilters.dimension((l) => +l[vname]);
    this.model.data.filters[vname] = dim;
    // this.model.config.filters[vname].range = [
    //   +dim.group().all()[0].key,
    //   +dim.group().all()[dim.group().all().length - 1].key,
    // ];

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
