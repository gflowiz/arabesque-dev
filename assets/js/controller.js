import barChart from "./barchartfilter.js";



export default class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    document.getElementById("ImportData").addEventListener("click",this.import_handler.bind(this))
    document.getElementById("NodesImportFile").addEventListener("change", this.import_nodes_file.bind(this))
    document.getElementById("ImportNodes").addEventListener("click", this.import_nodes.bind(this))
    document.getElementById("LinksImportFile").addEventListener("change", this.import_links_file.bind(this))
    document.getElementById("ImportLinks").addEventListener("click", this.import_links.bind(this))
    document.getElementById("ImportZip").addEventListener("change",this.import_zip.bind(this))
    document.getElementById("ExportMap").addEventListener("click",this.model.export.bind(this.model))

    this.load_projections()
    document.getElementById("projection").addEventListener("change", this.set_projection.bind(this));
    //Change node semio
    document.getElementById("buttonChangeLayernode").addEventListener("click",this.show_nodes_semio.bind(this))


    this.charts = []

    console.log("controller1")
    console.log(this.model.data)
  }

  import_handler(){
    this.view.import_nodes()
  }
  import_nodes_file(){
    let nodesfile = document.getElementById("NodesImportFile").files[0];
    this.view.set_nodes_file_name(nodesfile.name);
    if(nodesfile.type==="text/csv"){
      this.view.update_import_csv()
    }
    this.model.preprocess_nodes(nodesfile,this.view.update_import_nodes_modal).catch(this.view.error_nodes_file());
  }
  import_nodes(){
    
    let nodesfile = document.getElementById("NodesImportFile").files[0];

    let id,lat,long;
    if (nodesfile.type === "text/csv") {
      id = document.getElementById("NodeImportID").value.replace(/\"/g,'')
      lat = document.getElementById("NodeImportLat").value.replace(/\"/g,'')
      long = document.getElementById("NodeImportLong").value.replace(/\"/g,'')

    }
    //If nodes is in geojson format, there is no proper varname
    else {
      id = document.getElementById("NodeImportID").value.replace(/\"/g,'')
      lat = null;
      long = null;
    }

    //Delete "" from values (they are already strings)

    this.model.set_nodes_varnames(id,lat,long)
    this.model.import_nodes(nodesfile,this.view.import_links).catch(this.view.error_nodes_file());
  }
  import_links_file(){
    let linksfile = document.getElementById("LinksImportFile").files[0];
    this.view.set_links_file_name(linksfile.name);
    this.model.preprocess_links(linksfile,this.view.update_import_links_modal).catch(this.view.error_links_file());
  }
  import_links(){
    let linksfile = document.getElementById("LinksImportFile").files[0];

    //Delete "" from values (they are already strings)
    let origin_id = document.getElementById("LinksImportOrigineID").value.replace(/\"/g,'');
    let dest_id = document.getElementById("LinksImportDestinationID").value.replace(/\"/g,'');
    let volume_id = document.getElementById("LinksImportVolume").value.replace(/\"/g,'');
    console.log(origin_id,dest_id,volume_id);

    this.model.set_links_varnames(origin_id,dest_id,volume_id)
    this.model.set_links_aggr(document.getElementById("LinksImportOrigineID").value)
    this.model.import_links(linksfile,this.view.import_end.bind(this.view)).catch(this.view.error_links_file());
  }
  import_zip(){
    let zipfile = document.getElementById("ImportZip").files[0];
    this.model.import_zip(zipfile,this.post_import_zip.bind(this)).catch(this.view.error_zip_file());
  }
  post_import_zip(res,filters,dimensions,groups,config){
    for(let i=0;i<filters.length;i++){
        let f=new barChart(filters[i].id,dimensions[i],groups[i],this.render_all.bind(this));
        let div= document.createElement("div")
        div.id=`filter-${filters[i].id}`
        document.getElementById("Filters").append(div)
        //Create chart
        f.chart(div)
        this.charts.push(f)
    }
    this.view.import_end(res,this.model.get_nodes(),this.model.get_links(),config)
    document.getElementById("projection-"+this.model.get_projection()).selected=true;
    this.view.set_projection(this.model.get_projection(),this.model.get_nodes(),this.model.get_links(),config);
  }
  set_projection(){
    let proj_sel = document.getElementById("projection")
    let proj = proj_sel.options[proj_sel.selectedIndex].value
    console.log(proj)
    this.model.set_projection(proj);
    let config = this.model.config;
    this.view.set_projection(proj,this.model.get_nodes(),this.model.get_links(),config);
  }
  load_projections(){
    let projs = Object.keys(global.projections)
    document.getElementById("projection").innerHTML = projs.map(p => "<option id='projection-"+p+"' value='"+p+"''>"+global.projections[p].name+"</option>").join("")
  }
  add_filter(id,dimension,group){
    let f=new barChart(id,dimension,group,this.render_all.bind(this))
    let div= document.createElement("div")
    div.id=`filter-${id}`
    document.getElementById("Filters").append(div)
    f.chart(div)
    this.charts.push(f)
  }
  show_nodes_semio(){

    let nstyle = this.model.get_nodes_style();
    //We need them in the modal to be able to chose according to which property the color will vary
    let nodes_properties = Object.keys(this.model.data.nodes[0].properties);

    this.view.update_nodes_semio(nstyle, nodes_properties);
    console.log(this.model.config)
    // let validate_semio_button = document.getElementById("addSemioButtonNode");
    // validate_semio_button.addEventListener("click",this.save_nodes_semio.bind(this));
  }
  save_nodes_semio(){

    console.log("save semio")
    let nstyle = this.model.config.styles.nodes;
    // let fixedColor = document.getElementById('singleColorPicker').value;
    console.log(fixedColor)
    nstyle.color.fixed = fixedColor;

    //Update the model config
    this.model.update_nodes_style(nstyle);

    //Re-render the nodes with new color
    this.view.renderer.update_nodes(this.model.get_nodes(),this.model.get_nodes_style())
  }
  render_all(){
    let proj_sel = document.getElementById("projection")
    let proj = proj_sel.options[proj_sel.selectedIndex].value
    console.log(proj)
    this.view.renderer.render(this.model.get_nodes(),this.model.get_links(), this.model.get_nodes_style(),this.model.get_links_style())
  }
}
