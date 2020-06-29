import { Map, View, Feature} from 'ol';
import {defaults as defaultControls, Control} from 'ol/control';
import FullScreen from 'ol/control/FullScreen';
import TileLayer from 'ol/layer/Tile';
import {Polygon, Circle} from 'ol/geom.js';
import {Fill, Stroke, Text, Style} from 'ol/style.js';
import {Tile,Vector as VectorLayer} from 'ol/layer.js';
import {OSM,Vector as VectorSource, XYZ} from 'ol/source.js';
import {transform} from 'ol/proj';
import * as d3 from 'd3';
import {boundingExtent} from 'ol/extent';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {get as getProjection} from 'ol/proj';


export default class OlRenderer {
  constructor(divid) {

    let projs = Object.keys(global.projections)
    projs.forEach(p => proj4.defs(p,global.projections[p].proj4))
    register(proj4);

    var myElement = document.createElement("div");
    myElement.id = "ExportMap";
    myElement.className = "custom-control"
    var myControl = new Control({element: myElement})

    this.map = new Map({
      controls: defaultControls().extend([myControl, new FullScreen()]),
      target: "Mapcontainer",
      layers: [ new TileLayer({
        source: new OSM()
      }) ],
      renderer: 'webgl',
      view: new View({
        center: [0, 0],
        zoom: 10,
        projection:getProjection("Mercator / EPSG:3857"),
        minZoom:-3,
        multiWorld:false
      })
    });

    this._extent_size = 10000000;
    this._scale_node_size = d3.scaleSqrt();
    this._node_size_var = "degree";
    this._node_size_ratio = 100;

    this._scale_link_size = d3.scaleSqrt();
    this._link_size_ratio = 100	;
  }

  fresh(){
    this.map.updateSize();
    this.map.render();
  }

  nodeStyle(feature){
    return new Style({
              stroke: new Stroke({
              color: 'white',
              width: 0
          }),
          fill: new Fill({
              color: 'rgba(0,0,0,0.7)'
          })
    })
  }
  nodeSizeScale(node){
    return this._scale_node_size(+node.properties[this._node_size_var]);
  }

  add_nodes(nodes){
    var map = this.map;
    // nettoyage
    this.map.removeLayer(this.get_layer("nodes"));
    // projection
    let proj_nodes = nodes.map(function(n){
      return {center:transform([n.geometry.coordinates[1],n.geometry.coordinates[0]],'EPSG:4326',map.getView().getProjection()),properties:n.properties,id:n.id};
    });
    // calcul de l'extent des noeuds pour definition des échelles 
    let xs=[d3.max(proj_nodes,n=>n.center[0]),d3.min(proj_nodes,n=>n.center[0])];
    let ys=[d3.max(proj_nodes,n=>n.center[1]),d3.min(proj_nodes,n=>n.center[1])];
    this._extent_size = Math.min(xs[0]-xs[1],ys[0]-ys[1]);

    // recherche du max pour l'échelle
    let mval = d3.max(nodes,n=>n.properties[this._node_size_var])

    // definition de l'échelle
    this._scale_node_size.range([0,this._extent_size/100*(this._node_size_ratio/100)]).domain([0,mval])
    var ns  = this.nodeSizeScale.bind(this);
    
    // calcul des rayon et stockage des noeuds dans une hash
    proj_nodes = proj_nodes.map(function(n){return {center:n.center,radius:ns(n),properties:n.properties,id:n.id}})
    this.proj_nodes = proj_nodes;
    this.proj_nodes_hash = {}
    proj_nodes.forEach(n => this.proj_nodes_hash[n.id]=n)
    
    // création des ronds
    let nodes_vector = new VectorSource({
        features: proj_nodes.map(co => new Feature(new Circle(co.center, co.radius)))
    });

    // création de la couche
    let nodesLayer = new VectorLayer({
        name: "nodes",
        source: nodes_vector,
        renderMode: 'image',
        style: this.nodeStyle.bind(this)
    })
    // ajout de la couche 
    this.map.addLayer(nodesLayer);
    
    //  
    this.map.getView().fit(boundingExtent(proj_nodes.map(co => co.center)))
  }
  update_nodes(nodes){
  	console.log("up")
      var map = this.map;
      map.removeLayer(this.get_layer("nodes"));
      let proj_nodes = nodes.map(function(n){
        return {center:transform([n.geometry.coordinates[1],n.geometry.coordinates[0]],'EPSG:4326',map.getView().getProjection()),properties:n.properties,id:n.id};
      });
      var ns  = this.nodeSizeScale.bind(this);
      proj_nodes = proj_nodes.map(function(n){return {center:n.center,radius:ns(n),properties:n.properties,id:n.id}})
      this.proj_nodes = proj_nodes;
      this.proj_nodes_hash = {}
      proj_nodes.forEach(n => this.proj_nodes_hash[n.id]=n)
      let nodes_vector = new VectorSource({
          features: proj_nodes.map(co => new Feature(new Circle(co.center, co.radius)))
      });

      let nodesLayer = new VectorLayer({
          name: "nodes",
          source: nodes_vector,
          renderMode: 'image',
          style: this.nodeStyle.bind(this)
      })
      this.map.addLayer(nodesLayer);
  }


  linkStyle(feature){
    return new Style({
          fill: new Fill({
              color: 'rgba(0,0,0,0.1)'
          })
        })
  }


  add_links(links){
    this.map.removeLayer(this.get_layer("links"));

    let style = {geometry :{head :{ height:0.3,width:0.5}},ratioBounds:0.9};
    let mval = d3.max(links,l => l.value)
    this._scale_link_size.range([0,this._extent_size/100*(this._node_size_ratio/100)]).domain([0,mval])
    var link_size=this._scale_link_size;
    var nodes_hash =this.proj_nodes_hash;
    let arrow = links.map(function(l){
      let from  = l.key.split("->")[0];
      let to    = l.key.split("->")[1];
      let width = link_size(l.value)
      let arrow = orientedStraightArrow(style,nodes_hash[from].center,nodes_hash[to].center,nodes_hash[from].radius,nodes_hash[to].radius,width);
      return arrow
    })

    let links_shapes = arrow.map(a => new Feature(new Polygon([a])))

    this.links   = new VectorSource({
        features: links_shapes
    });
    this.linksLayer = new VectorLayer({
        name: "links",
        source: this.links,
        style: this.linkStyle.bind(this),
        renderMode: 'image'
    });
    this.map.addLayer(this.linksLayer);
  }


  update_links(links){
    this.map.removeLayer(this.get_layer("links"));

    let style = {geometry :{head :{ height:0.3,width:0.5}},ratioBounds:0.9};
    var link_size=this._scale_link_size;
    var nodes_hash =this.proj_nodes_hash;
    let arrow = links.map(function(l){
      let from  = l.key.split("->")[0];
      let to    = l.key.split("->")[1];
      let width = link_size(l.value)
      let arrow = orientedStraightArrow(style,nodes_hash[from].center,nodes_hash[to].center,nodes_hash[from].radius,nodes_hash[to].radius,width);
      return arrow
    })

    let links_shapes = arrow.map(a => new Feature(new Polygon([a])))

    let links_vector   = new VectorSource({
        features: links_shapes
    });
    let linksLayer = new VectorLayer({
        name: "links",
        source: links_vector,
        style: this.linkStyle.bind(this),
        renderMode: 'image'
    });
    this.map.addLayer(linksLayer);
  }
  set_projection(proj,nodes,links){
    let olproj = getProjection(proj)
    console.log(olproj)
    this.map.setView(new View({
      center: [0, 0],
      zoom: 10,
      projection:olproj,
      minZoom:-3,
      multiWorld:false
    }))
    this.add_nodes(nodes)
    this.add_links(links)
  }

  render(nodes,links){
    this.update_nodes(nodes)
    this.update_links(links)
  }

  get_layer(name){
     let layers = this.map.getLayers().getArray()
     for(let i=0;i<layers.length;i++){
       if (layers[i].values_.name==name){
         return layers[i]
       }
     }
  }

}


function tranposeLine(point_ori, point_dest, distance) {

    var startX = point_ori[0]
    var startY = point_ori[1]
    var endX = point_dest[0]
    var endY = point_dest[1]
    var angle = Math.atan2(endY - startY, endX - startX)

    var NewOri = [Math.sin(angle) * distance + startX, -Math.cos(angle) * distance + startY]
    var Newdest = [Math.sin(angle) * distance + endX, -Math.cos(angle) * distance + endY]

    return [NewOri, Newdest]
}

function getIntersection(ori, dest, radius){
	var startX = ori[0]
    var startY = ori[1]
    var endX = dest[0]
    var endY = dest[1]
    var angle = Math.atan2(endY - startY, endX - startX)

	return [Math.cos(angle) * radius + startX, Math.sin(angle) * radius + startY]
}

// create a simple arrow with en triangle head at a given ratio of the distance
function orientedStraightArrow(style, ori, dest, rad_ori, rad_dest , width) {
    var startX = ori[0]
    var startY = ori[1]
    var endX = dest[0]
    var endY = dest[1]
    var angle = Math.atan2(endY - startY, endX - startX)

    var reducePointdest = getIntersection(dest,ori,rad_dest)
    var reducePointOri = getIntersection(ori,dest,rad_ori)

    var heigth_arrow = style.geometry.head.height
	  var widthArrow = style.geometry.head.width

	  var dist =  Math.sqrt((reducePointdest[0] - reducePointOri[0]) * (reducePointdest[0] - reducePointOri[0]) + (reducePointdest[1] - reducePointOri[1]) * (reducePointdest[1] - reducePointOri[1]))
	  var baseArrow = tranposeLine(reducePointOri, reducePointdest,  2.5 *style.ratioBounds);

    var testWidth =  Math.min(heigth_arrow *width + width , 0.5 *dist)

    var topArrowpoint =  getIntersection(baseArrow[1], baseArrow[0],testWidth)
    var polyPoint = tranposeLine(baseArrow[0], topArrowpoint, width)
    var topArrowpoint =  tranposeLine(baseArrow[0], topArrowpoint, width + widthArrow * width)[1]

    return [baseArrow[0], baseArrow[1],topArrowpoint, polyPoint[1], polyPoint[0], baseArrow[0]]
}
