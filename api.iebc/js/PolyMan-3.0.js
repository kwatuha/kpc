var ngGlobalSettings = window.erpGlobal;
var ngAppSettings =window.erpGlobal.serverSettings[window.erpGlobal.serverMode];

google.maps.Polygon.prototype.contains = function(latLng){ 
	var j = 0; 
	var oddNodes = false; 
	var x = latLng.lng(); 
	var y = latLng.lat(); 
	for (var i = 0; i < this.getPath().getLength(); i++) { 
		j++; 
		if (j == this.getPath().getLength()) { j = 0; } 
		if (((this.getPath().getAt(i).lat() < y) && 
		(this.getPath().getAt(j).lat() >= y)) 
		|| ((this.getPath().getAt(j).lat() < y) && 
		(this.getPath().getAt(i).lat() >= y))) { 
			if (this.getPath().getAt(i).lng() + (y - 
		this.getPath().getAt(i).lat()) 
		/ (this.getPath().getAt(j).lat() - 
		this.getPath().getAt(i).lat()) 
		* (this.getPath().getAt(j).lng() - 
		this.getPath().getAt(i).lng()) < x) { 
				oddNodes = !oddNodes 
			} 
		} 
	} 
	return oddNodes; 
} 

google.maps.Polygon.prototype.getBounds = function() {//returns the bounds of the selected Polygon
	var bounds = new google.maps.LatLngBounds();
	var paths = this.getPaths();
	var path;        
	for (var i = 0; i < paths.getLength(); i++) {
		path = paths.getAt(i);
		for (var ii = 0; ii < path.getLength(); ii++) {
			bounds.extend(path.getAt(ii));
		}
	}
	return bounds;
}
var winnerCode;
var currentLocationName; //Gives the name of the current location clicked.

var myOptions = {//Options for the infoBox
	disableAutoPan: true
	,pixelOffset: new google.maps.Size(-145,10)
	,zIndex: null,
	width:290
	,boxStyle: {
	  opacity: 1
	 }
	,closeBoxURL: ""
	,infoBoxClearance: new google.maps.Size(1, 1)
	,isHidden: false
	,pane: "floatPane"
	,enableEventPropagation: false
};

layerInfo = new InfoBox(myOptions);

var correct_coords = function(coordinates, ptype, inverted){//formats the path for the polygon
	var path = [];
	if(ptype == "Polygon"){
		$.each(coordinates, function(c, coords){
			$.each(coords, function(pc, pcoords){
				if(inverted){
					path.push([pcoords[1], pcoords[0]])
				}
				else{
					path.push([pcoords[0], pcoords[1]])
				}
			})
		});
	}
	else{
		$.each(coordinates, function(cs, coords){
			$.each(coords, function(pc, pcoords){
				$.each(pcoords, function(ar, arcoords){
					if(inverted){
						path.push([arcoords[1], arcoords[0]])
					}
					else{
						path.push([arcoords[0], arcoords[1]])
					}
				});
			});
		});
	}
	return path;
}

var registeredVotersByLoc = {};

PolyMan = function(config){
	console.log('selected location---->', config)
	createCookie("selectedLocation", config);
	// set cookie
	var $this = this;
	this.type = config.type;//This defines the type of layer eg county, constituency
	if(config.code){
		this.code = config.code;//If defined, is the code for that specific electoral district
	}
	if(config.name){
		this.name = config.name;
	}
	$('#registered-list-view .body, #totalReg').empty();
	this.done; //defines the status of the polyman load
	this.bounds = new google.maps.LatLngBounds(); //This defines the bounds for the entire layer
	this.polygons = {};//An object that will hold all the polygons for this layer;
	this.selected;// value will be the polygon under selection
	this.create = function(){

		// $.ajax({
		// 	url: "http://api.iebc.or.ke/county/?token=afd3877583a07e5b77e447332bb98a80",
		// 	dataType: "json",
		// 	beforeSend: function(){
		// 		clearMarkers();//Clear all markers from the map
		// 		manageLoadings.start(shapeLoadInstance);
		// 	},
		// 	error: function(){
		// 		manageLoadings.stop(shapeLoadInstance);
		// 	},
		// 	success: function(counties){
		// 		manageLoadings.stop(shapeLoadInstance);
		// 		var j = 0;
		// 		$.each(counties.region.locations, function(cli, county){
		// 			j++;
		// 			setTimeout(function () {
		// 				$.ajax({
		// 					url: "http://api.iebc.or.ke/constituency/?county="+county.code+"&token=afd3877583a07e5b77e447332bb98a80",
		// 					dataType: "json",
		// 					beforeSend: function(){
		// 						manageLoadings.start(shapeLoadInstance);
		// 					},
		// 					error: function(){
		// 						manageLoadings.stop(shapeLoadInstance);
		// 					},
		// 					success: function(constituencies){
		// 						manageLoadings.stop(shapeLoadInstance);
		// 						county.status="SUCCESS";
		// 						county.region=constituencies.region;
		// 						//download(JSON.stringify(county), county.code, 'application/json');
		// 						var i = 0;
		// 						$.each(county.region.locations, function(csi, constituency){
								
									
		// 							$.ajax({
		// 								url: "http://api.iebc.or.ke/ward/?constituency="+constituency.code+"&token=afd3877583a07e5b77e447332bb98a80",
		// 								dataType: "json",
		// 								beforeSend: function(){
		// 									manageLoadings.start(shapeLoadInstance);
		// 								},
		// 								error: function(){
		// 									manageLoadings.stop(shapeLoadInstance);
		// 								},
		// 								success: function(wards){
		// 									manageLoadings.stop(shapeLoadInstance);
		// 									constituency.status="SUCCESS";
		// 									constituency.region=wards.region;
											

		// 									//download(JSON.stringify(constituency), constituency.code, 'application/json');
		// 									$.each(wards.region.locations, function(wrd, ward){
												
		// 										download(JSON.stringify({
		// 											status:"SUCCESS",
		// 											region:ward
		// 										}), ward.code, 'application/json');
		// 									});
											
		// 								}
		// 							});
									
		// 						});
								
		// 					}
		// 				});
		// 			}, 5000*j);
		// 		});
		// 		console.log('proc---',counties);
		// 	}
		// });

		var url = ""; //configure the url that will fetch shapes data from the API.
		if(CURRENT_ELECTION.location=="country" && !$this.code){
			url = "county.json?token="+api_token; //configure the url that will fetch shapes data from the API.
		}else{
			url = ""+$this.type+"/"+$this.code+".json?token="+api_token//+"&"+$this.type+"="+$this.code;
		}
		var shapeLoadInstance = Math.random();
		$.ajax({
			url: url,
			dataType: "json",
			beforeSend: function(){
				clearMarkers();//Clear all markers from the map
				manageLoadings.start(shapeLoadInstance);
			},
			error: function(){
				manageLoadings.stop(shapeLoadInstance);
			},
			success: function(json){
				
				manageLoadings.stop(shapeLoadInstance);
				if(json.status){
					var thisDropDown;
					if($this.type =="ward"){
						var locations = [json.region];
					}
					else{
						var locations = json.region.locations;
						thisDropDown = $('#'+childParentMappings.down[$this.type]+'-dropdown').html('<option value="false">Select '+childParentMappings.down[$this.type]+'</option>');
					}
					var layerShapes=[];
					var totalReg = 0;
					$.each(locations, function(l, locz){
						locz.registered=parseInt(locz.registered)*3.35
						var $option = $('<option value="'+locz.code+'">'+locz.name+'</option>');
						layerShapes.push({
							lnk: locz.polygon,
							name: locz.name,
							code: locz.code
						});
						registeredVotersByLoc[locz.code] = parseInt(locz.registered);
						totalReg+=parseInt(locz.registered);
						if($this.type != "ward"){	
							thisDropDown.append($option);
						}
						if(currentGadget == "registered"){
							var kalayerType = childParentMappings.down[$this.type].capitalize();
							if($this.type == "ward"){
								kalayerType = "Ward"
							}
							var reglocNo = '<div class="result-row div clearfix">\
								<div class="box">\
									<img src="./images/placeholder-no-image.jpg" />\
								</div>\
								<div class="long-box">\
									<div class="title">'+locz.name.capitalize()+' '+kalayerType+'</div>\
									<div class="description"><span style="font-size:13px; font-weight:500 !important">'+addCommas(locz.registered)+'</span> Est. Population</div>\
								</div>\
							</div>';
							if($this.type != "ward"){	
								$('#registered-list-view .body').append(reglocNo);
							}
							else{
								$('#registered-list-view .title .arrow').trigger('click');
							}
							if(!PolyHoverData['registered']){
								PolyHoverData['registered'] = {}
							}
							PolyHoverData['registered'][locz.code] = reglocNo;
						}
					});
					$('#totalReg').append(''+ addCommas(totalReg)+' in '+$this.name+' '+$this.type.capitalize());
					registeredVotersByLoc[$this.code] = totalReg;
					if(!gadgetInMobileView){//Do not load shapes if mobile
						$this.draw(layerShapes);//Draw shapes returned for this layer
					}
					if($this.type !="ward"){						
						thisDropDown.slideDown(700);
						thisDropDown.change(function(){ //When  a drop down is selected
							var selValue = $(this).children('option:selected').val();
							var selText = $(this).children('option:selected').text();
							currentLocationName = selText;
							if(selValue!="false"){
								var clickedSettings = {
									code: selValue,
									type: childParentMappings.down[$this.type],
									layer: $this,
									name: selText
								}
								if($this.type!="ward"){
									locationSelection(clickedSettings);
								}
								stepBack(childParentMappings.down[$this.type]);
							}
							else{
								stepBack($this.type);
							}
						});	
					}
					else{
						layerManager["pollingstation"] = PollingStationsManager(config.code);
					}
				}
				else{
					var errorPopUp = new ModalWindow({
						parent:"#gadget",
						title:"Error Loading Data",
						content: "An Error has occured. Please refresh."
					});
					errorPopUp.create();
				}
			}
		});
	}
	
	this.draw = function(links){ //Draw the shapes from the API to the Map
		console.log('links--->', links);
		var shapeLoadInstance = Math.random();
		$.each(links, function(l, lnk){
            lnk.lnk=lnk.lnk.replace('http://api.iebc.or.ke/','');
			$.ajax({
				url: lnk.lnk,
				dataType:"json",
				beforeSend: function(){
					manageLoadings.start(shapeLoadInstance);
				},
				error: function(){
					manageLoadings.stop(shapeLoadInstance);
				},
				success: function(json){
					if(links.length == l+1){
						$this.done = true;
					}
					manageLoadings.stop(shapeLoadInstance);
					var Polytype = json.features[0].geometry.type;
					var path = correct_coords(json.features[0].geometry.coordinates, Polytype, true);
					var newPaths = [];
					for(var p=0; p<path.length; p++){
						newPaths.push(new google.maps.LatLng(path[p][0],path[p][1]));
						$this.bounds.extend(new google.maps.LatLng(path[p][0],path[p][1]));
					}
					map.fitBounds($this.bounds);
					var layerDef = {
						polyName: lnk.name,
						polyID: lnk.code,
						strokeColor: "#43470C",
						strokeWeight: 2,
						path:newPaths,
						fillOpacity: 0,
						map:map,
						zIndex: 0.2,
						fillColor: "#0C669F"
					}
					var currentStyle = {};
					var polygon = new google.maps.Polygon(layerDef);
					$this.polygons[lnk.code] = polygon;
					if(currentGadget == "registered"){
						polygon.setOptions({
							strokeColor:"#ade1fb",
							fillColor: "#0C669F",
							fillOpacity: 0.5+calculateArea(polygon, registeredVotersByLoc[lnk.code])
						});
					}
					google.maps.event.addListener(polygon, "mouseover", function(event){//Behavior of the map on hover
						currentStyle['fillOpacity'] = this.fillOpacity;
						currentStyle['fillColor'] = this.fillColor;
						currentStyle['strokeWeight'] = this.strokeWeight;
						currentStyle['strokeOpacity'] = this.strokeOpacity;
						currentStyle['zIndex'] = this.zIndex;
						currentStyle['strokeColor'] = this.strokeColor;
						this.setOptions({
							strokeWeight: this.strokeWeight+2,
							fillOpacity: this.fillOpacity+0.2,
							zIndex: 0.9
						});
						
						layerInfo.open(map);
						if(currentGadget == "registered"){
							if(PolyHoverData['registered']){
								if(PolyHoverData['registered'][this.polyID]){
									var HoverInfo = PolyHoverData['registered'][this.polyID];
								}
								else{
									var HoverInfo = this.polyName;
								}
							}
							else{
									var HoverInfo = this.polyName;
							}
						}
						else if(currentGadget == "results"){
							if(PolyHoverData['results']){
								if(PolyHoverData['results'][this.polyID]){
									var HoverInfo = PolyHoverData['results'][this.polyID];
								}
								else{
									var HoverInfo = "No results reported yet!!";
								}
							}
							else{
									var HoverInfo = "No results reported yet!!";
							}
						}
						else{
							if(($this.type=="ward")){
								var HoverInfo = this.polyName.capitalize()+" Ward";

							}
							else{
								var HoverInfo = this.polyName.capitalize()+" "+childParentMappings.down[$this.type].capitalize();
							}
						}
						if($this.type=="ward"){
							layerInfo.setContent("<div class='infoWindow'><div class='infoWindow-title control-bar'>"+this.polyName.capitalize()+" Ward</div><div class='infoWindow-body'>"+HoverInfo+"</div></div>");
						}
						else{
							layerInfo.setContent("<div class='infoWindow'><div class='infoWindow-title control-bar'>"+this.polyName.capitalize()+" "+childParentMappings.down[$this.type].capitalize()+"</div><div class='infoWindow-body'>"+HoverInfo+"</div></div>");
						}
					});
			
					google.maps.event.addListener(polygon, 'mouseout', function(event){
						this.setOptions(currentStyle)
						layerInfo.close();
					});
			
					google.maps.event.addListener(polygon, 'click', function(event){
						map.fitBounds(this.getBounds());
						var clickedSettings = {
							code: this.polyID,
							type: childParentMappings.down[$this.type],
							layer: $this,
							name: this.polyName
						}
						$('#'+childParentMappings.down[$this.type]+'-dropdown').children('option[value='+this.polyID+']').attr("selected", true);
						if($this.type!="ward"){
							locationSelection(clickedSettings);
						}
					});
					
					google.maps.event.addListener(polygon, 'mousemove', function(event){
						layerInfo.setPosition(event.latLng);
					});
					if(currentGadget!="candidates"){
						if($this.type!="ward"){
							GadgetFunction({
								type: childParentMappings.down[$this.type],
								code: lnk.code
							}, true);
						}
						else{
							var codeWithWinner = setInterval(function(){
								if(winnerCode){
									polygon.setOptions(winnerCode);
									clearInterval(codeWithWinner);
								}
							}, 500);
						}
					}
				}
			});
		});
	}
	
	this.hide = function(not){//Hide the layer except not
		var $this = this;
		$.each($this.polygons, function(key, obj){
			obj.setMap(null);
		});
		
		if(not){
			$this.polygons[not].setMap(map)
			map.fitBounds($this.polygons[not].getBounds())
		}
	}
	
	this.show = function(not){//Show layers except not
		var $this = this;
		$('#registered-list-view .body').empty();
		$.each($this.polygons, function(key, obj){
			obj.setMap(map);
			if(currentGadget!="candidates"){
				GadgetFunction({
					type: childParentMappings.down[$this.type],
					code: obj.polyID
				}, true);
			}
			if(currentGadget == "registered"){
				obj.setOptions({
					strokeColor:"#E9FBE1",
					fillColor: "#0C669F",
					fillOpacity: 0.5+(calculateArea(obj, registeredVotersByLoc[obj.polyID]))
				});
			}
			var kalayerType = childParentMappings.down[$this.type].capitalize();
			if($this.type == "ward"){
				kalayerType = "Ward"
			}
			var reglocNo = '<div class="result-row div clearfix">\
				<div class="box">\
					<img src="./images/placeholder-no-image.jpg" />\
				</div>\
				<div class="long-box">\
					<div class="title">'+obj.polyName.capitalize()+' '+kalayerType+'</div>\
					<div class="description"><span style="font-size:13px; font-weight:500 !important">'+addCommas(registeredVotersByLoc[obj.polyID])+'</span></div>\
				</div>\
			</div>';
			if($this.type != "ward"){	
				$('#registered-list-view .body').append(reglocNo);
			}
			else{
				$('#registered-list-view .title .arrow').trigger('click');
			}
			$('#totalReg').html(addCommas(''+registeredVotersByLoc[$this.code])+' in '+$this.name+' '+$this.type.capitalize());
		});
		map.fitBounds($this.bounds)
		if(not){
			$this.polygons[not].setMap(null);
		}
	}
	return this;
}

var createMarker = function(config){
	var Marker;
	if(!layerManager.pollingstation){
		layerManager["pollingstation"]={};
	}
	var keystr = config.lat+"-"+config.lon;
	if(typeof layerManager["pollingstation"][keystr] == "undefined"){
		Marker = new google.maps.Marker({
			position: new google.maps.LatLng(config.lat, config.lon),
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				fillColor: '#FF0600',
				fillOpacity: 0.9,
				strokeColor: '#9F120F',
				strokeWeight: 2,
				scale: 6
			},
			title: config.name,
			map:map
		});
		layerManager["pollingstation"][keystr] = {
			typ: "station",
			marker: Marker,
			codes: [config.code]
		}
		
		google.maps.event.addListener(Marker, 'click', function(event){
			if(currentGadget!="findmyps"){
				var psnameNow = $('#pollingstation-dropdown').children('option[value="'+config.code+'"]').text();
				pollingStationClick(keystr, false, psnameNow);
				$('#pollingstation-dropdown').children('option[value="'+config.code+'"]').attr('selected', true);
			}
		});
	}
	else{
		if(!layerManager["pollingstation"][keystr].total){
			layerManager["pollingstation"][keystr]["total"]=0;
			layerManager["pollingstation"][keystr]["reporting"]=0;
		}
		layerManager["pollingstation"][keystr].total+=1;
		layerManager["pollingstation"][keystr].typ = "center";
		Marker = layerManager["pollingstation"][keystr].marker;
		layerManager["pollingstation"][keystr].codes.push(config.code);
		Marker.setIcon({
			path: google.maps.SymbolPath.CIRCLE,
			fillColor: '#FF0600',
			fillOpacity: 0.9,
			strokeColor: '#9F120F',
			strokeWeight: 2,
			scale: 9
		})
	}
	return Marker;
}

var PollingStationsManager = function(wardcode){//This is the function that handles pollingstation objects behaviour
	var url = ngAppSettings.gisApi+"pollingstation/?token="+api_token+"&ward="+wardcode+"&election="+CURRENT_ELECTION.code;
	$('#polling-stations-near').empty();
	var shapeLoadInstance = Math.random();
	$.ajax({
		url: url,
		dataType: "json",
		beforeSend: function(){
			clearMarkers();//Clear all markers from the map
			manageLoadings.start(shapeLoadInstance);
		},
		error: function(){
			manageLoadings.stop(shapeLoadInstance);
		},
		success: function(json){
			manageLoadings.stop(shapeLoadInstance);
			
			var markerHolder={};
			if(json.status){
				var pollingstations = json.polling_stations;
				var thisDropDown = $('#pollingstation-dropdown').html('<option value="false">Select Polling Station</option>');
				$.each(pollingstations, function(p, ps){
					if(ps.location!=null){
						var kamarker = createMarker({
							lat: ps.location.lat,
							lon: ps.location.lon,
							code: ps.code,
							name: ps.name
						});
					}
					else{
						var kamarker = createMarker({
							lat: map.getCenter().lat,
							lon: map.getCenter().lon,
							code: ps.code,
							name: ps.name
						});
					}
					
					var distanceFromPs = "Distance Not Available"
					if(currentGadget=="findmyps"){
						if(ps.location && ps.location.lat){
							var pointA = new google.maps.LatLng(ps.location.lat, ps.location.lon);
							if(userLocationMarker.getPosition()){
								distanceFromPs = google.maps.geometry.spherical.computeDistanceBetween (pointA,userLocationMarker.getPosition());
								distanceFromPs = (distanceFromPs/1000).toFixed(2)+"km away."
							}
						}
						var reglocNo = $('<div class="result-row div clearfix">\
							<div class="box">\
								<img src="../images/ps.png" />\
							</div>\
							<div class="long-box">\
								<div class="title">'+ps.name.capitalize()+' Polling Station</div>\
								<div class="description"><span style="font-size:13px; font-weight:500 !important">'+distanceFromPs+'</span></div>\
							</div>\
						</div>');
						reglocNo.click(function(){
							$(this).siblings().removeClass('selected');
							if($(this).hasClass('selected')){
								clearRoutes();
								$(this).removeClass('selected');
							}
							else{
								getDirections(userLocationMarker.getPosition(), kamarker.getPosition(), 'driving');
								$(this).addClass('selected');
							}
						});
						google.maps.event.addListener(kamarker, 'click', function(){
							$(reglocNo).siblings().removeClass('selected');
							if($(reglocNo).hasClass('selected')){
								clearRoutes();
								$(reglocNo).removeClass('selected');
							}
							else{
								getDirections(userLocationMarker.getPosition(), kamarker.getPosition(), 'driving');
								$(reglocNo).addClass('selected');
							}
						});
						$('#polling-stations-near').append(reglocNo);
					}
					var $option = $('<option value="'+ps.code+'">'+ps.name+'</option>');
					thisDropDown.append($option);
				});
				thisDropDown.slideDown(700);
				thisDropDown.off('change');
				thisDropDown.on('change',function(){ //When  a drop down is selected
					var selValue = $(this).children('option:selected').val();
					var selText = $(this).children('option:selected').val();
					if(selValue!="false"){
						$('#results-list-view > .body').html("&nbsp;");
						pollingStationResults(false, selValue,selText)
						$('#results-list-view > .title').html('<span>'+$(this).children('option:selected').text()+'</span><div class="arrow">&and;</div>')
					}
					else{
						//The gadget should load results for this pollingstation's ward
					}
				});
				if(currentGadget=="results"){
					reportingPollingStations(wardcode);
				}
			}
			else{
				var errorPopUp = new ModalWindow({
					parent:"#gadget",
					title:"Error Loading Polling Stations",
					content: "An Error has occured. Please refresh."
				});
				errorPopUp.create();
			}
		}
	});
}


var reportingPollingStations = function(wardP){//This function returns a list of polling stations that have reported.
	var shapeLoadInstance = Math.random();
	$.ajax({
		url:"http://partitioned.api-iebc.appspot.com/reporting/"+wardP+"/?post="+defaultPost+"&token="+api_token+"&election="+CURRENT_ELECTION.code,
		dataType: 'json',
		beforeSend: function(){
			manageLoadings.start(shapeLoadInstance);
		},
		error: function(){
			manageLoadings.stop(shapeLoadInstance);
		},
		success: function(json){
			manageLoadings.stop(shapeLoadInstance);
			var pollings = json.reporting;
			$.each(pollings, function(p, ps){
				$.each(layerManager["pollingstation"], function(pk, pKeystr){
					if($.inArray(ps, pKeystr.codes)!=-1){
						if(pKeystr.typ == "station"){
							pKeystr.marker.setIcon({
								path: google.maps.SymbolPath.CIRCLE,
								fillColor: '#67C016',
								fillOpacity: 0.9,
								strokeColor: '#349E10',
								strokeWeight: 2,
								scale: 6
							});
						}
						else{
							pKeystr.reporting+=1;
							if(pKeystr.reporting >= pKeystr.codes.length){
								pKeystr.marker.setIcon({
									path: google.maps.SymbolPath.CIRCLE,
									fillColor: '#67C016',
									fillOpacity: 0.9,
									strokeColor: '#349E10',
									strokeWeight: 2,
									scale: 9
								});
							}
							else{
								pKeystr.marker.setIcon({
									path: google.maps.SymbolPath.CIRCLE,
									fillColor: '#FEAD16',
									fillOpacity: 0.9,
									strokeColor: '#FE8710',
									strokeWeight: 2,
									scale: 9
								});
							}
						}
					}
				});
			})
		}
	})
}



var createCookie = function(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

var readCookie = function (name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

var eraseCookie = function (name) {
    createCookie(name, "", -1);
}