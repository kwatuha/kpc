// JavaScript Document
var ngGlobalSettings = window.erpGlobal;
var ngAppSettings =window.erpGlobal.serverSettings[window.erpGlobal.serverMode];

$(document).ready(function(){
	var txt = "Enter your ID/Passport Number Here..."
	$('#confirm-id-number').keypress(function(){
	}).focusin(function(e){
		if($(this).val()==txt){
			$(this).val("");
		}
	}).focusout(function(e) {
		if($(this).val()==""){
			$(this).val(txt);
		}
    });

	$('#get-voter-information').click(function(){
		var vID = $('#confirm-id-number').val();
		if(vID != txt && vID !=""){
			getVoterInformation(vID);
		}
	});

});
var getVoterInformation = function(voterID){
	var shapeLoadInstance = Math.random();
	$.ajax({
		url: ngAppSettings.gisApi+"voter/"+voterID+"/?type=info&token=afd3877583a07e5b77e447332bb98a80",
		dataType: "json",
		beforeSend: function(){
			clearAllLayers();
			clearMarkers();//Clear all markers from the map
			manageLoadings.start(shapeLoadInstance);
			$('#voter-name').html("");
			$('#voter-county').html("");
			$('#voter-constituency').html("");
			$('#voter-ward').html("");
			$('#voter-pollingstation').html("");
			$('#voter-information-content').slideUp(200); 
			$('#voter-information-content-wrong').slideUp(200);
		},
		error: function(){
			manageLoadings.stop(shapeLoadInstance);
			var errorPopUp = new ModalWindow({
				parent:"#gadget",
				title:"Error Loading Voter Information",
				content: "There was an error, while trying to fetch your details. Please refresh and try again. If the problem persists, visit your polling centre with your ID or Passport as soon as possible."
			});
			errorPopUp.create();
		},
		success: function(json){
			manageLoadings.stop(shapeLoadInstance);
			if(json.status=="SUCCESS" && json.voter_info.name !=undefined){
				var Voter = json.voter_info;
				$('#voter-name').html(Voter.name);
				$('#voter-county').html(Voter.county);
				$('#voter-constituency').html(Voter.constituency);
				$('#voter-ward').html(Voter.ward);
				$('#voter-pollingstation').html(Voter.pollingStation.name);
				var locationsOBJ = {
					county: [Voter.county, Voter.polygon.county],
					constituency: [Voter.constituency, Voter.polygon.constituency],
					ward: [Voter.ward, Voter.polygon.ward]
				}
				drawVoterLocation(locationsOBJ);
				showVoterLocation(Voter.pollingStation)
				$('#voter-information-content').slideDown(700);
			}
			else if(json.status=="ID_ERROR"){
				$('#voter-information-content-wrong').html("Sorry, details for the ID Number entered are inaccurate.");
				$('#voter-information-content-wrong').slideDown(700);
			}
			else{
				$('#voter-information-content-wrong').html("Your name is not in the Register. Confirm you have entered the right ID No. If you are certain, visit your polling centre with your ID or Passport as soon as possible.");
				$('#voter-information-content-wrong').slideDown(700);
			}
		}
	});
}

var layerzIndexes = {
	county: 0.2,
	constituency: 0.5,
	ward: 0.8
}

var drawVoterLocation = function(shapes){
	$.each(shapes, function(s, shape){
		var shapeLoadInstance = Math.random();
		$.ajax({
			url: shape[1],
			dataType: "json",
			beforeSend: function(){
				manageLoadings.start(shapeLoadInstance);
			},
			error: function(){
				manageLoadings.stop(shapeLoadInstance);
				var errorPopUp = new ModalWindow({
					parent:"#gadget",
					title:"Error Loading Shapes",
					content: "There was an error while fetching "+shape[0]
				});
				errorPopUp.create();
			},
			success: function(geo){
				manageLoadings.stop(shapeLoadInstance);
				if(voterInformationLayers){
					if(voterInformationLayers[s]){
						voterInformationLayers[s].setMap(null);
					}
				}
				else{
					voterInformationLayers={};
				}
				var polygonCoordsArray = geo.features[0].geometry.coordinates;
				var polygonType = geo.features[0].geometry.type;
				var polyCoords = [];
				if(polygonType=="Polygon"){
					$.each(polygonCoordsArray, function(c, coords){
						$.each(coords, function(pc, pcoords){
							polyCoords.push(new google.maps.LatLng(pcoords[1], pcoords[0]))
						})
					});
				}
				else{
					$.each(polygonCoordsArray, function(c, coords){
						var partPath = [];
						$.each(coords, function(pc, pcoords){
							$.each(pcoords, function(ar, arcoords){
								partPath.push(new google.maps.LatLng(arcoords[1], arcoords[0]))
							});
							polyCoords.push(partPath)
						})
					});
				}

				var layerConfigs = {
					polyType: s,
					polyName: shape[0],
					strokeColor: "#243F1F",
					strokeWeight: 2,
					map:map,
					fillOpacity: 0.1,
					fillColor: "#6FC137",
					path: polyCoords,
					zIndex: layerzIndexes[s],
				}

				voterInformationLayers[s] = new google.maps.Polygon(layerConfigs);
				if(s=="county"){
					map.fitBounds(voterInformationLayers[s].getBounds())
				}

				google.maps.event.addListener(voterInformationLayers[s], 'click', function(event){
					map.fitBounds(this.getBounds());
				});

				google.maps.event.addListener(voterInformationLayers[s], "mouseover", function(event){//Behavior of the map on hover
					layerInfo.open(map);
					layerInfo.setContent("<div class='infoWindow'><div class='infoWindow-title control-bar'>"+shape[0]+" "+s.capitalize()+"</div></div>");
				});

				google.maps.event.addListener(voterInformationLayers[s], 'mousemove', function(event){
					layerInfo.setPosition(event.latLng);
				});

				google.maps.event.addListener(voterInformationLayers[s], 'mouseout', function(event){
					layerInfo.close();
				});
			}
		});
	});
}

var showVoterLocation = function(vP){
	var config = vP.point;
	if(voterInformationLayers){
		if(voterInformationLayers["pollingstation"]){
			voterInformationLayers["pollingstation"].setMap(null);
		}
	}
	var userLocaMarker = new google.maps.Marker({
		position: new google.maps.LatLng(config.lat, config.lon),
		title: vP.name,
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			fillColor: '#298CBC',
			fillOpacity: 0.9,
			strokeColor: '#203357',
			strokeWeight: 3,
			scale: 9
		},
		map:map
	});
	voterInformationLayers["pollingstation"] = userLocaMarker;
}
