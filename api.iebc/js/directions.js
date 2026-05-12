// JavaScript Document
var ROUTES = [];
var getDirections = function(source, destination, mode){
	var animateCircle = function(line) {
		var count = 0;
		offsetId = window.setInterval(function() {
		  count = (count + 1) % 1000;
	
		  var icons = line.get('icons');
		  icons[0].offset = (count / 10) + '%';
		  line.set('icons', icons);
	  }, 20);
	}
	var animateCircleGrow = function(line) {
		var count = 1;
		offsetId = window.setInterval(function() {
		  count = (count + (1%100));
	
		  var icons = line.get('icons');
		  icons[0].scale = count/10;
		  line.set('icons', icons);
		  if(count>4){
			  count=1
		  }
	  }, 20);
	}
	var routeBounds = new google.maps.LatLngBounds();
	var directionsLoad = Math.random();
	$.ajax({
		url: "http://maps.googleapis.com/maps/api/directions/json?origin="+source+"&destination="+destination+"&mode="+mode+"&provideRouteAlternatives=true&sensor=false",
		dataType: "json",
		beforeSend: function(){
			manageLoadings.start(directionsLoad);
		},
		error: function(){
			manageLoadings.stop(directionsLoad);
		},
		success: function(json){
			manageLoadings.stop(directionsLoad);
			if(json.status=="OK"){
				clearRoutes();
				$.each(json.routes, function(r, route){
					var coords = decodePoints(route.overview_polyline.points);
					var newCoords = []
					var coordsDump = [];
					console.log(route);
					$.each(coords,function(c, coord){
						newCoords.push(new google.maps.LatLng(coord.latitude, coord.longitude));
						coordsDump.push([coord.latitude,coord.longitude]);
						routeBounds.extend(new google.maps.LatLng(coord.latitude, coord.longitude));
					});
					
					$.each(route.legs, function(l, leg){
						$.each(leg.steps, function(s, step){
							var legCoords = decodePoints(step.polyline);
							var newLegCoords = [];
							$.each(legCoords,function(lc, lcoord){
								newLegCoords.push(new google.maps.LatLng(lcoord.latitude, lcoord.longitude));
								
							});
							var thisLeg = new google.maps.Polyline({
								path: newLegCoords,
								strokeColor: '#FF0000',
								strokeOpacity: 1.0,
								strokeWeight: 3
							});
						});
					});
					
					var lineSymbol = {
						 path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
						 scale: 2,
						 strokeColor:"#1D7CAF"
					};
					var myRoute = new google.maps.Polyline({
						path: newCoords,
						strokeOpacity:1,
						strokeWeight:5,
						strokeColor:"#80D0F7",
						icons:[{
							icon: lineSymbol,
							offset:"35%"
						}]
					});
					myRoute.setMap(map);
					ROUTES.push(myRoute);
					map.fitBounds(routeBounds);
					animateCircle(myRoute);
					animateCircleGrow(myRoute);
					google.maps.event.addListener(myRoute, 'click', function(event){
						
					});
					
					google.maps.event.addListener(map, 'click', function(){
						
					});
				});
			}
			else if(json.status=="ZERO_RESULTS"){ 
				var errorBox = new ModalWindow({
					title: "Directions Error",
					content: "<p style='color:#a00'>Sorry, no route found.</p>\
					<div class='full-button'>OK</div>"
				});
				errorBox.create();
				var $thisCon = errorBox.element;
				$thisCon.click(function(){
					errorBox.close();
				});
			}
		}
	});
}

var getAdressLocation = function(inputID,  marker){
	var input = /** @type {HTMLInputElement} */(document.getElementById(inputID));
	var ops = {
		componentRestrictions: {country: 'ke'}
	}
  	var autocomplete = new google.maps.places.Autocomplete(input, ops);
	autocomplete.bindTo('bounds', map);
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		input.className = '';
		var place = autocomplete.getPlace();
		if (!place.geometry) {
		  // Inform the user that the place was not found and return.
		  input.className = 'notfound';
		  return;
		}
		
		// If the place has a geometry, then present it on a map.
		if (place.geometry.viewport) {
		  map.fitBounds(place.geometry.viewport);
		} else {
		  map.setCenter(place.geometry.location);
		  map.setZoom(17);  // Why 17? Because it looks good.
		}
		marker.setPosition(place.geometry.location);
		marker.setMap(map);
		myLocationDrillDown();
	});
}

var clearRoutes = function(){
	if(ROUTES.length > 0){
		$.each(ROUTES, function(r, rr){
			rr.setMap(null);
		});
	}
	ROUTES = [];
}

// JavaScript Document
function decodePoints(encoded){

    // array that holds the points

    var points=[ ]
    var index = 0, len = encoded.length;
    var lat = 0, lng = 0;
    while (index < len) {
        var b, shift = 0, result = 0;
        do {

    b = encoded.charAt(index++).charCodeAt(0) - 63;//finds ascii                                                                                    //and substract it by 63
              result |= (b & 0x1f) << shift;
              shift += 5;
             } while (b >= 0x20);


       var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
       lat += dlat;
      shift = 0;
      result = 0;
     do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
       shift += 5;
         } while (b >= 0x20);
     var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
     lng += dlng;
 
   points.push({latitude:( lat / 1E5),longitude:( lng / 1E5)})  
 
  }
  return points
}