import React, {useState} from "react";

import {ColorContainerComponent} from "./color_container";

export const NodesSemioModalComponent = (props) => {


    return (
<div class="modal fade" id="semioNodes" tabindex="-1" role="dialog" aria-labelledby="semioModalLabelNode" aria-hidden="true">
   <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
         <div class="modal-header">
            <h5 class="modal-title h2" id="semioModalLabelNode">Choose Nodes Semiology</h5>
         </div>
         <div class="modal-body" >

            {/* Call the colorcontainer with color_mdoe initialized and nodes_properties for displaying in a select div */}
            <ColorContainerComponent color_mode = "fixed" nodes_properties = {props.nodes_properties}/>

            <hr></hr>
            <label for="select" class="h4 strong">Size</label>
            <div class="row"  id="semioSizeAddnode">
               <div class="col-md-2">
                  <label for="select" class="text-muted h5">-</label>
                  <select class="custom-select" id="semioSizeBaseTypeAddnode">
                     <option selected value="fixed">Fixed</option>
                     <option value="varied">Varied</option>
                  </select>
               </div>
            </div>
            <div class='row'>
               <div class="col-md-2">
                  <hr></hr>
                  <label for="select" class="h4 strong">Text</label>
                  <div class="row"  id="semioTextAddnode">
                  </div>
               </div>
               <div class="col-md-10">
                  <hr></hr>
                  <label for="select" class="h4 strong">Opacity</label>
                  <div class="row"  id="semioOpaAddnode">
                     <div class="col-md-2">
                        <label for="select" class="text-muted h5">-</label>
                        <select class="custom-select" id="semioOpaBaseTypeAddnode">
                           <option selected value="fixed">Fixed</option>
                           <option value="varied">Varied</option>
                        </select>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <button class="modal-footer btn btn-dark justify-content-center mt-2"   type="button" id="addSemioButtonNode" data-dismiss="modal" >OK</button>
      </div>
   </div>
</div>

        
    )

}