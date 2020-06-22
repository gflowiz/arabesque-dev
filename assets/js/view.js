
export default class View{
  constructor(renderer) {
    this.renderer = renderer;

    this.body = document.getElementsByTagName("body")[0];
    this.home=document.getElementById("home");
    this.map_container=document.getElementById("map");

    // modal import nodes
    this.ModalImportNodes = document.getElementById("ModalImportNodes");
    this.import_nodes_modal = require("../hbs/import-nodes-modal.hbs");
    this.ModalImportNodes.innerHTML = this.import_nodes_modal();

    // modal import links
    this.ModalImportLinks = document.getElementById("ModalImportLinks");
    this.import_links_modal = require("../hbs/import-links-modal.hbs");
    this.ModalImportLinks.innerHTML = this.import_links_modal();

    // modal import stats
    this.ModalImportStats = document.getElementById("ModalImportStats");
    this.import_stats_modal = require("../hbs/import-stats-modal.hbs");

    // modal node semio
    this.ModalSemioNodes = document.getElementById("ModalSemioNodes");
    this.semio_nodes_modal = require("../hbs/semio-nodes-modal.hbs");

  }

  import_nodes(){
    document.getElementById("NodesFileError").innerHTML="";
    document.getElementById("NodesLatSelect").style.visibility="hidden";
    document.getElementById("NodesLongSelect").style.visibility="hidden";
    document.getElementById("NodesFeaturesSelects").style.visibility="hidden";
    document.getElementById("NodesFileLabel").innerHTML = "Nodes data File"
    document.getElementById("NodesImportFile").value=''
    $("#importNodesModal").modal()
  }
  set_nodes_file_name(filename){
    document.getElementById("NodesFileLabel").innerHTML = filename;
  }
  update_import_csv(){
      document.getElementById("NodesLatSelect").style.visibility="visible";
      document.getElementById("NodesLongSelect").style.visibility="visible";
  }
  update_import_nodes_modal(nodefeatures){
    let opts = nodefeatures.map(f => "<option>"+f+"</option>").join("");
    document.getElementById("NodesFileError").innerHTML="";
    document.getElementById("NodesFeaturesSelects").style.visibility="visible";
    document.getElementById("NodeImportID").innerHTML = opts;
    document.getElementById("NodeImportLat").innerHTML = opts;
    document.getElementById("NodeImportLong").innerHTML = opts;
    document.getElementById("ImportNodes").disabled = false;
  }
  error_nodes_file(evt){
    console.log(evt)
    document.getElementById("NodesFileError").innerHTML = "<b>An error occured during file parsing (check its structure and content)</b>"
  }

  import_links(){
    document.getElementById("LinksFileError").innerHTML="";
    document.getElementById("LinksFeaturesSelects").style.visibility="hidden";
    document.getElementById("LinksFileLabel").innerHTML = "Flows data File"
    document.getElementById("LinksImportFile").value=''
    $("#importLinksModal").modal()
  }
  set_links_file_name(filename){
    document.getElementById("LinksFileLabel").innerHTML = filename;
  }
  update_import_links_modal(linkfeatures){
    let opts = linkfeatures.map(f => "<option>"+f+"</option>").join("");
    document.getElementById("LinksFileError").innerHTML="";
    document.getElementById("LinksFeaturesSelects").style.visibility="visible";
    document.getElementById("LinksImportOrigineID").innerHTML = opts;
    document.getElementById("LinksImportDestinationID").innerHTML = opts;
    document.getElementById("LinksImportVolume").innerHTML = opts;
    document.getElementById("ImportLinks").disabled = false;
  }
  error_links_file(evt){
    console.log(evt)
    document.getElementById("LinksFileError").innerHTML = "<b>An error occured during file parsing (check its structure and content)</b>"
  }
  error_zip_file(evt){
    console.log(evt)
  }

  import_end(import_stats,nodes,links,config){
    this.ModalImportStats.innerHTML = this.import_stats_modal(import_stats)
    $("#importStatsModal").modal()
    this.home.style.display="none";
    this.map_container.style.display="block";
    this.renderer.fresh();
    this.renderer.add_nodes(nodes);
    this.renderer.add_links(links);
  }
  set_projection(proj,nodes,links){
    this.renderer.set_projection(proj,nodes,links)
  }

  update_nodes_semio(semio){
    console.log(semio)
    this.ModalSemioNodes.innerHTML = this.semio_nodes_modal(semio)
    $("#semioNodes").modal()
  }



}
