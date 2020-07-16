import { Map, View, Feature } from "ol";
import { defaults as defaultControls, Control } from "ol/control";
import FullScreen from "ol/control/FullScreen";
import TileLayer from "ol/layer/Tile";
import { Polygon, Circle, Point } from "ol/geom.js";
import { Fill, Stroke, Text, Style, RegularShape } from "ol/style.js";
import CircleStyle from "ol/style/Circle";
import { Tile, Vector as VectorLayer } from "ol/layer.js";
import { OSM, Vector as VectorSource, XYZ } from "ol/source.js";
import Legend from "ol-ext/control/Legend";
import { transform } from "ol/proj";
import * as d3 from "d3";
import { boundingExtent } from "ol/extent";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get as getProjection } from "ol/proj";
import smooth from "chaikin-smooth";

export default class OlRenderer {
  constructor(divid) {
    let projs = Object.keys(global.projections);
    projs.forEach((p) => proj4.defs(p, global.projections[p].proj4));
    register(proj4);

    //Create export button
    var exportButtonDiv = document.createElement("div");
    exportButtonDiv.id = "ExportMap";
    exportButtonDiv.className = "custom-control";
    var exportButtonControl = new Control({ element: exportButtonDiv });

    var legendDiv = document.createElement("div");
    legendDiv.id = "legendButton";
    legendDiv.className = "custom-control";
    var legendButtonControl = new Control({ element: legendDiv });

    // Define a new legend
    var legend = new Legend({
      title: "Legend",
      // style: new Style({ fill: new Fill({ color: "blue" }) }),
      element: legendDiv,
      collapsed: false,
    });

    this.map = new Map({
      controls: defaultControls().extend([
        exportButtonControl,
        new FullScreen(),
        legendButtonControl,
      ]),
      target: "Mapcontainer",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      renderer: "webgl",
      view: new View({
        center: [0, 0],
        zoom: 10,
        projection: getProjection("Mercator / EPSG:3857"),
        minZoom: -3,
        multiWorld: false,
      }),
    });

    this._extent_size = 10000000;
    this._node_scale_types = { size: "Sqrt", opacity: "Linear" };
    this._scales = {
      Sqrt: d3.scaleSqrt(),
      Pow: d3.scalePow(),
      Log: d3.scaleLog(),
      Linear: d3.scaleLinear(),
    };

    this._node_var = {
      color: "degree",
      size: "degree",
      text: "degree",
      opacity: "degree",
    };
    this._node_size_ratio = 100;

    this._scale_node_color = d3.scaleLinear();
    this._scale_node_size = d3.scaleLinear();
    this._scale_node_opacity = d3.scaleLinear();
    this._node_color_groups = {};

    this._link_var = {
      color: "degree",
      size: "degree",
      opacity: "degree",
    };
    this._link_scale_types = { size: "Sqrt", opacity: "Linear" };
    this._scale_link_size = d3.scaleSqrt();
    this._link_size_ratio = 100;
    this._scale_link_color = d3.scaleLinear();
    this._scale_link_size = d3.scaleLinear();
    this._scale_link_opacity = d3.scaleLinear();
    this._link_color_groups = {};
  }

  // Style function
  getFeatureStyle(feature) {
    var st = [];
    // Shadow style
    st.push(
      new ol.style.Style({
        image: new ol.style.Shadow({
          radius: 15,
        }),
      })
    );
    var st1 = [];
    // Font style
    st.push(
      new ol.style.Style({
        image: new ol.style.FontSymbol({
          form: "marker",
          glyph: "fa-car",
          radius: 15,
          offsetY: -15,
          fontSize: 0.7,
          color: "#fff",
          fill: new ol.style.Fill({
            color: "blue",
          }),
          stroke: new ol.style.Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
        stroke: new ol.style.Stroke({
          width: 5,
          color: "#f00",
        }),
        fill: new ol.style.Fill({
          color: [255, 0, 0, 0.6],
        }),
      })
    );
    return st;
  }

  fresh() {
    this.map.updateSize();
    this.map.render();
  }
  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  rgb_to_hex(color) {
    let rgb = color
      .slice(4, color.length - 1)
      .replace(/\ /g, "")
      .split(",")
      .map((c) => {
        let col = parseInt(c).toString(16);
        if (col.length === 1) {
          col = "0" + col;
        }
        return col;
      });

    return "#" + rgb[0] + rgb[1] + rgb[2];
  }

  add_opacity_to_color(color, opacity) {
    if (color.startsWith("rgb")) {
      color = this.rgb_to_hex(color);
    }
    let hex_opacity;
    if (opacity == 0) {
      hex_opacity = "00";
    } else {
      hex_opacity = Math.floor(opacity * 255).toString(16);
      if (hex_opacity.length === 1) {
        hex_opacity = "0" + hex_opacity;
      }
    }

    return color + hex_opacity;
  }
  nodeStyle(node, nstyle) {
    //OPACITY
    let opacity;
    if (nstyle.opacity.mode === "fixed") {
      opacity = Math.round(nstyle.opacity.fixed * 100) / 100;
    } else if (nstyle.opacity.mode === "varied") {
      opacity = Math.round(this.nodeOpacityScale(node) * 100) / 100;
      //As log(0) = -Infinity, we affect zero in this case
      if (opacity === -Infinity) {
        opacity = 0;
      }
    }

    //COLOR
    if (nstyle.color.mode === "fixed") {
      let style = new Style({
        stroke: new Stroke({
          color: "grey",
          width: 0,
        }),
        fill: new Fill({
          color: this.add_opacity_to_color(nstyle.color.fixed, opacity),
        }),
      });

      return style;
    } else if (nstyle.color.mode === "varied") {
      //If the type is quantitative, we affect to each node a color of the gradient (equal intervals discretization method)
      if (nstyle.color.varied.type === "quantitative") {
        // Valeur entre 0 et 8 arrondi à l'entier inférieur
        let color_index = Math.floor(
          this._scale_node_color(+node.properties[this._node_var.color])
        );

        let color_array = nstyle.color.varied.colors;
        return new Style({
          stroke: new Stroke({
            color: "grey",
            width: 0,
          }),
          fill: new Fill({
            color: this.add_opacity_to_color(color_array[color_index], opacity),
          }),
        });
      }
      //If it's qualitative, we just affect a random color of the palette to each node
      else if (nstyle.color.varied.type === "qualitative") {
        let color_array = nstyle.color.varied.colors;
        let node_group = node.properties[this._node_var.color];
        return new Style({
          stroke: new Stroke({
            color: "grey",
            width: 0,
          }),
          fill: new Fill({
            color: this.add_opacity_to_color(
              color_array[this._node_color_groups[node_group]],
              opacity
            ),
          }),
        });
      }
    }
  }
  nodeOpacity(node, nstyle) {
    if (nstyle.opacity.mode === "fixed") {
      return nstyle.opacity.fixed;
    } else if (nstyle.opacity.mode === "varied") {
      return this.nodeOpacityScale(node);
    }
  }
  nodeOpacityScale(node) {
    //We need to round the number
    var node_value = node.properties[this._node_var.opacity];

    return this._scale_node_opacity(node_value);
  }

  //Creates color groups according to qualitative variable
  create_node_color_groups(nodes, nstyle) {
    this._color_groups = {};
    let color_groups = {};
    let indexes = [];

    for (let node of nodes) {
      //The property according to which the groups are formed
      let prop = node.properties[this._node_var.color];
      if (indexes.length === 0) {
        color_groups[prop] = 0;
        indexes.push(0);
      } else {
        if (color_groups[prop] === undefined) {
          let last_index = indexes[indexes.length - 1];
          if (last_index === 7) {
            color_groups[prop] = 0;
            indexes.push(0);
          } else {
            color_groups[prop] = last_index + 1;
            indexes.push(last_index + 1);
          }
        }
      }
    }

    this._node_color_groups = color_groups;
  }

  nodeSize(node, nstyle) {
    if (nstyle.size.mode === "fixed") {
      //Arbitrary multiplication
      return nstyle.size.fixed * (this._extent_size / 1000);
    } else if (nstyle.size.mode === "varied") {
      var ns = this.nodeSizeScale.bind(this);
      return ns(node);
    }
  }

  //For one node, this returns the corresponding value in the _node_scale scale, according to its degree
  nodeSizeScale(node) {
    return this._scale_node_size(+node.properties[this._node_var.size]);
  }

  add_nodes(nodes, nstyle) {
    console.log("adding nodes");

    this.update_nodes_var(nstyle);
    this.update_node_scales_types(nstyle);

    var map = this.map;
    // nettoyage
    this.map.removeLayer(this.get_layer("nodes"));
    // projection
    let proj_nodes = nodes.map(function (n) {
      return {
        center: transform(
          [n.geometry.coordinates[1], n.geometry.coordinates[0]],
          "EPSG:4326",
          map.getView().getProjection()
        ),
        properties: n.properties,
        id: n.id,
      };
    });
    // calcul de l'extent des noeuds pour definition des échelles
    let xs = [
      d3.max(proj_nodes, (n) => n.center[0]),
      d3.min(proj_nodes, (n) => n.center[0]),
    ];
    let ys = [
      d3.max(proj_nodes, (n) => n.center[1]),
      d3.min(proj_nodes, (n) => n.center[1]),
    ];
    this._extent_size = Math.min(xs[0] - xs[1], ys[0] - ys[1]);

    this.update_nodes_scales(nodes, nstyle);
    var ns = this.nodeSizeScale.bind(this);

    // calcul des rayon et stockage des noeuds dans une hash
    proj_nodes = proj_nodes.map(function (n) {
      return {
        center: n.center,
        radius: this.nodeSize(n, nstyle),
        properties: n.properties,
        id: n.id,
      };
    }, this);
    this.proj_nodes = proj_nodes;
    this.proj_nodes_hash = {};
    proj_nodes.forEach((n) => (this.proj_nodes_hash[n.id] = n));

    //Qualitative color grouping
    if (nstyle.color.varied.type === "qualitative") {
      this.create_node_color_groups(nodes, nstyle);
    }

    // création des ronds
    let nodes_vector = new VectorSource({
      features: proj_nodes.map((co) => {
        let feature = new Feature(new Circle(co.center, co.radius));
        //We set a style for every feature, because it can be conditional
        feature.setStyle(this.nodeStyle(co, nstyle));
        return feature;
      }),
    });

    // création de la couche
    let nodesLayer = new VectorLayer({
      name: "nodes",
      source: nodes_vector,
      renderMode: "image",
      // style: this.nodeStyle(nstyle),
    });
    // ajout de la couche
    this.map.addLayer(nodesLayer);

    //
    this.map.getView().fit(boundingExtent(proj_nodes.map((co) => co.center)));
  }
  update_nodes(nodes, nstyle) {
    console.log("updating nodes");
    //Update nodes_var with discretization variables
    this.update_nodes_var(nstyle);
    this.update_node_scales_types(nstyle);
    this.update_nodes_scales(nodes, nstyle);

    var map = this.map;
    map.removeLayer(this.get_layer("nodes"));
    let proj_nodes = nodes.map(function (n) {
      return {
        center: transform(
          [n.geometry.coordinates[1], n.geometry.coordinates[0]],
          "EPSG:4326",
          map.getView().getProjection()
        ),
        properties: n.properties,
        id: n.id,
      };
    });
    //Dealing with the size of the nodes

    proj_nodes = proj_nodes.map(function (n) {
      return {
        center: n.center,
        radius: this.nodeSize(n, nstyle),
        properties: n.properties,
        id: n.id,
      };
    }, this);

    //Useful for qualitative color grouping
    if (nstyle.color.varied.type === "qualitative") {
      this.create_node_color_groups(nodes, nstyle);
    }

    this.proj_nodes = proj_nodes;
    this.proj_nodes_hash = {};
    proj_nodes.forEach((n) => (this.proj_nodes_hash[n.id] = n));
    let nodes_vector = new VectorSource({
      features: proj_nodes.map((co) => {
        let circle = new Circle(co.center, co.radius);

        let feature = new Feature(circle);
        feature.setStyle(this.nodeStyle(co, nstyle));
        return feature;
      }),
    });

    let nodesLayer = new VectorLayer({
      name: "nodes",
      source: nodes_vector,
      renderMode: "image",
    });
    this.map.addLayer(nodesLayer);
  }

  //Update the variables according to which the color, size, text and opacity will vary
  update_nodes_var(nstyle) {
    if (nstyle.color.mode === "varied") {
      this._node_var.color = nstyle.color.varied.var;
    }
    if (nstyle.size.mode === "varied") {
      this._node_var.size = nstyle.size.varied.var;
      this._node_size_ratio = nstyle.size.varied.maxval;
    }

    this._node_var.text = nstyle.text.fixed;

    if (nstyle.opacity.mode === "varied") {
      this._node_var.opacity = nstyle.opacity.varied.var;
    }
  }
  //Update size and opacity scale types (Linear,Pow etc)
  update_node_scales_types(nstyle) {
    this._node_scale_types.size = nstyle.size.varied.scale;
    this._node_scale_types.opacity = nstyle.opacity.varied.scale;
  }
  //Updates scales for sizing elements according to node_var
  update_nodes_scales(nodes, nstyle) {
    console.log("update scales");

    //COLORS

    //Pour l'échelle des couleurs
    let max_col = d3.max(nodes, (n) =>
      parseFloat(n.properties[this._node_var.color])
    );
    let min_col = d3.min(nodes, (n) =>
      parseFloat(n.properties[this._node_var.color])
    );

    this._scale_node_color = d3
      .scaleLinear()
      //Nombre de couleurs (7.99 car ayant 8 couleurs, l'indice finale ne doit pas dépasser 7)
      .range([0, 7.99])
      .domain([min_col, max_col]);

    //SIZE

    // recherche du max pour l'échelle des tailles
    let max_size = d3.max(nodes, (n) =>
      parseFloat(n.properties[this._node_var.size])
    );
    let min_size = d3.min(nodes, (n) =>
      parseFloat(n.properties[this._node_var.size])
    );

    //OPACITY
    let max_opa = d3.max(nodes, (n) =>
      parseFloat(n.properties[this._node_var.opacity])
    );
    let min_opa = d3.min(nodes, (n) =>
      parseFloat(n.properties[this._node_var.opacity])
    );

    //If scale is logarithmic, the range musn't cross zero
    if (
      this._node_scale_types.size === "Log" ||
      this._node_scale_types.opacity === "Log"
    ) {
      if (
        this._node_scale_types.size === "Log" &&
        this._node_scale_types.opacity !== "Log"
      ) {
        [min_size, max_size] = this.handle_log_scale_size_range(
          min_size,
          max_size,
          false,
          "#semioNodes"
        );
      } else if (
        this._node_scale_types.size !== "Log" &&
        this._node_scale_types.opacity === "Log"
      ) {
        [min_opa, max_opa] = this.handle_log_scale_opacity_range(
          min_opa,
          max_opa,
          "#semioNodes"
        );
      } else if (
        this._node_scale_types.size === "Log" &&
        this._node_scale_types.opacity === "Log"
      ) {
        [min_size, max_size] = this.handle_log_scale_size_range(
          min_size,
          max_size,
          true,
          "#semioNodes"
        );
        if ([min_size, max_size] === false) {
          return;
        }
        [min_opa, max_opa] = this.handle_log_scale_opacity_range(
          min_opa,
          max_opa,
          "#semioNodes"
        );
      }
    } else {
      $("#semioNodes").modal("hide");
    }

    // definition de l'échelle pour la taille
    this._scale_node_size = this._scales[this._node_scale_types.size]
      .copy()
      .range([0, (this._extent_size / 100) * (this._node_size_ratio / 100)])
      .domain([min_size, max_size]);

    //Opacité
    this._scale_node_opacity = this._scales[this._node_scale_types.opacity]
      .copy()
      .range([
        parseFloat(nstyle.opacity.varied.min),
        parseFloat(nstyle.opacity.varied.max),
      ])
      .domain([min_opa, max_opa]);
  }

  //If the range of a variable intersects zero, we block the rendering and keep the modal open
  handle_log_scale_size_range(
    min_size,
    max_size,
    do_not_close = false,
    modal_id
  ) {
    if (min_size == 0) {
      if (max_size > 0) {
        min_size = 0.01;
      } else if ((max_size = 0)) {
        max_size = 0.01;
        min_size = 0.01;
      }
    }
    if (max_size == 0) {
      if (min_size < 0) {
        max_size = -0.01;
      } else if (min_size == 0) {
        max_size = -0.01;
        min_size = -0.01;
      }
    }
    if (min_size < 0 && max_size > 0) {
      alert(
        "Size : Can't use logarithmic scale with this data (range must not intersect 0)"
      );
      return false;
    } else {
      if (do_not_close === false) $(modal_id).modal("hide");
    }
    return [min_size, max_size];
  }
  handle_log_scale_opacity_range(min_opa, max_opa, modal_id) {
    if (min_opa == 0) {
      if (max_opa > 0) {
        min_opa = 0.01;
      } else if ((max_opa = 0)) {
        max_opa = 0.01;
        min_opa = 0.01;
      }
    }
    if (max_opa == 0) {
      if (min_opa < 0) {
        max_opa = -0.01;
      } else if (min_opa == 0) {
        max_opa = -0.01;
        min_opa = -0.01;
      }
    }
    if (min_opa < 0 && max_opa > 0) {
      alert(
        "Opacity : Can't use logarithmic scale with this data (range must not intersect 0"
      );
    } else {
      $(modal_id).modal("hide");
    }
    return [min_opa, max_opa];
  }

  //Creates color groups according to qualitative variable
  create_link_color_groups(links) {
    this._color_groups = {};
    let color_groups = {};
    let indexes = [];

    for (let link of links) {
      //The property according to which the groups are formed
      let prop = link.value;
      if (indexes.length === 0) {
        color_groups[prop] = 0;
        indexes.push(0);
      } else {
        if (color_groups[prop] === undefined) {
          let last_index = indexes[indexes.length - 1];
          if (last_index === 7) {
            color_groups[prop] = 0;
            indexes.push(0);
          } else {
            color_groups[prop] = last_index + 1;
            indexes.push(last_index + 1);
          }
        }
      }
    }

    this._link_color_groups = color_groups;
  }

  linkStyle(link, lstyle) {
    //OPACITY (we need to have rounded numbers)
    let opacity;
    if (lstyle.opacity.mode === "fixed") {
      opacity = Math.round(lstyle.opacity.fixed * 100) / 100;
    } else if (lstyle.opacity.mode === "varied") {
      opacity = Math.round(this.linkOpacityScale(link) * 100) / 100;
      if (opacity === -Infinity) {
        opacity = 0;
      }
    }

    //COLOR

    if (lstyle.color.mode === "fixed") {
      return new Style({
        fill: new Fill({
          color: this.add_opacity_to_color(lstyle.color.fixed, opacity),
        }),
      });
    } else if (lstyle.color.mode === "varied") {
      //If the type is quantitative, we affect to each node a color of the gradient (equal intervals discretization method)
      if (lstyle.color.varied.type === "quantitative") {
        // Valeur entre 0 et 8 arrondi à l'entier inférieur
        let color_index = Math.floor(this._scale_link_color(link.value));

        let color_array = lstyle.color.varied.colors;

        return new Style({
          // stroke: new Stroke({
          //   color: "grey",
          //   width: 0,
          // }),
          fill: new Fill({
            color: this.add_opacity_to_color(color_array[color_index], opacity),
          }),
        });
      }
      //If it's qualitative, we just affect a random color of the palette to each node
      else if (lstyle.color.varied.type === "qualitative") {
        let color_array = lstyle.color.varied.colors;
        let link_group = link.value;
        color_array[this._link_color_groups[link_group]];
        return new Style({
          // stroke: new Stroke({
          //   color: "grey",
          //   width: 0,
          // }),
          fill: new Fill({
            color: this.add_opacity_to_color(
              color_array[this._link_color_groups[link_group]],
              opacity
            ),
          }),
        });
      }
    }
  }
  linkSize(link, lstyle) {
    if (lstyle.size.mode === "fixed") {
      return lstyle.size.fixed * (this._extent_size / 1000);
    } else if (lstyle.size.mode === "varied") {
      return this._scale_link_size(link.value);
    }
  }

  linkOpacityScale(link) {
    return this._scale_link_opacity(+link.value);
  }
  //Update the variables according to which the color, size, text and opacity will vary
  update_links_var(lstyle) {
    if (lstyle.color.mode === "varied") {
      this._link_var.color = lstyle.color.varied.var;
    }
    if (lstyle.size.mode === "varied") {
      this._link_var.size = lstyle.size.varied.var;
      this._link_size_ratio = lstyle.size.varied.maxval;
    }

    if (lstyle.opacity.mode === "varied") {
      this._link_var.opacity = lstyle.opacity.varied.var;
    }
  }
  update_link_scales_types(lstyle) {
    this._link_scale_types.size = lstyle.size.varied.scale;
    this._link_scale_types.opacity = lstyle.opacity.varied.scale;
  }
  //Updates scales for sizing elements according to link_var
  update_links_scales(links, lstyle) {
    console.log("update links scales");

    //COLORS

    //Pour l'échelle des couleurs
    let max_count = d3.max(links, (n) => parseFloat(n.value));
    let min_count = d3.min(links, (n) => parseFloat(n.value));

    let [min_count_size, max_count_size] = [min_count, max_count];
    let [min_count_opa, max_count_opa] = [min_count, max_count];

    this._scale_link_color = d3
      .scaleLinear()
      //Nombre de couleurs (7.99 car ayant 8 couleurs, l'indice finale ne doit pas dépasser 7)
      .range([0, 7.99])
      .domain([min_count, max_count]);

    //SIZE

    // recherche du max pour l'échelle des tailles
    // let max_size = d3.max(links, (n) => parseFloat(n[this._link_var.size]));
    // let min_size = d3.min(links, (n) => parseFloat(n[this._link_var.size]));
    // console.log("size:" + min_size + " " + max_size);

    //OPACITY
    // let max_opa = d3.max(links, (n) => parseFloat(n[this._link_var.opacity]));
    // let min_opa = d3.min(links, (n) => parseFloat(n[this._link_var.opacity]));
    // console.log("opa :" + min_opa + " " + max_opa);

    //If scale is logarithmic, the range musn't cross zero
    if (
      this._link_scale_types.size === "Log" ||
      this._link_scale_types.opacity === "Log"
    ) {
      if (
        this._link_scale_types.size === "Log" &&
        this._link_scale_types.opacity !== "Log"
      ) {
        [min_count_size, max_count_size] = this.handle_log_scale_size_range(
          min_count,
          max_count,
          false,
          "#semioLinks"
        );
      } else if (
        this._link_scale_types.size !== "Log" &&
        this._link_scale_types.opacity === "Log"
      ) {
        [min_count_opa, max_count_opa] = this.handle_log_scale_opacity_range(
          min_count,
          max_count,
          "#semioLinks"
        );
      } else if (
        this._link_scale_types.size === "Log" &&
        this._link_scale_types.opacity === "Log"
      ) {
        [min_count_size, max_count_size] = this.handle_log_scale_size_range(
          min_count,
          max_count,
          true,
          "#semioLinks"
        );
        [min_count_opa, max_count_opa] = this.handle_log_scale_opacity_range(
          min_count,
          max_count,
          "#semioLinks"
        );
      }
    } else {
      $("#semioLinks").modal("hide");
    }

    // definition de l'échelle pour la taille
    this._scale_link_size = this._scales[this._link_scale_types.size]
      .copy()
      .range([0, (this._extent_size / 100) * (this._link_size_ratio / 100)])
      .domain([min_count_size, max_count_size]);

    //Opacité
    this._scale_link_opacity = this._scales[this._link_scale_types.opacity]
      .copy()
      .range([lstyle.opacity.varied.min, lstyle.opacity.varied.max])
      .domain([min_count_opa, max_count_opa]);
  }

  create_arrows(links, lstyle) {
    var nodes_hash = this.proj_nodes_hash;
    console.log(nodes_hash);
    let orientation = lstyle.shape.orientation;
    let shape_type = lstyle.shape.type;

    let style = {
      geometry: {
        head: {
          height: lstyle.shape.arrow_head.height,
          width: lstyle.shape.arrow_head.width,
        },
        curve: {
          height: lstyle.shape.arrow_curve.height,
          center: lstyle.shape.arrow_curve.center,
        },
      },
      ratioBounds: 0.9,
    };

    if (orientation === "oriented" && shape_type === "StraightArrow") {
      let arrows = links.map(function (l) {
        let from = l.key.split("->")[0];
        let to = l.key.split("->")[1];
        let width = this.linkSize(l, lstyle);
        let arrow = orientedStraightArrow(
          style,
          nodes_hash[from].center,
          nodes_hash[to].center,
          nodes_hash[from].radius,
          nodes_hash[to].radius,
          width
        );
        return arrow;
      }, this);
      return arrows;
    } else if (orientation === "noOriented" && shape_type === "StraightArrow") {
      let arrows = links.map(function (l) {
        let from = l.key.split("->")[0];
        let to = l.key.split("->")[1];
        let width = this.linkSize(l, lstyle);
        let arrow = noOrientedStraightArrow(
          nodes_hash[from].center,
          nodes_hash[to].center,
          nodes_hash[from].radius,
          nodes_hash[to].radius,
          width
        );
        return arrow;
      }, this);

      return arrows;
    } else if (
      orientation === "oriented" &&
      shape_type === "StraightNoHookArrow"
    ) {
      let arrows = links.map(function (l) {
        let from = l.key.split("->")[0];
        let to = l.key.split("->")[1];
        let width = this.linkSize(l, lstyle);
        let arrow = orientedStraightNoHookArrow(
          style,
          nodes_hash[from].center,
          nodes_hash[to].center,
          nodes_hash[from].radius,
          nodes_hash[to].radius,
          width
        );
        return arrow;
      }, this);
      return arrows;
    } else if (orientation === "oriented" && shape_type === "TriangleArrow") {
      let arrows = links.map(function (l) {
        let from = l.key.split("->")[0];
        let to = l.key.split("->")[1];
        let width = this.linkSize(l, lstyle);
        let arrow = orientedTriangleArrow(
          style,
          nodes_hash[from].center,
          nodes_hash[to].center,
          nodes_hash[from].radius,
          nodes_hash[to].radius,
          width
        );
        return arrow;
      }, this);
      return arrows;
    } else if (orientation === "oriented" && shape_type === "CurveArrow") {
      let arrows = links.map(function (l) {
        let from = l.key.split("->")[0];
        let to = l.key.split("->")[1];
        let width = this.linkSize(l, lstyle);
        let arrow = orientedCurveArrow(
          style,
          nodes_hash[from].center,
          nodes_hash[to].center,
          nodes_hash[from].radius,
          nodes_hash[to].radius,
          width
        );
        return arrow;
      }, this);
      return arrows;
    } else if (orientation === "oriented" && shape_type === "CurveOneArrow") {
      let arrows = links.map(function (l) {
        let from = l.key.split("->")[0];
        let to = l.key.split("->")[1];
        let width = this.linkSize(l, lstyle);
        let arrow = orientedCurveOneArrow(
          style,
          nodes_hash[from].center,
          nodes_hash[to].center,
          nodes_hash[from].radius,
          nodes_hash[to].radius,
          width
        );
        return arrow;
      }, this);
      return arrows;
    } else if (orientation === "noOriented" && shape_type === "CurveArrow") {
      let arrows = links.map(function (l) {
        let from = l.key.split("->")[0];
        let to = l.key.split("->")[1];
        let width = this.linkSize(l, lstyle);
        let arrow = noOrientedCurveArrow(
          style,
          nodes_hash[from].center,
          nodes_hash[to].center,
          nodes_hash[from].radius,
          nodes_hash[to].radius,
          width
        );
        return arrow;
      }, this);

      return arrows;
    }
  }

  add_links(links, lstyle) {
    this.update_links_var(lstyle);
    this.update_link_scales_types(lstyle);
    this.update_links_scales(links, lstyle);

    //Useful for qualitative color grouping
    if (lstyle.color.varied.type === "qualitative") {
      this.create_link_color_groups(links);
    }

    this.map.removeLayer(this.get_layer("links"));

    let mval = d3.max(links, (l) => l.value);
    this._scale_link_size
      .range([0, (this._extent_size / 100) * (this._node_size_ratio / 100)])
      .domain([0, mval]);

    let arrows = this.create_arrows(links, lstyle);

    let links_shapes = arrows.map((a) => {
      let polygon = new Polygon([a]);
      let feature = new Feature(polygon);
      let link_index = arrows.indexOf(a);
      let link = links[link_index];
      feature.setStyle(this.linkStyle(link, lstyle));
      return feature;
    }, this);

    this.links = new VectorSource({
      features: links_shapes,
    });
    this.linksLayer = new VectorLayer({
      name: "links",
      source: this.links,
      // style: this.linkStyle(lstyle),
      renderMode: "image",
    });
    this.map.addLayer(this.linksLayer);
  }

  update_links(links, lstyle) {
    console.log("update links with lstyle :");
    console.log(lstyle);

    //Update the discretization variable
    this.update_links_var(lstyle);
    //Update scale types for size and opacity (linear, pow etc)
    this.update_link_scales_types(lstyle);
    //update the actual scales
    this.update_links_scales(links, lstyle);

    //Useful for qualitative color grouping
    if (lstyle.color.varied.type === "qualitative") {
      this.create_link_color_groups(links);
    }

    this.map.removeLayer(this.get_layer("links"));

    let arrows = this.create_arrows(links, lstyle);

    let links_shapes = arrows.map((a) => {
      let polygon = new Polygon([a]);
      let feature = new Feature(polygon);
      let link_index = arrows.indexOf(a);
      let link = links[link_index];
      feature.setStyle(this.linkStyle(link, lstyle));
      return feature;
    }, this);

    let links_vector = new VectorSource({
      features: links_shapes,
    });
    let linksLayer = new VectorLayer({
      name: "links",
      source: links_vector,
      // style: this.linkStyle(lstyle),
      renderMode: "image",
    });
    this.map.addLayer(linksLayer);
  }
  set_projection(proj, nodes, links, config) {
    let olproj = getProjection(proj);

    this.map.setView(
      new View({
        center: [0, 0],
        zoom: 10,
        projection: olproj,
        minZoom: -3,
        multiWorld: false,
      })
    );
    let nstyle = config.styles.nodes;
    let lstyle = config.styles.links;
    this.add_nodes(nodes, nstyle);
    this.add_links(links, lstyle);
  }

  render(nodes, links, nstyle, lstyle) {
    this.update_nodes(nodes, nstyle);
    this.update_links(links, lstyle);
  }

  get_layer(name) {
    let layers = this.map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].values_.name == name) {
        return layers[i];
      }
    }
  }
}

function tranposeLine(point_ori, point_dest, distance) {
  var startX = point_ori[0];
  var startY = point_ori[1];
  var endX = point_dest[0];
  var endY = point_dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  var NewOri = [
    Math.sin(angle) * distance + startX,
    -Math.cos(angle) * distance + startY,
  ];
  var Newdest = [
    Math.sin(angle) * distance + endX,
    -Math.cos(angle) * distance + endY,
  ];

  return [NewOri, Newdest];
}

function getIntersection(ori, dest, radius) {
  var startX = ori[0];
  var startY = ori[1];
  var endX = dest[0];
  var endY = dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  return [Math.cos(angle) * radius + startX, Math.sin(angle) * radius + startY];
}
function transposePointVerticalyFromLine(point_ori, linePoints, distance) {
  var startX = linePoints[0][0];
  var startY = linePoints[0][1];
  var endX = linePoints[1][0];
  var endY = linePoints[1][1];
  var angle = Math.atan2(endY - startY, endX - startX);
  return [
    Math.sin(angle) * distance + point_ori[0],
    -Math.cos(angle) * distance + point_ori[1],
  ];
}

function drawLine(path, iteration) {
  var numIterations = iteration;
  while (numIterations > 0) {
    path = smooth(path);
    numIterations--;
  }
  return path;
}

// create a simple arrow with en triangle head at a given ratio of the distance
function orientedStraightArrow(style, ori, dest, rad_ori, rad_dest, width) {
  var startX = ori[0];
  var startY = ori[1];
  var endX = dest[0];
  var endY = dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  var reducePointdest = getIntersection(dest, ori, rad_dest);
  var reducePointOri = getIntersection(ori, dest, rad_ori);

  var heigth_arrow = style.geometry.head.height;
  var widthArrow = style.geometry.head.width;

  var dist = Math.sqrt(
    (reducePointdest[0] - reducePointOri[0]) *
      (reducePointdest[0] - reducePointOri[0]) +
      (reducePointdest[1] - reducePointOri[1]) *
        (reducePointdest[1] - reducePointOri[1])
  );
  var baseArrow = tranposeLine(
    reducePointOri,
    reducePointdest,
    2.5 * style.ratioBounds
  );

  var testWidth = Math.min(heigth_arrow * width + width, 0.5 * dist);

  var topArrowpoint = getIntersection(baseArrow[1], baseArrow[0], testWidth);
  var polyPoint = tranposeLine(baseArrow[0], topArrowpoint, width);
  var topArrowpoint = tranposeLine(
    baseArrow[0],
    topArrowpoint,
    width + widthArrow * width
  )[1];

  return [
    baseArrow[0],
    baseArrow[1],
    topArrowpoint,
    polyPoint[1],
    polyPoint[0],
    baseArrow[0],
  ];
}

// create a simple arrow with en triangle head at a given ratio of the distance
function noOrientedStraightArrow(ori, dest, rad_ori, rad_dest, width) {
  var startX = ori[0];
  var startY = ori[1];
  var endX = dest[0];
  var endY = dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  var reducePointdest = getIntersection(dest, ori, rad_dest);
  var reducePointOri = getIntersection(ori, dest, rad_ori);

  var baseArrow = tranposeLine(reducePointOri, reducePointdest, width / 2);
  var topArrow = tranposeLine(reducePointdest, reducePointOri, width / 2);

  return baseArrow.concat(topArrow).concat([baseArrow[0]]);
}

function orientedStraightNoHookArrow(
  style,
  ori,
  dest,
  rad_ori,
  rad_dest,
  width
) {
  var startX = ori[0];
  var startY = ori[1];
  var endX = dest[0];
  var endY = dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  var reducePointdest = getIntersection(dest, ori, rad_dest);
  var reducePointOri = getIntersection(ori, dest, rad_ori);

  var heigth_arrow = style.geometry.head.height;
  var widthArrow = style.geometry.head.width;

  var dist = Math.sqrt(
    (reducePointdest[0] - reducePointOri[0]) *
      (reducePointdest[0] - reducePointOri[0]) +
      (reducePointdest[1] - reducePointOri[1]) *
        (reducePointdest[1] - reducePointOri[1])
  );
  var baseArrow = tranposeLine(
    reducePointOri,
    reducePointdest,
    2.5 * style.ratioBounds
  );

  // var percentDist = heigth_arrow * Math.sqrt((endX - startX) * (endX - startX) + (endY - startY) * (endY - startY))
  //distance = Math.sqrt( (endX - startX)*(endX - startX )+ (endY - startY)*(endY - startY) ) * ratio_Arrow_Line;

  // var heigth_arrow = Math.min(heigth_arrow *width + width , 0.5* dist)
  //
  var testWidth = Math.min(heigth_arrow * width + width, 0.5 * dist);
  // topArrowpoint = [Math.cos(angle) * distance + startX, Math.sin(angle) * distance + startY]
  var topArrowpoint = getIntersection(baseArrow[1], baseArrow[0], testWidth);
  var polyPoint = tranposeLine(baseArrow[0], topArrowpoint, width);

  // topArrowpoint = transposePointVerticalyFromLine(topArrowpoint, [baseArrow[0], baseArrow[1]], width + widthArrow * width )

  return [baseArrow[0], baseArrow[1], polyPoint[1], polyPoint[0], baseArrow[0]];
}

function orientedTriangleArrow(style, ori, dest, rad_ori, rad_dest, width) {
  var startX = ori[0];
  var startY = ori[1];
  var endX = dest[0];
  var endY = dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  var reducePointdest = getIntersection(dest, ori, rad_dest);
  var reducePointOri = getIntersection(ori, dest, rad_ori);

  var heigth_arrow = 0.5;
  // var widthArrow = style.geometry.head.width;

  var dist = Math.sqrt(
    (reducePointdest[0] - reducePointOri[0]) *
      (reducePointdest[0] - reducePointOri[0]) +
      (reducePointdest[1] - reducePointOri[1]) *
        (reducePointdest[1] - reducePointOri[1])
  );
  var baseArrow = tranposeLine(
    reducePointOri,
    reducePointdest,
    style.ratioBounds / 2
  );

  // var percentDist = heigth_arrow * Math.sqrt((endX - startX) * (endX - startX) + (endY - startY) * (endY - startY))
  //distance = Math.sqrt( (endX - startX)*(endX - startX )+ (endY - startY)*(endY - startY) ) * ratio_Arrow_Line;

  // var heigth_arrow = Math.min(heigth_arrow *width + width , 0.5* dist)

  var testWidth = Math.min(heigth_arrow * width + width, dist);
  // topArrowpoint = [Math.cos(angle) * distance + startX, Math.sin(angle) * distance + startY]
  var topArrowpoint = getIntersection(
    reducePointdest,
    reducePointOri,
    testWidth
  );
  var polyPoint = tranposeLine(baseArrow[0], topArrowpoint, width);

  // topArrowpoint = transposePointVerticalyFromLine(topArrowpoint, [baseArrow[0], baseArrow[1]], width + widthArrow * width )

  return [baseArrow[0], baseArrow[1], polyPoint[0], baseArrow[0]];
}

function orientedCurveArrow(style, ori, dest, rad_ori, rad_dest, width) {
  var base_curve = style.geometry.curve.center;
  var height_curve = style.geometry.curve.height;
  var heigth_arrow = style.geometry.head.height;
  var widthArrow = style.geometry.head.width;

  var startX = ori[0];
  var startY = ori[1];
  var endX = dest[0];
  var endY = dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  // compute the point from
  var reducePointdest = getIntersection(dest, ori, rad_dest);
  var reducePointOri = getIntersection(ori, dest, rad_ori);

  var dist =
    base_curve *
    Math.sqrt(
      (reducePointdest[0] - reducePointOri[0]) *
        (reducePointdest[0] - reducePointOri[0]) +
        (reducePointdest[1] - reducePointOri[1]) *
          (reducePointdest[1] - reducePointOri[1])
    );
  var base_curve_point = [
    -Math.cos(angle) * dist + reducePointdest[0],
    -Math.sin(angle) * dist + reducePointdest[1],
  ];

  // get Origin from the radius of the current nodes
  var center_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist
  );
  var max_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist + width / 2
  );
  var min_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist - width / 2
  );
  var newOri = getIntersection(ori, center_curve_point, rad_ori);
  var heigth_arrow = Math.min(heigth_arrow * width + width, 0.5 * dist);
  var newDest = getIntersection(
    dest,
    center_curve_point,
    rad_dest + heigth_arrow
  ); // The height of the arrow is added tested to see the result
  var pointArrow = getIntersection(dest, center_curve_point, rad_dest);
  //Compute the base
  var angleFirst = Math.atan2(
    center_curve_point[1] - ori[1],
    center_curve_point[0] - ori[0]
  );
  var angleSecond = Math.atan2(
    center_curve_point[1] - dest[1],
    center_curve_point[0] - dest[0]
  );
  var extremPointArrow = [
    transposePointVerticalyFromLine(
      newDest,
      [newDest, center_curve_point],
      width / 2 + widthArrow * (width / 2)
    ),
    transposePointVerticalyFromLine(
      newDest,
      [newDest, center_curve_point],
      -(width / 2 + (widthArrow * width) / 2)
    ),
  ];

  newOri = [
    transposePointVerticalyFromLine(
      newOri,
      [newOri, center_curve_point],
      width / 2
    ),
    transposePointVerticalyFromLine(
      newOri,
      [newOri, center_curve_point],
      -width / 2
    ),
  ];
  newDest = [
    transposePointVerticalyFromLine(
      newDest,
      [newDest, center_curve_point],
      width / 2
    ),
    transposePointVerticalyFromLine(
      newDest,
      [newDest, center_curve_point],
      -width / 2
    ),
  ];

  var pathLow = [newOri[1], min_curve_point, newDest[0]];
  var pathHigh = [newDest[1], max_curve_point, newOri[0]];
  // draw the curve line
  pathLow = drawLine(pathLow, 5);
  pathHigh = drawLine(pathHigh, 5);

  //draw the arrow .concat([extremPointArrow[1]]).concat([pointArrow]).concat([extremPointArrow[0]])

  var Polygone = pathLow
    .concat([extremPointArrow[0]])
    .concat([pointArrow])
    .concat([extremPointArrow[1]])
    .concat(pathHigh)
    .concat([pathLow[0]]);
  return Polygone;
}

function orientedCurveOneArrow(style, ori, dest, rad_ori, rad_dest, width) {
  var base_curve = style.geometry.curve.center;
  var height_curve = style.geometry.curve.height;
  var heigth_arrow = style.geometry.head.height;
  var widthArrow = style.geometry.head.width;

  var startX = ori[0];
  var startY = ori[1];
  var endX = dest[0];
  var endY = dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  // compute the point from
  var reducePointdest = getIntersection(dest, ori, rad_dest);
  var reducePointOri = getIntersection(ori, dest, rad_ori);
  var dist =
    base_curve *
    Math.sqrt(
      (reducePointdest[0] - reducePointOri[0]) *
        (reducePointdest[0] - reducePointOri[0]) +
        (reducePointdest[1] - reducePointOri[1]) *
          (reducePointdest[1] - reducePointOri[1])
    );
  var base_curve_point = [
    -Math.cos(angle) * dist + reducePointdest[0],
    -Math.sin(angle) * dist + reducePointdest[1],
  ];
  // get Origin from the radius of the current nodes
  var center_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist
  );
  var max_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist + width / 2
  );
  var min_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist - width / 2
  );
  var newOri = getIntersection(ori, center_curve_point, rad_ori);
  // var heigth_arrow = Math.min(heigth_arrow *width + width , 0.5* dist)
  var newDest = getIntersection(dest, center_curve_point, rad_dest); // The height of the arrow is added tested to see the result
  var pointArrow = getIntersection(dest, center_curve_point, rad_dest);
  //Compute the base
  var angleFirst = Math.atan2(
    center_curve_point[1] - ori[1],
    center_curve_point[0] - ori[0]
  );
  var angleSecond = Math.atan2(
    center_curve_point[1] - dest[1],
    center_curve_point[0] - dest[0]
  );
  // var extremPointArrow = [transposePointVerticalyFromLine(newDest, [newDest,center_curve_point], width /2 +widthArrow * (width /2)), transposePointVerticalyFromLine(newDest, [newDest,center_curve_point], -(width /2 +(widthArrow *width/2))) ]

  newOri = [
    transposePointVerticalyFromLine(
      newOri,
      [newOri, center_curve_point],
      width
    ),
    transposePointVerticalyFromLine(
      newOri,
      [newOri, center_curve_point],
      -width
    ),
  ];
  // newDest = [transposePointVerticalyFromLine(newDest, [newDest,center_curve_point], width/2), transposePointVerticalyFromLine(newDest, [newDest,center_curve_point], - width/2) ]

  var pathLow = [newOri[1], min_curve_point, pointArrow];
  var pathHigh = [pointArrow, max_curve_point, newOri[0]];
  // draw the curve line
  pathLow = drawLine(pathLow, 5);
  pathHigh = drawLine(pathHigh, 5);

  //draw the arrow .concat([extremPointArrow[1]]).concat([pointArrow]).concat([extremPointArrow[0]])

  var Polygone = pathHigh.concat(pathLow);
  return Polygone;
}

function noOrientedCurveArrow(style, ori, dest, rad_ori, rad_dest, width) {
  var base_curve = style.geometry.curve.center;
  var height_curve = style.geometry.curve.height;

  var startX = ori[0];
  var startY = ori[1];
  var endX = dest[0];
  var endY = dest[1];
  var angle = Math.atan2(endY - startY, endX - startX);

  // compute the point from
  var reducePointdest = getIntersection(dest, ori, rad_dest);
  var reducePointOri = getIntersection(ori, dest, rad_ori);

  var dist =
    base_curve *
    Math.sqrt(
      (reducePointdest[0] - reducePointOri[0]) *
        (reducePointdest[0] - reducePointOri[0]) +
        (reducePointdest[1] - reducePointOri[1]) *
          (reducePointdest[1] - reducePointOri[1])
    );
  var base_curve_point = [
    -Math.cos(angle) * dist + reducePointdest[0],
    -Math.sin(angle) * dist + reducePointdest[1],
  ];

  // get Origin from the radius of the current nodes
  var center_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist
  );
  var max_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist + width / 2
  );
  var min_curve_point = transposePointVerticalyFromLine(
    base_curve_point,
    [ori, dest],
    height_curve * dist - width / 2
  );
  var newOri = getIntersection(ori, center_curve_point, rad_ori);
  var newDest = getIntersection(dest, center_curve_point, rad_dest); // The height of the arrow is added tested to see the result
  // var pointArrow = getIntersection(dest,center_curve_point,rad_dest)
  //Compute the base
  var angleFirst = Math.atan2(
    center_curve_point[1] - ori[1],
    center_curve_point[0] - ori[0]
  );
  var angleSecond = Math.atan2(
    center_curve_point[1] - dest[1],
    center_curve_point[0] - dest[0]
  );
  // var extremPointArrow = [transposePointVerticalyFromLine(newDest, [dest,center_curve_point], width /2 ), transposePointVerticalyFromLine(newDest, [dest,center_curve_point], -(width /2)) ]
  newOri = [
    transposePointVerticalyFromLine(
      newOri,
      [ori, center_curve_point],
      width / 2
    ),
    transposePointVerticalyFromLine(
      newOri,
      [ori, center_curve_point],
      -width / 2
    ),
  ];
  newDest = [
    transposePointVerticalyFromLine(
      newDest,
      [dest, center_curve_point],
      width / 2
    ),
    transposePointVerticalyFromLine(
      newDest,
      [dest, center_curve_point],
      -width / 2
    ),
  ];

  var pathLow = [newOri[1], min_curve_point, newDest[0]];
  var pathHigh = [newDest[1], max_curve_point, newOri[0]];
  // draw the curve line
  pathLow = drawLine(pathLow, 5);
  pathHigh = drawLine(pathHigh, 5);

  //draw the arrow .concat([extremPointArrow[1]]).concat([pointArrow]).concat([extremPointArrow[0]])

  var Polygone = pathLow.concat(pathHigh).concat([pathLow[0]]);
  return Polygone;
}
