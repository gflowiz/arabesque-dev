import { Map, View, Feature } from "ol";
import { defaults as defaultControls, Control } from "ol/control";
import FullScreen from "ol/control/FullScreen";
import TileLayer from "ol/layer/Tile";
import { Polygon, Circle } from "ol/geom.js";
import { Fill, Stroke, Text, Style } from "ol/style.js";
import CircleStyle from "ol/style/Circle";
import { Tile, Vector as VectorLayer } from "ol/layer.js";
import { OSM, Vector as VectorSource, XYZ } from "ol/source.js";
import { transform } from "ol/proj";
import * as d3 from "d3";
import { boundingExtent } from "ol/extent";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get as getProjection } from "ol/proj";

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

    this.map = new Map({
      controls: defaultControls().extend([
        exportButtonControl,
        new FullScreen(),
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
    this._scale_types = { size: "Sqrt", opacity: "Linear" };
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
    this._color_groups = {};

    this._scale_link_size = d3.scaleSqrt();
    this._link_size_ratio = 100;
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
      .slice(4, color.length - 2)
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
    }

    return color + hex_opacity;
  }
  nodeStyle(node, nstyle) {
    //OPACITY
    let opacity;
    if (nstyle.opacity.mode === "fixed") {
      opacity = nstyle.opacity.fixed;
    } else if (nstyle.opacity.mode === "varied") {
      opacity = this.nodeOpacityScale(node);
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
              color_array[this._color_groups[node_group]],
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
      console.log(this.nodeOpacityScale(node));
      return this.nodeOpacityScale(node);
    }
  }
  nodeOpacityScale(node) {
    return this._scale_node_opacity(+node.properties[this._node_var.opacity]);
  }

  //Creates color groups according to qualitative variable
  create_color_groups(nodes, nstyle) {
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

    this._color_groups = color_groups;
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
    this.update_scale_types(nstyle);
    this.update_nodes_scales(nodes);

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

    this.update_nodes_scales(nodes);
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
      this.create_color_groups(nodes, nstyle);
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
    this.update_scale_types(nstyle);
    this.update_nodes_scales(nodes);

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
      this.create_color_groups(nodes, nstyle);
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
  update_scale_types(nstyle) {
    this._scale_types.size = nstyle.size.varied.scale;
    this._scale_types.opacity = nstyle.opacity.varied.scale;
  }
  //Updates scales for sizing elements according to node_var
  update_nodes_scales(nodes) {
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
      this._scale_types.size === "Log" ||
      this._scale_types.opacity === "Log"
    ) {
      if (
        this._scale_types.size === "Log" &&
        this._scale_types.opacity !== "Log"
      ) {
        [min_size, max_size] = this.handle_log_scale_size_range(
          min_size,
          max_size
        );
      } else if (
        this._scale_types.size !== "Log" &&
        this._scale_types.opacity === "Log"
      ) {
        [min_opa, max_opa] = this.handle_log_scale_opacity_range(
          min_opa,
          max_opa
        );
      } else if (
        this._scale_types.size === "Log" &&
        this._scale_types.opacity === "Log"
      ) {
        [min_size, max_size] = this.handle_log_scale_size_range(
          min_size,
          max_size,
          true
        );
        [min_opa, max_opa] = this.handle_log_scale_opacity_range(
          min_opa,
          max_opa
        );
      }
    } else {
      $("#semioNodes").modal("toggle");
    }

    // definition de l'échelle pour la taille
    this._scale_node_size = this._scales[this._scale_types.size]
      .copy()
      .range([0, (this._extent_size / 100) * (this._node_size_ratio / 100)])
      .domain([min_size, max_size]);

    //Opacité
    this._scale_node_opacity = this._scales[this._scale_types.opacity]
      .copy()
      .range([0, 1])
      .domain([min_opa, max_opa]);
  }

  //If the range of a variable intersects zero, we block the rendering and keep the modal open
  handle_log_scale_size_range(min_size, max_size, do_not_close = false) {
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
    } else {
      if (do_not_close === false) $("#semioNodes").modal("toggle");
    }
    return [min_size, max_size];
  }
  handle_log_scale_opacity_range(min_opa, max_opa) {
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
      $("#semioNodes").modal("toggle");
    }
    return [min_opa, max_opa];
  }

  linkStyle(lstyle) {
    return new Style({
      fill: new Fill({
        color: lstyle.color.fixed,
      }),
    });
  }

  add_links(links, lstyle) {
    this.map.removeLayer(this.get_layer("links"));

    let style = {
      geometry: { head: { height: 0.3, width: 0.5 } },
      ratioBounds: 0.9,
    };
    let mval = d3.max(links, (l) => l.value);
    this._scale_link_size
      .range([0, (this._extent_size / 100) * (this._node_size_ratio / 100)])
      .domain([0, mval]);
    var link_size = this._scale_link_size;
    var nodes_hash = this.proj_nodes_hash;
    let arrow = links.map(function (l) {
      let from = l.key.split("->")[0];
      let to = l.key.split("->")[1];
      let width = link_size(l.value);
      let arrow = orientedStraightArrow(
        style,
        nodes_hash[from].center,
        nodes_hash[to].center,
        nodes_hash[from].radius,
        nodes_hash[to].radius,
        width
      );
      return arrow;
    });

    let links_shapes = arrow.map((a) => new Feature(new Polygon([a])));

    this.links = new VectorSource({
      features: links_shapes,
    });
    this.linksLayer = new VectorLayer({
      name: "links",
      source: this.links,
      style: this.linkStyle(lstyle),
      renderMode: "image",
    });
    this.map.addLayer(this.linksLayer);
  }

  update_links(links, lstyle) {
    this.map.removeLayer(this.get_layer("links"));

    let style = {
      geometry: { head: { height: 0.3, width: 0.5 } },
      ratioBounds: 0.9,
    };
    var link_size = this._scale_link_size;
    var nodes_hash = this.proj_nodes_hash;
    let arrow = links.map(function (l) {
      let from = l.key.split("->")[0];
      let to = l.key.split("->")[1];
      let width = link_size(l.value);
      let arrow = orientedStraightArrow(
        style,
        nodes_hash[from].center,
        nodes_hash[to].center,
        nodes_hash[from].radius,
        nodes_hash[to].radius,
        width
      );
      return arrow;
    });

    let links_shapes = arrow.map((a) => new Feature(new Polygon([a])));

    let links_vector = new VectorSource({
      features: links_shapes,
    });
    let linksLayer = new VectorLayer({
      name: "links",
      source: links_vector,
      style: this.linkStyle(lstyle),
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
