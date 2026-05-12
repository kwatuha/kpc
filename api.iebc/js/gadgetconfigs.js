var api_token = /*"c875d20469172f90f260f3f8c14d4a71";//"273041c475980571588a77437a385999";/*/"afd3877583a07e5b77e447332bb98a80"; //This is the token that allows the gadgets to access the API.
google.load("visualization", "1", {packages:["corechart"]}) //load the google charts [package]
var ngGlobalSettings = window.erpGlobal;
var ngAppSettings =window.erpGlobal.serverSettings[window.erpGlobal.serverMode];
var map; //Holds the instance of the Gmaps class running on the gadget
var currentGadget;//This is the gadget currently in use
var gadgetInMobileView;
var candidatesListObj={};//This holds the candidates for this election
var candidatesShow;
var CURRENT_GADGET_LOCATION;//This defines the electoral area currently in selection 
var calculateArea;//This calculates the area of a polygon
var PolyHoverData={};//This holds hover data for shapes in selection.
var GadgetFunction;//This holds the default function on gadget change.
var locationStylings = {};//
var voterInformationLayers;//Holds all the layers that hold voter shapes
var userLocationMarker; //Marker showing the current users location
var resultsFunction;//Function for election Results
var pollingStationHover;//Function when a pollingstation is hovered over.
var pollingStationResults; //Function to get results in a pollingstation
var pollingStationClick; //This is the function for marker clicks from gadget to gadget
var myLocationDrillDown;//This is the function that drills down to the users ward.
var defaultPost; //This is the post at which the gadget is currently operating
var createLocMarker = function(img, title){//Create and return a google.maps.Marker
	var marker = new google.maps.Marker({
		position: map.getCenter(),
		optimized: false,
		icon: img,
		title: title
	});
	return marker;
}

var addCommas = function(nStr){//Add commas to the number
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

var clearMarkers = function(){
	if(layerManager["pollingstation"]){
		$.each(layerManager["pollingstation"], function(m, marker){
			marker.marker.setMap(null)
		});
		
		delete layerManager["pollingstation"];
	}
}

var postsMappings = {
	1: "All",
	2: "Current",
	3: "FY2018/2019",
	4: "FY2019/2020",
	5: "FY2020/2021",
	6: "FY2021/2022"
}

var GadgetControlIDs = {
	all: ["findmyps-list-view", "results-list-view", "select-location", "registered-list-view", "candidates-list-view", "confirm-list-view", "select-post"],
	findmyps: ["findmyps-list-view", "select-location"],
	registered: ["select-location", "registered-list-view"],
	confirm: ["confirm-list-view"],
	candidates: ["select-location", "candidates-list-view"],
	results: ["select-location", "results-list-view", "select-post"]
}

var layerManager = {};//Holds all the available layers on the map

var PolyMan; //will hold the Polyman class

var ELECTIONS={};//An object holding a list of elections and returned by the API

var CURRENT_ELECTION={}; //An object holding details on the currently selected election 61BB761E-F1DB-40AC-A43B-1059147C47A3

var ElectionSelection;//This holds the control for gadget election selection

var childParentMappings = { //maps layers to next relation layer
	down:{//parent to child
		country: "county",
		county : "constituency",
		constituency : "ward",
		ward : "pollingstation"
	},
	up:{//Child to parent
		county: "country",
		constituency : "county",
		ward : "constituency",
		pollingstation: "ward"
	}
}

var clearLayerStyles = function(){
	PolyHoverData = {};
	$.each(layerManager, function(k,v){
		if(k!="pollingstation"){
			$.each(v.polygons, function(p, polz){
				polz.setOptions({
					strokeColor: "#43470C",
					fillOpacity: 0,
					zIndex: 0.2,
					fillColor: "#85EF45"
				});
			});
		}
	});
}

var clearAllLayers = function(){
	if(voterInformationLayers){
		$.each(voterInformationLayers, function(k,v){
			if(v){
				v.setMap(null);
				delete voterInformationLayers[k];
			}
		});
	}
	if(layerManager){
		$.each(layerManager, function(k,v){
			if(v){
				PolyHoverData = {};
				delete layerManager[k];
				if(k=="pollingstation"){
					clearMarkers();
				}
				else{
					v.hide();
				}
				$('#'+childParentMappings.down[k]+'-dropdown').slideUp(700).html('<option value="false">Select '+k+'</option>');
			}
		});
	}
}

var locationSelection = function(config){ //Behavior of location selection change
	if(layerManager[config.type] && config.type!="pollingstation"){
		layerManager[config.type].hide();
	}
	else{
		clearMarkers();
	}
	$('#backBtn #backArrow').attr('data-hint', "↑ "+childParentMappings.up[config.type].capitalize()+" Level");
	$('#backBtn #backArrow').attr('stepback', childParentMappings.up[config.type]);
	$('#backBtn #backArrow').html("&laquo;");
	$('#backText .backText').text(config.type);	
	config.layer.hide();
	layerManager[config.type] = new PolyMan(config);
	layerManager[config.type].create();
	CURRENT_GADGET_LOCATION = config;
	GadgetFunction(CURRENT_GADGET_LOCATION);
	currentLocationName = config.name;
}

var stepBack = function(Tlevel){//This is the function that is used for backward navigation
	var stepsParent = Tlevel;
	clearLayerStyles();
	$.each(childParentMappings.down, function(parent, child){//Reset the dropDowns
		if(stepsParent == parent){
			var thisChild = childParentMappings.down[child];
			$('#'+thisChild+'-dropdown').slideUp(700);
			if(layerManager[child]){
				if(thisChild!="pollingstation"){
					layerManager[child].hide();
					delete layerManager[child];
					delete candidatesListObj[child]
				}
				else{
					clearMarkers();
					if(layerManager["ward"]){
						delete candidatesListObj["ward"]
						layerManager["ward"].hide();
					}
				}
			}
			stepsParent = child;
		}
	});
	
	if(Tlevel!=CURRENT_ELECTION.location){
		$('#backBtn #backArrow').attr('data-hint', "↑ "+childParentMappings.up[Tlevel].capitalize()+" Level");
		$('#backBtn #backArrow').attr('stepback', childParentMappings.up[Tlevel]);
		$('#backText .backText').text(Tlevel);
	}
	else{
		$('#backBtn #backArrow').attr('data-hint', "Highest Level Available");
		$('#backBtn #backArrow').removeAttr('stepback');
		$('#backBtn #backArrow').html("&#9632;")
		$('#backText .backText').text(CURRENT_ELECTION.location.capitalize());
		$('#'+childParentMappings.down[CURRENT_ELECTION.location]+'-dropdown').children('option[value=false]').attr('selected', true);
	}
	if(layerManager[Tlevel]){
		if(!gadgetInMobileView){
			layerManager[Tlevel].show();//Show and fit map bounds to reseting layer
		}
		currentLocationName = layerManager[Tlevel].name;
		CURRENT_GADGET_LOCATION["type"]=layerManager[Tlevel].type;
		if(layerManager[Tlevel].code){
			CURRENT_GADGET_LOCATION["code"]=layerManager[Tlevel].code;
		}
		GadgetFunction(CURRENT_GADGET_LOCATION)
	}
	
	
}

var getCurrentGadget = function(){//This gadget returns the gadget defined by the hash.
	var currentLocation = window.location;
	if(userLocationMarker){
		userLocationMarker.setMap(null);
		userLocationMarker=false;
	}
	var hashedG =  currentLocation.hash.split('#');
	if(hashedG[1]){
		var cGadget = '#gadget-'+hashedG[1];
		currentGadget = hashedG[1];
	}
	else{
		var cGadget = '#gadget-findmyps';
		hashedG[1] = 'findmyps';
		window.location.hash="#findmyps";
	}
	$(cGadget).addClass('selected').siblings().removeClass('selected');
	$.each(GadgetControlIDs.all, function(c, control){
		$('#'+control).slideUp(400);
	})
	currentGadget = hashedG[1];
	if(currentGadget == "results"){
		GadgetFunction = resultsFunction;
		pollingStationClick = pollingStationResults;
	}
	else if(currentGadget == "candidates"){
		GadgetFunction = getCandidates;
		pollingStationClick = pollingStationHover;
	}
	else{
		GadgetFunction = getCandidates;
	}
	
	$.each(GadgetControlIDs[hashedG[1]], function(c, control){
		$('#'+control).slideDown(400);
	})
}

var GadgetLoading = function(){//This is the function to run when the gadget is loading any data
	var $this = this;
	this.instances = [];
	this.start = function(instance){
		this.instance = instance;
		$('#gadget-mask').show(0);
		$this.instances.push(instance);
	}
	
	this.stop = function(instance){
		for(var i = $this.instances.length - 1; i >= 0; i--) {
			if($this.instances[i] === instance) {
			   $this.instances.splice(i, 1);
			}
		}
		if($this.instances.length == 0){
			$('#gadget-mask').hide(0);
		}		
	}
}

var manageLoadings = new GadgetLoading();

var getElections = function(parentID){//This function returns elections data received from the API and configures the gadget as per the election selected.
	var loadInstance = Math.random();
	if(CURRENT_GADGET_LOCATION){
		if(CURRENT_GADGET_LOCATION.type=="ward"){
			stepBack(childParentMappings.up[CURRENT_GADGET_LOCATION.type]);
		}
	}
    $.ajax({
		url: ngAppSettings.gisApi+"election/?token="+api_token,
		dataType: "json",
		beforeSend: function(){
			manageLoadings.start(loadInstance);
		},
		error: function(){
			manageLoadings.stop(loadInstance);
		},
		success: function(json){
			manageLoadings.stop(loadInstance);
			if(json.status){
				var availableposts = [];
				var $electionHTML = $('<ul class="modal-list"></ul>');
				var available_elections = json.elections;
				$.each(available_elections, function(e, election){
					ELECTIONS[election.code] = election;
					var $electionLI = $('<li></li>');
					$electionLI.text(election.name);
					if(election.type=="By-Election"){
						var $be_ul = $('<ul class="by-elections-ops"></ul>');
						$.each(election.locations, function(be, bElection){
							var $BelectionLI = $('<li></li>');
							$BelectionLI.text(bElection.name);
							$BelectionLI.click(function(){
								candidatesListObj={};
								defaultPost = bElection.post;
								availableposts.push(bElection.post);
								clearAllLayers();
								CURRENT_ELECTION = {
									name: bElection.name,
									code: election.code,
									type: election.type,
									post: bElection.post,
									location: bElection.location,
									locationID: bElection.locationID
								}
								currentLocationName = bElection.name;
								$('#select-post-dropdown').empty();
								$.each(availableposts, function(ap, apost){
									$('#select-post-dropdown').append('<option value="'+apost+'">'+postsMappings[apost]+'</option>');
								});
								$('#backText .backText').text(CURRENT_ELECTION.location);
								layerManager[CURRENT_ELECTION.location] = new PolyMan({
										type: CURRENT_ELECTION.location,
										code: CURRENT_ELECTION.locationID,
										name: currentLocationName
								});
								CURRENT_GADGET_LOCATION = {
									type: CURRENT_ELECTION.location,
									code: CURRENT_ELECTION.locationID
								};
								layerManager[CURRENT_ELECTION.location].create();
								ElectionSelection.close();
								GadgetFunction(CURRENT_GADGET_LOCATION);
							});
							$be_ul.append($BelectionLI);
						});
						$electionLI.append($be_ul);
					}
					$electionLI.click(function(){//Defines the beha
						candidatesListObj={};
						if(election.type=="By-Election"){//Configure the gadget for an election of type By-Election
							$(this).children("ul").slideToggle(700);
						}
						else{//Configure the Gadget for an election of type election
							clearAllLayers();
							CURRENT_ELECTION = {
								name: election.name,
								code: election.code,
								type: election.type,
								location: election.location
							}
							currentLocationName = "Kenya"
							availableposts = [1,2,3,4,5,6];
							$('#select-post-dropdown').empty();
							$.each(availableposts, function(ap, apost){
								$('#select-post-dropdown').append('<option value="'+apost+'">'+postsMappings[apost]+'</option>');
							});
							CURRENT_GADGET_LOCATION = {
								type: election.location
							};
							defaultPost = 1;
							GadgetFunction(CURRENT_GADGET_LOCATION);
							$('#backText .backText').text(CURRENT_ELECTION.location);
							layerManager[CURRENT_ELECTION.location] = new PolyMan({
									type:CURRENT_ELECTION.location,
									name: currentLocationName
							});
							
							layerManager[CURRENT_ELECTION.location].create();
							ElectionSelection.close();
						}
					});
					$electionHTML.append($electionLI);
				});
				
				ElectionSelection = new ModalWindow({
					parent:"#gadget-left",
					title:"Select Election",
					content: $electionHTML
				});
				ElectionSelection.create();
			}
			else{
				ShowError("There was an error while trying to load election data.");
			}
		}
	});
}

var createMap = function(div, ops){//This is the function that creates and returns a google map instance
	var styles = [ // The map styles 
		{
		  stylers: [
			{ hue: "#2bb8ff" },
			{ saturation: -50 }
		  ]
		},
		{
			featureType: "administrative.country",
			stylers: [
			  { visibility: "off" },
			  { "color": "#99FF33" }
			]
		},
		{
		  featureType: "road",
		  elementType: "geometry",
		  stylers: [
			{ lightness: 100 },
			{ visibility: "simplified" }
		  ]
		}
	];
	
	var styledMap = new google.maps.StyledMapType(styles);
	if(!ops){
		console.log('ops',ops)
		ops = {
			center: new google.maps.LatLng(0.212745, 37.862974),
			zoom: 7,
			disableDefaultUI: true,
			mapTypeControl: false,
			zoomControl: true,
			streetViewControl: true,
			fullscreenControl:true,
			scaleControl: true,
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM,
			},
			mapTypeControlOptions: {
				position: google.maps.ControlPosition.TOP_RIGHT,
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
				mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style',google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN]
			},
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		}
	}
	var themap = new google.maps.Map(document.getElementById(div), ops);
	themap.mapTypes.set('map_style', styledMap);
  	themap.setMapTypeId('map_style');
	return themap;
}

var adjustGadgetSize = function(){//Maintains the gadgets sizes vizuri
	$('#gadget-left, #gadget-right').css({
		"height": $(window).height()
	});
	if($(window).width() < 480 ){
		gadgetInMobileView = true;
	}
	else{
		gadgetInMobileView = false;
	}
}

$(window).resize(function(){
	adjustGadgetSize();
});

$(document).ready(function(e) {
	adjustGadgetSize();
	getCurrentGadget();
    map = createMap('map');
	if(currentGadget !="confirm"){
		//getElections("#gadget-left");

        clearAllLayers();
        CURRENT_ELECTION = {
            name: 'General Election 2013 - Partial',
            code: 'GEK2013',
            type:'General Election',
            location: 'country'
        }
        currentLocationName = "Kenya"
        availableposts = [1,2,3,4,5,6];
        $('#select-post-dropdown').empty();
        $.each(availableposts, function(ap, apost){
            $('#select-post-dropdown').append('<option value="'+apost+'">'+postsMappings[apost]+'</option>');
        });
        CURRENT_GADGET_LOCATION = {
            type: 'country'
		};

        defaultPost = 1;
        GadgetFunction(CURRENT_GADGET_LOCATION);
        $('#backText .backText').text(CURRENT_ELECTION.location);
        layerManager[CURRENT_ELECTION.location] = new PolyMan({
            type:CURRENT_ELECTION.location,
            name: currentLocationName
        });

        layerManager[CURRENT_ELECTION.location].create();

	}
	$(document).on('click', '.div .title', function(){
		if($(this).children('.arrow').html() == "∨"){
			$(this).children('.arrow').html("&and;");
			$(this).siblings('.body').slideDown(700);
		}
		else{
			$(this).children('.arrow').html("&or;");
			$(this).siblings('.body').slideUp(700);
		}
	});
	
	$('#gadget-info .info-header').click(function(){
		if($('#gadget-info .info-body').is(':hidden')){
			$('#gadget-info .info-body').show('slide',{direction:'left'},500);
			$(this).html("&raquo;");
			setTimeout(function(){
				$('#gadget-info .info-body').hide('slide',{direction:'left'},500);
				$('#gadget-info .info-header').html("&laquo;");
			},30000);
		}
		else{
			$('#gadget-info .info-body').hide('slide',{direction:'left'},500);
			$(this).html("&laquo;");
		}
	})
	
	$('#get-embed-code').click(function(){
		var $embedCode = $('<div><p>Embedding this gadget is simple. Just copy this code</p><div id="feedbackField">&lt;iframe src="'+window.location+'">&lt;/iframe></div> <p>and paste it in your HTML preferred page. In case you need access to your code, contact your site\'s webmaster.</p></div>')
		var $getEmbedCode = new ModalWindow({
			parent:'#gadget',
			title:"Get Embed Code",
			content: $embedCode
		});
		$getEmbedCode.create({
			drag: "false"
		});
	});
	
	$('#backBtn #backArrow').click(function(){
		if($(this).attr('stepback')){
			stepBack($(this).attr("stepback"));
		}
	});
	
	$('#select-post-dropdown').change(function(){
		defaultPost = $(this).children('option:selected').val();
		clearLayerStyles();
		if(CURRENT_GADGET_LOCATION.type=="country" && parseInt(defaultPost)==1){
			resultsFunction(CURRENT_GADGET_LOCATION);
		}
		else if(CURRENT_GADGET_LOCATION.type=="country" && (parseInt(defaultPost)==2 || parseInt(defaultPost)==3 || parseInt(defaultPost)==5)){
			$.each(layerManager[CURRENT_GADGET_LOCATION.type].polygons, function(p, polz){
				resultsFunction({
					type: childParentMappings.down[CURRENT_GADGET_LOCATION.type],
					code: polz.polyID
				}, true);
			});
			$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Click a county for more information!</div>');
		}
		else{
			resultsFunction(CURRENT_GADGET_LOCATION);
		}
		
	});
	
	$('#election-selection').click(function(){
		getElections("#gadget");
	});
	
	$('#gadget-menu .control-bar-option').click(function(){
		$(this).addClass('selected').siblings().removeClass('selected');
		var newHash = $(this).attr('id').split("gadget-")[1];//Change the address hash
		window.location.assign(window.location.href.replace(window.location.hash, "#"+newHash))
		window.location.reload();
		getCurrentGadget();
		if(gadgetInMobileView){
			$('#gadget-menu').slideToggle(700);
		}
		if(userLocationMarker){
			userLocationMarker.setMap(null);
			userLocationMarker = false;
		}
	})
	
	$('#select-gadget').click(function(){
		if(gadgetInMobileView){
			$('#gadget-menu').slideToggle(700);
		}
	})

	
});