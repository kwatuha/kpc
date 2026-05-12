// JavaScript Document
calculateArea = function(poly, number){
	var polyArea = google.maps.geometry.spherical.computeArea(poly.getPath());
	return ((number/polyArea)/100000)
}