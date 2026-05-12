// JavaScript Document
var ngGlobalSettings = window.erpGlobal;
var ngAppSettings = window.erpGlobal.serverSettings[window.erpGlobal.serverMode];

var getPerc = function (num,denom) {
	return num / denom * 100;
};


var shortLabels = function (value) {
	if (value.length > 5) {
		value = value.substring(0, 10);
		return value + "...";
	}
};

createAbbreviation = function (value) {
	var str = value.match(/\b([A-Z])/g).join('')
	return str;

};


nFormatter = function (num, digits) {
	var si = [{
			value: 1,
			symbol: ""
		},
		{
			value: 1E3,
			symbol: "k"
		},
		{
			value: 1E6,
			symbol: "M"
		},
		{
			value: 1E9,
			symbol: "G"
		},
		{
			value: 1E12,
			symbol: "T"
		},
		{
			value: 1E15,
			symbol: "P"
		},
		{
			value: 1E18,
			symbol: "E"
		}
	];
	var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	var i;
	for (i = si.length - 1; i > 0; i--) {
		if (num >= si[i].value) {
			break;
		}
	}
	return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
};




var partyFootPrintlayer;


var resultisFootPrint;
var resBy; //Holds the candidate that has footprint
var partyFootPrint = function (div, candidate, loc) { //Style layer by party footprint
	var $this = $(div);
	console.log(div)
	if (resBy == candidate) {
		resBy = "winner";
		$this.removeClass('selected');
		$this.siblings().removeClass('selected');
	} else {
		$this.addClass('selected');
		$this.siblings().removeClass('selected');
		resBy = candidate;
		resultisFootPrint = true;
	}
	$.each(layerManager[loc].polygons, function (p, poly) {
		if (partyFootPrintlayer[p]) {
			console.log((partyFootPrintlayer[p][resBy]));
			poly.setOptions(partyFootPrintlayer[p][resBy]);
		}
	});
}

resultsFunction = function (CURRENT_LOC, hover) { //This is the function that returns the results for a specific results query 
	
	if (currentLocationName == "Kenya"){
		map.setZoom(7.2);
	} else{
		map.setZoom(map.getZoom()+.7);
	}
		

	if (CURRENT_LOC.type == "country" && parseInt(defaultPost) == 1) {
		var url = ngAppSettings.gisApi + "results/country/KE/?token=" + api_token + "&election=" + CURRENT_ELECTION.code + "&post=" + defaultPost + "&election_status=TALLIED_RESULT&t=" + Math.random();
	} else {
		var url = ngAppSettings.gisApi + "results/" + CURRENT_LOC.type + "/" + CURRENT_LOC.code + "/?token=" + api_token + "&election=" + CURRENT_ELECTION.code + "&post=" + defaultPost + "&election_status=TALLIED_RESULT&t=" + Math.random();
	}
	var shapeLoadInstance = Math.random();
	var serviceBase = ngAppSettings.apiServiceBaseUri + 'projects/analytics?IsVoided=0&locType='+ CURRENT_LOC.type+'&locCode='+ CURRENT_LOC.code;
	partyFootPrintlayer = {};
	console.log('currentLocationName', currentLocationName)
	if (CURRENT_LOC.type == "county" && CURRENT_LOC.code != ngGlobalSettings.licence.bearer.gisCode) {
		
	} else {
		$.ajax({
			url: serviceBase,
			dataType: "json",
			beforeSend: function () {
				manageLoadings.start(shapeLoadInstance);
			},
			error: function () {
				manageLoadings.stop(shapeLoadInstance);
			},
			success: function (r) {
				manageLoadings.stop(shapeLoadInstance);
				console.log(' r-->', r)
		
					
					
				if (r.size > 0) { //If the query was successful

					if (!hover) {
						$('#results-list-view .body').empty();
						$('#results-list-view .title').html('Projects Status in ' + currentLocationName.capitalize() + ' ' + CURRENT_LOC.type.capitalize() + '<div class="arrow">&and;</div>');
					}
					var results = r.result;
					var departments = r.departments;
					if (results) {
						if (!hover) {

							$('#results-list-view .body').append('\
								<div class="result-row location-result" style="margin-bottom:10px">\
									<div class="footer summary-info" style="border:none">\
										<div class="graph-perc" style="border:none"> % of Budget Contracted </div>\
										<div class="graph" style="border:none">\
											<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercBudgetReceived + '%; background-color:#6AE620; color:#000">: ' + nFormatter(r.totalContractSum,1) + '/' + nFormatter(r.totalBudget,1) + ' = '+ r.totalPercBudgetReceived.toFixed(0) + '%</div>\
										</div>\
									</div>\
									<div class="footer summary-info" style="border:none">\
										<div class="graph-perc" style="border:none"> % Contract Sum Paid</div>\
										<div class="graph" style="border:none">\
											<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercPaid + '%; background-color:#6AE620; color:#000">: ' + nFormatter(r.totalAmountPaid,1) + '/' + nFormatter(r.totalContractSum,1) + ' = '+ r.totalPercPaid.toFixed(0) + '%</div>\
										</div>\
									</div>\
									<div class="footer summary-info" style="border:none">\
										<div class="graph-perc" style="border:none"> %  Absorption Rate </div>\
										<div class="graph" style="border:none">\
											<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercPaid + '%; background-color:#6AE620; color:#000">' + r.totalPercPaid.toFixed(0) + '</div>\
										</div>\
									</div>\
								</div>');

						}
						$.each(results, function (res, result) {
							console.log('result',result)
							
							var resRowRes = '\
								<div class="result-row div" onclick="partyFootPrint(this,\'' + result.Status + '\',\'' + CURRENT_LOC.type + '\')">\
									<div class="box">\
										<img src="./images/placeholder.png" />\
									</div>\
									<div class="long-box">\
										<div class="title">' + result.Status + '</div>\
										<div class="description">\
											<div class="item" style="color:' + result.StatusColor + '">&bull; Projects:</div>\
											<div class="item">'  +  addCommas(result.projects) + '</div>\
											<div class="item" style="color:' + result.StatusColor + '">&bull; Budget:</div>\
											<div class="item">'  + nFormatter(result.budget,1) +'</div>\
											<div class="item" style="color:' + result.StatusColor + '">&bull; Contract:</div>\
											<div class="item">'  +  nFormatter(result.contractSum,1) +'('+result.percBudgetReceived.toFixed(0) +'%)</div>\
											<div class="item" style="color:' + result.StatusColor + '">&bull; Sum Paid:</div>\
											<div class="item">'  +  nFormatter(result.amountPaid,1) +'('+result.percPaid.toFixed(0) +'%)</div>\
										</div>\
									</div>\
									<div class="footer">\
										<div class="graph-perc">' + result.completionPerc.toFixed(2) + '%</div>\
										<div class="graph" style="border:none">\
											<div class="bar" style="width:' + result.completionPerc + '%; background-color:' + result.StatusColor+ ';"></div>\
										</div>\
									</div>\
								</div>';
							if (CURRENT_ELECTION.location == "ward") {
								if (res <= 2) {
									if (!PolyHoverData.results) {
										PolyHoverData["results"] = {};
									}
									if (!PolyHoverData.results[CURRENT_ELECTION.locationID]) {
										PolyHoverData.results[CURRENT_ELECTION.locationID] =
										'<div class="result-row location-result" style="margin-bottom:10px; min-width:290px">\
											<div class="footer summary-info" style="border:none">\
												<div class="graph-perc" style="border:none">% of Budget Contracted</div>\
												<div class="graph" style="border:none">\
													<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercBudgetReceived + '%; background-color:#6AE620; color:#000">: ' + nFormatter(r.totalContractSum,1) + '/' + nFormatter(r.totalBudget,1) + ' = '+ r.totalPercBudgetReceived.toFixed(0) + '%</div>\
												</div>\
											</div>\
											<div class="footer summary-info" style="border:none">\
												<div class="graph-perc" style="border:none">% Contract Sum Paid</div>\
												<div class="graph" style="border:none">\
													<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercPaid + '%; background-color:#6AE620; color:#000">: ' + nFormatter(r.totalAmountPaid,1) + '/' + nFormatter(r.totalContractSum,1) + ' = '+ r.totalPercPaid.toFixed(0) + '%</div>\
												</div>\
											</div>\
											<div class="footer summary-info" style="border:none">\
												<div class="graph-perc" style="border:none"> %  Absorption Rate </div>\
												<div class="graph" style="border:none">\
													<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercPaid + '%; background-color:#6AE620; color:#000">' + r.totalPercPaid.toFixed(0) + '</div>\
												</div>\
											</div>\
										</div>';
									}

									PolyHoverData.results[CURRENT_ELECTION.locationID] += resRowRes;
									if (res == 0) {
										console.log("winner",1 * (result.completionPerc / 100))
										winnerCode = {
											fillColor:  result.StatusColor,
											fillOpacity: 1 * (result.completionPerc / 100),
											strokeColor: "#ade1fb",
											strokeOpacity: 1
										}
										console.log(winnerCode)
									}
									$.each(layerManager["ward"].polygons, function (plz, pzl) {
										pzl.setOptions(winnerCode);
									})
								}
							}
							if (hover) {
								if (!partyFootPrintlayer[CURRENT_LOC.code]) {
									partyFootPrintlayer[CURRENT_LOC.code] = {};
									partyFootPrintlayer[CURRENT_LOC.code]["winner"] = {};
								}
								partyFootPrintlayer[CURRENT_LOC.code][result.Status] = {
									fillColor:result.StatusColor,
									fillOpacity: 1 * (result.completionPerc / 100) + 0.1
								}
								if (res <= 2) {
									if (!PolyHoverData.results) {
										PolyHoverData["results"] = {};
									}
									if (!PolyHoverData.results[CURRENT_LOC.code]) {
										PolyHoverData.results[CURRENT_LOC.code] =
										'<div class="result-row location-result"  style="margin-bottom:10px; min-width:290px">\
											<div class="footer summary-info" style="border:none">\
												<div class="graph-perc" style="border:none">% of Budget Contracted </div>\
												<div class="graph" style="border:none">\
													<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercBudgetReceived + '%; background-color:#6AE620; color:#000">: ' + nFormatter(r.totalContractSum,1) + '/' + nFormatter(r.totalBudget,1) + ' = '+ r.totalPercBudgetReceived.toFixed(0) + '%</div>\
												</div>\
											</div>\
											<div class="footer summary-info" style="border:none">\
												<div class="graph-perc" style="border:none">% Contract Sum Paid</div>\
												<div class="graph" style="border:none">\
													<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercPaid + '%; background-color:#6AE620; color:#000">: ' + nFormatter(r.totalAmountPaid,1) + '/' + nFormatter(r.totalContractSum,1) + ' = '+ r.totalPercPaid.toFixed(0) + '%</div>\
												</div>\
											</div>\
											<div class="footer summary-info" style="border:none">\
												<div class="graph-perc" style="border:none"> %  Absorption Rate </div>\
												<div class="graph" style="border:none">\
													<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + r.totalPercPaid + '%; background-color:#6AE620; color:#000">' + r.totalPercPaid.toFixed(0) + '</div>\
												</div>\
											</div>\
										</div>';
									}

									PolyHoverData.results[CURRENT_LOC.code] += resRowRes;
									if (res == 0) {
										
										partyFootPrintlayer[CURRENT_LOC.code]["winner"] = {
											fillColor: result.StatusColor,
											fillOpacity: CURRENT_LOC.type == "county" ?.9:1 * (result.completionPerc / 100),
											strokeColor: CURRENT_LOC.type == "county" ?result.StatusColor:"#ade1fb",
											strokeOpacity: 1
										}
										winnerCode = partyFootPrintlayer[CURRENT_LOC.code]["winner"];
										if (CURRENT_ELECTION.location == "ward") {
											layerManager["ward"].polygons[CURRENT_LOC.code].setOptions(partyFootPrintlayer[CURRENT_LOC.code]["winner"]);
										} else {
											layerManager[childParentMappings.up[CURRENT_LOC.type]].polygons[CURRENT_LOC.code].setOptions(partyFootPrintlayer[CURRENT_LOC.code]["winner"]);
										}
									}
								}
							}

							if (!hover) {
								$('#results-list-view .body').append(resRowRes);
							}
						});
						if (!hover) { //draw chart
							var chartObj=[
								["Type","Value"]
							]
							$.each(departments, function (dep, department) {
								chartObj.push([department.Name,parseInt(department.projects)])
							});
							$('#results-list-view .body').append('\
								<div class="result-row div location-result">\
									<div class="title">Department Summary</div>\
									<div class="long-box" id="summary-in-graph">\
									</div>\
								</div>');
							drawChart(chartObj);
						}
					} else { //Error message on no data for elections
						if (!hover) {
							$('#results-list-view .title').html('Results in  ' + CURRENT_LOC.type.capitalize() + '<div class="arrow">&and;</div>');
							$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Sorry! There are no results yet.</div>');
							if (CURRENT_LOC.type == "country" && (parseInt(defaultPost) == 2 || parseInt(defaultPost) == 3 || parseInt(defaultPost) == 5)) {
								$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Please Select a county!</div>');
							} else if ((CURRENT_LOC.type == "country" || CURRENT_LOC.type == "county") && (parseInt(defaultPost) == 4)) {
								$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Please Select a Constituency!</div>');
							} else if ((CURRENT_LOC.type == "country" || CURRENT_LOC.type == "county" || CURRENT_LOC.type == "constituency") && (parseInt(defaultPost) == 6)) {
								$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">Please Select a Ward!</div>');
							} else {
								$('#results-list-view .body').html('<div class="result-row div" style="padding:10px;">No results reported yet!</div>');
							}
						}
					}
				} else {
					// var errorPopUp = new ModalWindow({
					// 	parent: "#gadget-left",
					// 	title: "Missing Data",
					// 	content: "Some data has not been collected yet! please "
					// });
					// errorPopUp.create();
				}
			}
		});
	}

}

pollingStationResults = function (kStr, psIDS, psNameNow) {
	$('#results-list-view .body').empty();
	var ps_ids = [psIDS];
	if (!psIDS) {
		ps_ids = layerManager["pollingstation"][kStr].codes;
	}

	if (ps_ids.length > 1) {
		var pname = psNameNow.split("/")[0];
		var thisCenter = layerManager["pollingstation"][kStr] / layerManager["pollingstation"][kStr].codes.length;
		var reportingStreams = layerManager["pollingstation"][kStr].reporting + "/" + layerManager["pollingstation"][kStr].codes.length;
		$('#results-list-view .body').html('<div class="result-row location-result" style="margin-bottom:10px">\
											<div class="footer summary-info" style="border:none">\
											<div class="graph-perc" style="border:none">Streams Reporting</div>\
											<div class="graph" style="border:none">\
												<div class="bar" style="border:none; padding: 2px 0px; font-size: 11px !important; width:' + thisCenter + '%; background-color:#6AE620; color:#000">' + reportingStreams + '</div>\
											</div>\
										</div>\
										</div>')
		$('#results-list-view > .title').html('<span>Center ' + pname + '</span> <div class="arrow">&and;</div>');
	} else {
		$('#results-list-view > .title').html('<span>' + psNameNow + '</span><div class="arrow">&and;</div>');
	}

}

function drawChart(vData) {
	var data = google.visualization.arrayToDataTable(vData);
	var options = {
		pieHole: 0.6,
		legend: {
			position: 'bottom',
			alignment: 'center'
		},
		chartArea: {
			top: 15,
			left: 5,
			width: 280
		}
	};
	var chart = new google.visualization.PieChart(document.getElementById('summary-in-graph'));
	chart.draw(data, options);
}