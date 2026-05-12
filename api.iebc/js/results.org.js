var ngGlobalSettings = window.erpGlobal;
var ngAppSettings =window.erpGlobal.serverSettings[window.erpGlobal.serverMode];

// JavaScript Document
var candidatePerc = function(votes){
	return votes.candidate/votes.valid*100;
}

var sortCandidates = function(array){
	var sortedList = array.sort(function(a, b){
		var canA = a.votes;
		var canB = b.votes;
		return (canB - canA);
	});
	return sortedList;
}

var partyFootPrintlayer;

var resultisFootPrint;
var resBy;//Holds the candidate that has footprint
var partyFootPrint = function(div, candidate, loc){//Style layer by party footprint
	var $this = $(div);
	console.log(div)
	if(resBy == candidate){
		resBy = "winner";
		$this.removeClass('selected');
		$this.siblings().removeClass('selected');
	}
	else{
		$this.addClass('selected');
		$this.siblings().removeClass('selected');
		resBy = candidate;
		resultisFootPrint=true;
	}
	$.each(layerManager[loc].polygons, function(p, poly){
		if(partyFootPrintlayer[p]){
			console.log((partyFootPrintlayer[p][resBy]));
			poly.setOptions(partyFootPrintlayer[p][resBy]);
		}
	});
}

resultsFunction = function(CURRENT_LOC, hover){//This is the function that returns the results for a specific results query 
	
	if(CURRENT_LOC.type=="country" && parseInt(defaultPost)==1){
		var url = ngAppSettings.gisApi+"results/country/KE/?token="+api_token+"&election="+CURRENT_ELECTION.code+"&post="+defaultPost+"&election_status=TALLIED_RESULT&t="+Math.random();
	}
	else{
		var url = ngAppSettings.gisApi+"results/"+CURRENT_LOC.type+"/"+CURRENT_LOC.code+"/?token="+api_token+"&election="+CURRENT_ELECTION.code+"&post="+defaultPost+"&election_status=TALLIED_RESULT&t="+Math.random();
	}
	var shapeLoadInstance = Math.random();
	partyFootPrintlayer={};
	console.log('currentLocationName',currentLocationName)
	console.log('currentLocationName',url)
	
	$.ajax({
		url: url,
		dataType:"json",
		beforeSend: function(){
			manageLoadings.start(shapeLoadInstance);
		},
		error: function(){
			manageLoadings.stop(shapeLoadInstance);
		},
		success: function(json){
			manageLoadings.stop(shapeLoadInstance);
			console.log(' json.contests-->',  json.contests)
			if(json.status=="SUCCESS"){//If the query was successful
				var contests = json.contests;
				if(!hover){
					$('#results-list-view .body').empty();
					$('#results-list-view .title').html('Projects in '+currentLocationName.capitalize()+' '+CURRENT_LOC.type.capitalize()+'<div class="arrow">&and;</div>');
				}
				if(contests[0].locations){
					var results = contests[0].locations[0].results;
					console.log('results',results)
					var locName = contests[0].locations[0].location;
					console.log('locName',locName)
					var loctype = contests[0].locations[0].location_type;
					var validV = contests[0].locations[0].valid;
					var reported = contests[0].locations[0].reported;
					var rejected = contests[0].locations[0].rejected;
					var spoilt = contests[0].locations[0].spoilt;
					var disputed = contests[0].locations[0].disputed;
					var turnout = contests[0].locations[0].turnout;
					var reportingPS = contests[0].locations[0].reporting_ps;
					var reportingPerc = (reportingPS.ps_reporting) / (reportingPS.ps_location_total)*100;
					if(!hover){
						
						$('#results-list-view .body').append('\
							<div class="result-row location-result" style="margin-bottom:10px">\
								<div class="footer summary-info" style="border:none">\
									<div class="graph-perc" style="border:none">Turnout</div>\
									<div class="graph" style="border:none">\
										<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:'+turnout+'%; background-color:#6AE620; color:#000">'+turnout.toFixed(0)+'%</div>\
									</div>\
								</div>\
								<div class="footer summary-info" style="border:none">\
									<div class="graph-perc" style="border:none">Reporting</div>\
									<div class="graph" style="border:none">\
										<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:'+reportingPerc+'%; background-color:#6AE620; color:#000">'+reportingPS.ps_reporting+'/'+reportingPS.ps_location_total+'</div>\
									</div>\
								</div>\
							</div>'
						);
						
					}
					console.log('sortCandidates-->', sortCandidates(results))
					$.each(sortCandidates(results), function(res, result){
						var canParty = $.trim(result.party.abr);
						var partyPic = result.party.symbol;
						if(!partyPic){
							partyPic = ngAppSettings.gisApi+"images/parties/"+result.code+".jpg"
						}
						if(!canParty){
							canParty = "Independent";
							result["party"]={};
							result.party["color"]="#333"
							partyPic = "http://latest-api.api-iebc.appspot.com/images/parties/NOPIC.jpg";
						}
						var candPerc = candidatePerc({
							candidate: result.votes,
							valid: validV
						});
						
						var resRowRes = '\
							<div class="result-row div" onclick="partyFootPrint(this,\''+result.name+'\',\''+CURRENT_LOC.type+'\')">\
								<div class="box">\
									<img src="'+result.picture+'" />\
								</div>\
								<div class="box">\
									<img src="'+partyPic+'" />\
								</div>\
								<div class="long-box">\
									<div class="title">'+result.name+'</div>\
									<div class="description">\
										<div class="item" style="color:'+result.party.color+'">&bull; '+canParty+'</div>\
										<div class="item">'+addCommas(result.votes)+' Votes</div>\
									</div>\
								</div>\
								<div class="footer">\
									<div class="graph-perc">'+candPerc.toFixed(2)+'%</div>\
									<div class="graph" style="border:none">\
										<div class="bar" style="width:'+candPerc+'%; background-color:'+result.party.color+';"></div>\
									</div>\
								</div>\
							</div>';
						if(CURRENT_ELECTION.location=="ward"){
							if(res <= 2){
								if(!PolyHoverData.results){
									PolyHoverData["results"] = {};
								}
								if(!PolyHoverData.results[CURRENT_ELECTION.locationID]){
									PolyHoverData.results[CURRENT_ELECTION.locationID] = 
									'<div class="result-row location-result" style="margin-bottom:10px; min-width:290px">\
										<div class="footer summary-info" style="border:none">\
											<div class="graph-perc" style="border:none">Turnout</div>\
											<div class="graph" style="border:none">\
												<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:'+turnout+'%; background-color:#6AE620; color:#000">'+turnout.toFixed(0)+'%</div>\
											</div>\
										</div>\
										<div class="footer summary-info" style="border:none">\
											<div class="graph-perc" style="border:none">Reporting</div>\
											<div class="graph" style="border:none">\
												<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:'+reportingPerc+'%; background-color:#6AE620; color:#000">'+reportingPS.ps_reporting+'/'+reportingPS.ps_location_total+'</div>\
											</div>\
										</div>\
									</div>';
								}
								
								PolyHoverData.results[CURRENT_ELECTION.locationID]+= resRowRes;
								if(res==0){
									console.log("winner")
									winnerCode  = {
										fillColor:result.party.color,
										fillOpacity: 1*(candPerc/100),
										strokeColor: "#f2f2f2",
										strokeOpacity: 1
									}
									console.log(winnerCode)
								}
								$.each(layerManager["ward"].polygons, function(plz, pzl){
									pzl.setOptions(winnerCode);
								})
							}
						}
						if(hover ){
							if(!partyFootPrintlayer[CURRENT_LOC.code]){
								partyFootPrintlayer[CURRENT_LOC.code] = {};
								partyFootPrintlayer[CURRENT_LOC.code]["winner"] = {};
							}
							partyFootPrintlayer[CURRENT_LOC.code][result.name]={
								fillColor:result.party.color,
								fillOpacity: 1*(candPerc/100)+0.1
							}
							if(res <= 2){
								if(!PolyHoverData.results){
									PolyHoverData["results"] = {};
								}
								if(!PolyHoverData.results[CURRENT_LOC.code]){
									PolyHoverData.results[CURRENT_LOC.code] = 
									'<div class="result-row location-result"  style="margin-bottom:10px; min-width:290px">\
										<div class="footer summary-info" style="border:none">\
											<div class="graph-perc" style="border:none">Turnout</div>\
											<div class="graph" style="border:none">\
												<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:'+turnout+'%; background-color:#6AE620; color:#000">'+turnout.toFixed(0)+'%</div>\
											</div>\
										</div>\
										<div class="footer summary-info" style="border:none">\
											<div class="graph-perc" style="border:none">Reporting</div>\
											<div class="graph" style="border:none">\
												<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:'+reportingPerc+'%; background-color:#6AE620; color:#000">'+reportingPS.ps_reporting+'/'+reportingPS.ps_location_total+'</div>\
											</div>\
										</div>\
									</div>';
								}
								
								PolyHoverData.results[CURRENT_LOC.code]+= resRowRes;
								if(res==0){
									partyFootPrintlayer[CURRENT_LOC.code]["winner"] = {
										fillColor:result.party.color,
										fillOpacity: 1*(candPerc/100),
										strokeColor: "#f2f2f2",
										strokeOpacity: 1
									}
									winnerCode = partyFootPrintlayer[CURRENT_LOC.code]["winner"];
									if(CURRENT_ELECTION.location=="ward"){
										layerManager["ward"].polygons[CURRENT_LOC.code].setOptions(partyFootPrintlayer[CURRENT_LOC.code]["winner"]);
									}
									else{
										layerManager[childParentMappings.up[CURRENT_LOC.type]].polygons[CURRENT_LOC.code].setOptions(partyFootPrintlayer[CURRENT_LOC.code]["winner"]);
									}
								}
							}
						}
						
						if(!hover){
							$('#results-list-view .body').append(resRowRes);
						}
					});
					if(!hover){
						$('#results-list-view .body').append('\
							<div class="result-row div location-result">\
								<div class="title">Project Summary Information</div>\
								<div class="long-box" id="summary-in-graph">\
								</div>\
							</div>'
						);
						drawChart([
							["Type","Value"],
							["Competed", parseInt(rejected)],
							["Offschedule", parseInt(disputed)],
							["Onschedule", parseInt(validV)],
							["Suspended", parseInt(spoilt)]
						]);
					}
				}
				else{//Error message on no data for elections
					if(!hover){
						$('#results-list-view .title').html('Results in  '+CURRENT_LOC.type.capitalize()+'<div class="arrow">&and;</div>');
						$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Sorry! There are no results yet.</div>');
						if(CURRENT_LOC.type=="country" && (parseInt(defaultPost) == 2 || parseInt(defaultPost) == 3 || parseInt(defaultPost) == 5)){
							$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Please Select a county!</div>');
						}
						else if((CURRENT_LOC.type=="country" || CURRENT_LOC.type=="county")  && (parseInt(defaultPost) == 4)){
							$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Please Select a Constituency!</div>');
						}
						else if((CURRENT_LOC.type=="country" || CURRENT_LOC.type=="county" || CURRENT_LOC.type=="constituency")  && (parseInt(defaultPost) == 6)){
							$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Please Select a Ward!</div>');
						}
						else{
							$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">No results reported yet!</div>');
						}
					}
				}
			}
			else{
				var errorPopUp = new ModalWindow({
					parent:"#gadget-left",
					title:"Loading Error",
					content: "There was an error loading elections. Please refresh or try another location."
				});
				errorPopUp.create();
			}
		}
	});
	
}

pollingStationResults = function(kStr, psIDS, psNameNow){
	$('#results-list-view .body').empty();
	var ps_ids = [psIDS];
	if(!psIDS){
		ps_ids = layerManager["pollingstation"][kStr].codes;
	}
	
	if(ps_ids.length > 1){
		var pname = psNameNow.split("/")[0];
		var thisCenter = layerManager["pollingstation"][kStr]/layerManager["pollingstation"][kStr].codes.length;
		var reportingStreams = layerManager["pollingstation"][kStr].reporting+"/"+layerManager["pollingstation"][kStr].codes.length;
		$('#results-list-view .body').html('<div class="result-row location-result" style="margin-bottom:10px">\
											<div class="footer summary-info" style="border:none">\
											<div class="graph-perc" style="border:none">Streams Reporting</div>\
											<div class="graph" style="border:none">\
												<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:'+thisCenter+'%; background-color:#6AE620; color:#000">'+reportingStreams+'</div>\
											</div>\
										</div>\
										</div>')
		$('#results-list-view > .title').html('<span>Center '+pname+'</span> <div class="arrow">&and;</div>');
	}
	else{
		$('#results-list-view > .title').html('<span>'+psNameNow+'</span><div class="arrow">&and;</div>');
	}
	
	$.each(ps_ids, function(pid, ps_id){
		var nURL = ngAppSettings.gisApi+"results/pollingstation/"+ps_id+"/?&post="+defaultPost+"&token="+api_token+"&election="+CURRENT_ELECTION.code;
		var shapeLoadInstance = Math.random();
		$.ajax({
			url: nURL,
			async:true,
			dataType: "json",
			beforeSend: function(){
				manageLoadings.start(shapeLoadInstance);
			},
			error: function(){
				manageLoadings.stop(shapeLoadInstance);
			},
			success: function(json){
				manageLoadings.stop(shapeLoadInstance);
				var ps_results = json.results;				
				if(ps_results.length > 0){
					$.each(ps_results, function(psr, ps_result){
						var thisRes = ps_result.results;
						var canResHTML="";
						if(ps_ids.length > 1){
							canResHTML+='<div class="title" style="font-weight:700; color:#000; padding:10px 0px;"><span>'+json.name+'</span></div>';
						}
						var validVotes=0;
						$.each(thisRes, function(c, can){
							validVotes += parseInt(can.votes);
						});
						$.each(sortCandidates(thisRes), function(cr, canres){//Loop and append each candidate result to the list
							var candPerc = (canres.votes/validVotes)*100;
							if(canres.party.symbol){
								var partyImage = canres.party.symbol;
								var pColor = canres.party.color;
								var canParty = canres.party.abr;
							}
							else{
								var partyImage = "http://latest-api.api-iebc.appspot.com/images/parties/NOPIC.jpg";
								var pColor = "#000";
								var canParty = "Independent";
							}
							canResHTML+= '\
								<div class="result-row div">\
									<div class="box">\
										<img src="'+canres.picture+'" />\
									</div>\
									<div class="box">\
										<img src="'+partyImage+'" />\
									</div>\
									<div class="long-box">\
										<div class="title">'+canres.name+'</div>\
										<div class="description">\
											<div class="item" style="color:'+pColor+'">&bull; '+canParty+'</div>\
											<div class="item">'+addCommas(canres.votes)+' Votes</div>\
										</div>\
									</div>\
									<div class="footer">\
										<div class="graph-perc">'+candPerc.toFixed(2)+'%</div>\
										<div class="graph" style="border:none">\
											<div class="bar" style="width:'+candPerc+'%; background-color:'+pColor+';"></div>\
										</div>\
									</div>\
								</div>';
						});
						$('#results-list-view .body').append(canResHTML);
					});
				}
				else{
					if(ps_ids.length > 1){
					}
					else{
						$('#results-list-view .body').append('<div class="result-row div" style="padding:10px;">No results reported yet!</div>');
					}
				}
			}
		});
	})
}

function drawChart(vData) {
	var data = google.visualization.arrayToDataTable(vData);
	var options = {
		pieHole: 0.6,
		legend: {position: 'bottom', alignment:'center'},
		chartArea: {top:15, left:5, width:280}
	};
	var chart = new google.visualization.PieChart(document.getElementById('summary-in-graph'));
	chart.draw(data, options);
}
