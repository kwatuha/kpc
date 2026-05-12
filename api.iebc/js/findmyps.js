// JavaScript Document
$(document).click(function(){
	if(!userLocationMarker){
		userLocationMarker = createLocMarker("../images/marker.png", "This is where I live!!");
	}
	getAdressLocation("where_I_live", userLocationMarker);
});

var layerLoadTimer; //Holds the timer to check layerloadcomplete

myLocationDrillDown = function(){
	var thisLocType;
	if(layerLoadTimer){
		clearInterval(layerLoadTimer);
	}
	if(CURRENT_GADGET_LOCATION){
		thisLocType = CURRENT_GADGET_LOCATION.type;
	}
	else{
		thisLocType = CURRENT_ELECTION.location;
	}
	var myLocationLayer = layerManager[thisLocType];
	if(layerManager[thisLocType]){
		$.each(myLocationLayer.polygons, function(p, poly){
			if(poly.contains(userLocationMarker.getPosition())){
				if(thisLocType != "ward"){
					locationSelection({
							type:childParentMappings.down[thisLocType],
							code: poly.polyID,
							name: poly.polyName,
							layer: layerManager[thisLocType]
					});
				}
				else{
					layerManager["pollingstation"] = PollingStationsManager(poly.polyID);
					clearInterval(layerLoadTimer);
				}
			}
		});
		layerLoadTimer = setInterval(function(){
			if(layerManager[thisLocType].done){
				if(thisLocType != "ward"){
					myLocationDrillDown();
				}
			}
		}, 1000);
		if(thisLocType == "ward"){
			clearInterval(layerLoadTimer);
		}
	}
}