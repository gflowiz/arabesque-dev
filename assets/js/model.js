import JSZip from "jszip";
import saveAs from "file-saver";
import { parse as papaparse } from "papaparse";
import * as turf from "@turf/turf";
import crossfilter from "crossfilter2";

export default class Model {
  constructor() {
    // app configuration
    let nstyle = {
      color: {
        mode: "fixed",
        fixed: "#F6C270",
        varied: {
          colors: [
            "rgb(255, 247, 243)",
            "rgb(253, 224, 221)",
            "rgb(252, 197, 192)",
            "rgb(250, 159, 181)",
            "rgb(247, 104, 161)",
            "rgb(221, 52, 151)",
            "rgb(174, 1, 126)",
            "rgb(122, 1, 119)",
          ],
          inverted: false,
          type: "quantitative",
        },
      },
      size: {
        mode: "varied",
        varied: { var: "degree", scale: "Sqrt", maxval: 100 },
        fixed: 10,
      },
      text: { var: "" },
      opacity: {
        mode: "fixed",
        fixed: 0.91,
        varied: { var: "degree", scale: "Linear", min: 0, max: 1 },
      },
    };
    let lstyle = {
      color: {
        mode: "fixed",
        fixed: "#F6C270",
        varied: {
          colors: [
            "rgb(255, 247, 243)",
            "rgb(253, 224, 221)",
            "rgb(252, 197, 192)",
            "rgb(250, 159, 181)",
            "rgb(247, 104, 161)",
            "rgb(221, 52, 151)",
            "rgb(174, 1, 126)",
            "rgb(122, 1, 119)",
          ],
          inverted: false,
          type: "quantitative",
        },
      },
      size: {
        mode: "varied",
        varied: { var: "degree", scale: "Sqrt", maxval: 100 },
        fixed: 10,
      },
      opacity: {
        mode: "fixed",
        fixed: 0.7,
        varied: { var: "degree", scale: "Linear", min: 0, max: 1 },
      },
      shape: {
        orientation: "oriented",
        type: "StraightArrow",
        arrow_head: { height: 0.5, width: 0.5 },
        arrow_curve: { height: 0.5, center: 0.5 },
      },
    };

    this.config = {
      varnames: {},
      aggrop: "sum",
      filters: [],
      proj: "Mercator / EPSG:3857",
      styles: { nodes: nstyle, links: lstyle },
    };

    // working data structure
    this.data = { nodes: [], links: [], nodes_hash: {}, filters: {} };
  }

  set_nodes_varnames(id, lat, long) {
    this.config.varnames.nodeID = id;
    this.config.varnames.lat = lat;
    this.config.varnames.long = long;
  }

  set_links_varnames(oid, did, vol) {
    this.config.varnames.linkID = [oid, did];
    this.config.varnames.vol = vol;
  }
  set_links_aggr(aggr) {
    this.config.aggrop = aggr;
  }
  set_projection(proj) {
    this.config.proj = proj;
  }
  get_projection(proj) {
    return this.config.proj;
  }
  get_nodes_style() {
    return this.config.styles.nodes;
  }
  update_nodes_style(nstyle) {
    this.config.styles.nodes = nstyle;
  }
  update_links_style(lstyle) {
    this.config.styles.links = lstyle;
  }
  get_links_style() {
    return this.config.styles.links;
  }

  // export app state
  export() {
    var zip = new JSZip();
    // delete this.config.legend
    zip.file(
      "arabesque.json",
      JSON.stringify({
        nodes: this.data.nodes,
        links: this.data.links,
        config: this.config,
      })
    );
    zip
      .generateAsync({
        type: "blob",
      })
      .then(function (content) {
        // see FileSaver.js
        saveAs(content, "export_arabesque.zip");
      });
  }

  // extract varname from csv or geojson and check filetype
  async preprocess_nodes(file, callback) {
    if (
      (file.type != "text/csv") &
      (file.type != "application/json") &
      (file.type != "application/geo+json")
    ) {
      throw "unsupported file type";
    } else {
      if (file.type == "text/csv") {
        const reader = new FileReader();
        reader.onload = (event) =>
          callback(reader.result.split("\n")[0].split(","));
        reader.readAsText(file.slice(0, 8000));
      } else {
        const reader = new FileReader();
        reader.onload = (event) =>
          callback(
            Object.keys(JSON.parse(reader.result).features[0].properties)
          );
        reader.readAsText(file);
      }
    }
  }

  // import nodes and convert to geojson points
  async import_nodes(file, callback) {
    if (
      (file.type != "text/csv") &
      (file.type != "application/json") &
      (file.type != "application/geo+json")
    ) {
      throw "unsupported file type";
    } else {
      var that = this;
      if (file.type == "text/csv") {
        const reader = new FileReader();
        reader.onload = function (event) {
          that.data.nodes = that.create_geojson(
            papaparse(reader.result, { header: true, skipEmptyLines: true })
              .data
          );
          callback();
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = function (event) {
          let data = JSON.parse(reader.result);
          data.features.forEach((f) => {
            f.geometry = turf.centroid(f.geometry).geometry;
            //reverse long and lat
            let long = f.geometry.coordinates[0];
            let lat = f.geometry.coordinates[1];
            f.geometry.coordinates = [lat, long];

            //Convert node id to string to avoid type confusion when filtering
            f.properties[that.config.varnames.nodeID] = f.properties[
              that.config.varnames.nodeID
            ].toString();
          });
          that.data.nodes = data.features;
          callback();
        };
        reader.readAsText(file);
      }
    }
  }
  // extract varname from csv a
  async preprocess_links(file, callback) {
    if (file.type != "text/csv") {
      throw "unsupported file type";
    } else {
      const reader = new FileReader();
      reader.onload = (event) =>
        callback(reader.result.split("\n")[0].split(",")); // callback(reader.result.split("\n")[0].split(","));
      reader.readAsText(file.slice(0, 8000));
    }
  }

  async import_links(file, callback) {
    if (file.type != "text/csv") {
      throw "unsupported file type";
    } else {
      var that = this;
      const reader = new FileReader();
      reader.onload = function (event) {
        let links = papaparse(reader.result, {
          header: true,
          skipEmptyLines: true,
        });
        that.data.links = links.data;
        var import_resume = that.import();

        callback(
          import_resume,
          that.get_nodes(),
          that.get_links(),
          that.config
        );
      };
      reader.readAsText(file);
    }
  }

  reduceAddC(that) {
    return function (p, v) {
      return p + +v[that.config.varnames.vol];
    };
  }

  reduceRemC(that) {
    return function (p, v) {
      return p - +v[that.config.varnames.vol];
    };
  }

  reduceIniC(that) {
    return function () {
      return 0;
    };
  }

  reduceAddNodeC(that, vname) {
    return function (p, v) {
      p.n = p.n + 1;
      p.w = p.w + +v[that.config.varnames.vol];
      return p;
    };
  }

  reduceRemNodeC(that) {
    return function (p, v) {
      p.n = p.n - 1;
      p.w = p.w - +v[that.config.varnames.vol];
      return p;
    };
  }

  reduceIniNodeC(that) {
    return function () {
      return { n: 0, w: 0 };
    };
  }

  import() {
    // list of nodes ids. Convert to string so there is no type confusions
    let nodes_ids = this.data.nodes.map(
      (n) => n.properties[this.config.varnames.nodeID]
    );

    // convert to set to remove duplicates
    let nodes_ids_distincts = new Set(nodes_ids);

    // extract nodes ids from links
    let nodes_ids_o = this.data.links.map(
      (l) => l[this.config.varnames.linkID[0]]
    );
    let nodes_ids_d = this.data.links.map(
      (l) => l[this.config.varnames.linkID[1]]
    );

    // convert to set to remove duplicates
    let links_ids_distincts = new Set(nodes_ids_o.concat(nodes_ids_d));

    // keep nodes that are present in links
    let final_nodes = new Set(
      [...nodes_ids_distincts].filter((n) => links_ids_distincts.has(n))
    );

    // remove links with unkwown origine or destination
    let nb_links_beforecleanning = this.data.links.length;
    this.data.links = this.data.links.filter(
      (l) =>
        final_nodes.has(l[this.config.varnames.linkID[0]]) &
        final_nodes.has(l[this.config.varnames.linkID[1]])
    );

    // build the final nodes kept the first in case of duplicates
    // build the node hash for quick node access
    let kept_nodes = [];
    for (let p = 0; p < nodes_ids.length; p++) {
      if (!(nodes_ids[p] in this.data.nodes_hash)) {
        this.data.nodes[p].id = nodes_ids[p];
        this.data.nodes_hash[nodes_ids[p]] = this.data.nodes[p];
        kept_nodes.push(this.data.nodes[p]);
      }
    }
    this.data.nodes = kept_nodes;

    // add distance in links
    this.add_links_stats();

    // crossfilter creation
    this.data.crossfilters = crossfilter(this.data.links);

    // create dimension on o,d for links aggregation
    this.data.od_dim = this.data.crossfilters.dimension(
      (l) =>
        l[this.config.varnames.linkID[0]] +
        "->" +
        l[this.config.varnames.linkID[1]]
    );
    this.data.links_aggregated = this.data.od_dim
      .group()
      .reduce(
        this.reduceAddC(this),
        this.reduceRemC(this),
        this.reduceIniC(this)
      );

    // create dimension on links origins for nodes out stats
    this.data.from_dim = this.data.crossfilters.dimension(
      (l) => l[this.config.varnames.linkID[0]]
    );
    this.data.nodes_from_aggregated = this.data.from_dim
      .group()
      .reduce(
        this.reduceAddNodeC(this),
        this.reduceRemNodeC(this),
        this.reduceIniNodeC(this)
      );

    // create dimension on links destinations for nodes in stats
    this.data.to_dim = this.data.crossfilters.dimension(
      (l) => l[this.config.varnames.linkID[1]]
    );
    this.data.nodes_to_aggregated = this.data.to_dim
      .group()
      .reduce(
        this.reduceAddNodeC(this),
        this.reduceRemNodeC(this),
        this.reduceIniNodeC(this)
      );

    // update nodes stats degree, wheighted degree, balance,...
    this.init_nodes_stats();
    this.update_nodes_stats();

    // import statistics
    return {
      nb_nodes: final_nodes.size,
      nb_links: this.data.links.length,
      nb_removed_nodes: nodes_ids.length - final_nodes.size,
      nb_removed_links: nb_links_beforecleanning - this.data.links.length,
      nb_aggregated_links: this.data.links_aggregated.all().length,
    };
  }

  async import_zip(file, callback) {
    var that = this;
    JSZip.loadAsync(file)
      .then(function (zip) {
        return zip.file("arabesque.json").async("string");
      })
      .then(function (data) {
        let saved_data = JSON.parse(data);

        that.config = saved_data.config;
        that.data.nodes = saved_data.nodes;
        that.data.links = saved_data.links;
        for (let p = 0; p < that.data.nodes.length; p++) {
          that.data.nodes_hash[that.data.nodes[p].id] = that.data.nodes[p];
        }

        // crossfilter creation
        that.data.crossfilters = crossfilter(that.data.links);

        // create dimension on o,d for links aggregation
        that.data.od_dim = that.data.crossfilters.dimension(
          (l) =>
            l[that.config.varnames.linkID[0]] +
            "->" +
            l[that.config.varnames.linkID[1]]
        );

        that.data.links_aggregated = that.data.od_dim
          .group()
          .reduce(
            that.reduceAddC(that),
            that.reduceRemC(that),
            that.reduceIniC(that)
          );

        // create dimension on links origins for nodes out stats
        that.data.from_dim = that.data.crossfilters.dimension(
          (l) => l[that.config.varnames.linkID[0]]
        );

        that.data.nodes_from_aggregated = that.data.from_dim
          .group()
          .reduce(
            that.reduceAddNodeC(that),
            that.reduceRemNodeC(that),
            that.reduceIniNodeC(that)
          );

        // create dimension on links destinations for nodes in stats
        that.data.to_dim = that.data.crossfilters.dimension(
          (l) => l[that.config.varnames.linkID[1]]
        );
        that.data.nodes_to_aggregated = that.data.to_dim
          .group()
          .reduce(
            that.reduceAddNodeC(that),
            that.reduceRemNodeC(that),
            that.reduceIniNodeC(that)
          );

        // update nodes stats degree, weighted degree, balance,...
        that.init_nodes_stats();
        that.update_nodes_stats();

        let filters = that.config.filters;
        that.config.filters = [];
        filters = [];
        filters.push({ id: that.config.varnames.vol });
        let dimensions = filters.map((f) => that.create_filter(f.id));
        let groups = dimensions.map((d) => d.group());

        let res = {
          nb_nodes: that.data.nodes.length,
          nb_links: that.data.links.length,
          nb_removed_nodes: 0,
          nb_removed_links: 0,
          nb_aggregated_links: that.data.links_aggregated.all().length,
        };

        callback(res, that.config.filters, dimensions, groups, that.config);
      });
  }

  get_nodes() {
    this.update_nodes_stats();
    return this.data.nodes;
  }

  get_links() {
    return this.data.links_aggregated.all().filter((l) => l.value > 0);
  }

  //Updates nodes stats from incoming and outcoming flows
  update_nodes_stats() {
    let nto = this.data.nodes_to_aggregated.all();
    for (let i = 0; i < nto.length; i++) {
      this.data.nodes_hash[nto[i].key].properties["indegree"] = nto[i].value.n;
      this.data.nodes_hash[nto[i].key].properties["weighted indegree"] =
        nto[i].value.w;
    }
    let nfrom = this.data.nodes_from_aggregated.all();
    for (let i = 0; i < nfrom.length; i++) {
      this.data.nodes_hash[nfrom[i].key].properties["outdegree"] =
        nfrom[i].value.n;
      this.data.nodes_hash[nfrom[i].key].properties["weighted outdegree"] =
        nfrom[i].value.w;
    }
    for (let i = 0; i < this.data.nodes.length; i++) {
      this.data.nodes[i].properties["degree"] =
        this.data.nodes[i].properties["indegree"] +
        this.data.nodes[i].properties["outdegree"];
      this.data.nodes[i].properties["weighted degree"] =
        this.data.nodes[i].properties["weighted indegree"] +
        this.data.nodes[i].properties["weighted outdegree"];
      this.data.nodes[i].properties["balance"] =
        this.data.nodes[i].properties["indegree"] -
        this.data.nodes[i].properties["outdegree"];
      this.data.nodes[i].properties["weighted balance"] =
        this.data.nodes[i].properties["weighted indegree"] -
        this.data.nodes[i].properties["weighted outdegree"];
    }
  }

  init_nodes_stats() {
    for (let p = 0; p < this.data.nodes.length; p++) {
      this.data.nodes[p].properties["weighted indegree"] = 0;
      this.data.nodes[p].properties["weighted outdegree"] = 0;
      this.data.nodes[p].properties["weighted degree"] = 0;
      this.data.nodes[p].properties["weighted balance"] = 0;
      this.data.nodes[p].properties["indegree"] = 0;
      this.data.nodes[p].properties["outdegree"] = 0;
      this.data.nodes[p].properties["balance"] = 0;
      this.data.nodes[p].properties["degree"] = 0;
    }
    //let links = this.data.links_aggregated.all();
    //for(let i=0;i<links.length;i++){
    //  let from = links[i].key.split("->")[0];
    //  let to   = links[i].key.split("->")[1];
    //  this.data.nodes_hash[from].properties["weigthed outdegree"]=this.data.nodes_hash[from].properties["weigthed outdegree"]+links[i].value;
    //  this.data.nodes_hash[to].properties["weigthed indegree"]=this.data.nodes_hash[to].properties["weigthed indegree"]+links[i].value;
    //  this.data.nodes_hash[from].properties["weigthed degree"]=this.data.nodes_hash[from].properties["weigthed degree"]+links[i].value;
    //  this.data.nodes_hash[to].properties["weigthed degree"]=this.data.nodes_hash[to].properties["weigthed degree"]+links[i].value;
    //  this.data.nodes_hash[from].properties["outdegree"]=this.data.nodes_hash[from].properties["outdegree"]+1;
    //  this.data.nodes_hash[to].properties["indegree"]=this.data.nodes_hash[to].properties["indegree"]+1;
    //  this.data.nodes_hash[from].properties["balance"]=this.data.nodes_hash[from].properties["balance"]-links[i].value;
    //  this.data.nodes_hash[to].properties["balance"]=this.data.nodes_hash[to].properties["balance"]+links[i].value;
    //}
  }

  add_links_stats() {
    for (let i = 0; i < this.data.links.length; i++) {
      let from = this.data.links[i][this.config.varnames.linkID[0]];
      let to = this.data.links[i][this.config.varnames.linkID[1]];
      this.data.links[i]["distance"] = turf.distance(
        this.data.nodes_hash[from],
        this.data.nodes_hash[to]
      );
    }
  }

  // utils to convert csv to geojson
  create_geojson(data) {
    var len = data.length;
    var points = [];
    for (var p = 0; p < len; p++) {
      try {
        var point = turf.point(
          [
            Number(data[p][this.config.varnames.lat]),
            Number(data[p][this.config.varnames.long]),
          ],
          data[p]
        );
        points.push(point);
      } catch {}
    }
    return points;
  }

  create_filter(vname) {
    let dim = this.data.crossfilters.dimension((l) => +l[vname]);
    this.data.filters[vname] = dim;

    this.config.filters.push({
      id: vname,
      range: [
        +dim.group().all()[0].key,
        +dim.group().all()[dim.group().all().length - 1].key,
      ],
    });

    return dim;
  }
}
