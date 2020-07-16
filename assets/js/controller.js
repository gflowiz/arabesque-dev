import barChart from "./barchartfilter.js";

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
      .addEventListener("click", this.show_legend.bind(this));

    //Everytime the zoom level changes, we update the legend
    this.view.renderer.map.on("moveend", this.show_legend.bind(this));

    this.charts = [];

    console.log("controller1");
    console.log(this.model.data);
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
  post_import_zip(res, filters, dimensions, groups, config) {
    //Create filters
    for (let i = 0; i < filters.length; i++) {
      let f = new barChart(
        filters[i].id,
        dimensions[i],
        groups[i],
        this.render_all.bind(this)
      );
      let div = document.createElement("div");
      div.id = `filter-${filters[i].id}`;
      document.getElementById("Filters").append(div);
      //Create chart
      f.chart(div);
      this.charts.push(f);
    }
    //Updating styles
    let nstyle = config.styles.nodes;
    let lstyle = config.styles.links;
    this.model.update_nodes_style(nstyle);

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
    console.log(proj);
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
  add_filter(id, dimension, group) {
    let f = new barChart(id, dimension, group, this.render_all.bind(this));
    let div = document.createElement("div");
    div.id = `filter-${id}`;
    document.getElementById("Filters").append(div);
    f.chart(div);
    this.charts.push(f);
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
    console.log("save nodes semio");
    console.log(new_semio);

    //Update the model config
    this.model.update_nodes_style(new_semio);

    //Re-render the nodes with new style
    this.view.renderer.update_nodes(
      this.model.get_nodes(),
      this.model.get_nodes_style()
    );
    let lstyle = this.model.get_links_style();
    console.log(this.model.get_links_style());
    //Re-render the links because the depend on nodes size
    this.view.renderer.update_links(this.model.get_links(), lstyle);

    this.show_legend();
  }
  show_links_semio() {
    console.log("show links semio");

    let lstyle = this.model.get_links_style();
    //We need them in the modal to be able to chose according to which property the color will vary
    //We take the first line to be able to identify data types for each property
    let links_properties = this.model.data.links[0];
    console.log(links_properties);

    //To open the semio modal
    this.view.update_links_semio(
      lstyle,
      links_properties,
      //This is the callback function when the modal is closed
      this.save_links_semio.bind(this)
    );
  }
  save_links_semio(new_semio) {
    console.log("save link semio");
    console.log(new_semio);
    //Update the model config
    this.model.update_links_style(new_semio);

    this.view.renderer.update_links(
      this.model.get_links(),
      this.model.get_links_style()
    );
    this.show_legend();
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
  show_legend() {
    //Update nodes radius in pixel (according to zoom level)
    this.view.renderer.update_circles_radius();
    let nodes_hash = this.view.renderer.proj_nodes_hash;

    let nstyle = this.model.get_nodes_style();
    let lstyle = this.model.get_links_style();
    let nodes = this.model.get_nodes();
    let links = this.model.get_links();
    this.view.show_legend(nodes, nodes_hash, nstyle, links, lstyle);
  }
  render_all() {
    let proj_sel = document.getElementById("projection");
    let proj = proj_sel.options[proj_sel.selectedIndex].value;
    console.log(proj);
    this.view.renderer.render(
      this.model.get_nodes(),
      this.model.get_links(),
      this.model.get_nodes_style(),
      this.model.get_links_style()
    );
  }
}
