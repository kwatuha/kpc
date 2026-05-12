// JavaScript Document
var ngGlobalSettings = window.erpGlobal;
var ngAppSettings =window.erpGlobal.serverSettings[window.erpGlobal.serverMode];

candidatesShow = function(){
	$('#candidates-list-view .body').html("");
	console.log(candidatesListObj);
	$.each(candidatesListObj, function(l, cl){
		$.each(cl, function(p, canList){
			//$('#candidates-list-view .body').append('<div class="div"><div class="title">'+p.capitalize()+' - '+l+'<div class="arrow">&and;</div></div><div class="body">'+canList+'</div></div>');
			$('#candidates-list-view .body').append('<b>'+p+'</b><br/>'+canList)
		})
	})
}

var getCandidates = function(location){
	// var shapeLoadInstance = Math.random();
	// if(location.type=="country" && parseInt(defaultPost)==1){
	// 	var url = ngAppSettings.gisApi+"candidate/?token="+api_token+"&election="+CURRENT_ELECTION.code+"&post=1";
	// }
	// else{
	// 	var url = ngAppSettings.gisApi+"candidate/?"+location.type+"="+location.code+"&token="+api_token+"&election="+CURRENT_ELECTION.code;
	// }
	// $.ajax({
	// 	url: url,
	// 	dataType: "json",
	// 	beforeSend: function(){
	// 		clearMarkers();//Clear all markers from the map
	// 		manageLoadings.start(shapeLoadInstance);
	// 	},
	// 	error: function(){
	// 		manageLoadings.stop(shapeLoadInstance);
	// 	},
	// 	success: function(json){
	// 		manageLoadings.stop(shapeLoadInstance);
	// 		candidatesListObj[location.type]={};
	// 		var sideBarData = json.candidates;
	// 		$('#candidates-list-view .body').empty();
	// 		$.each(sideBarData, function(c, contestL){
	// 			var contestCanList="";
	// 			var contestID;
	// 			$.each(contestL.candidates, function(cn, candidate){
	// 				var party = {};
	// 				contestID = candidate.contest_type;
	// 				if(candidate.party.picture){
	// 					party["pic"] = candidate.party.picture;
	// 					party["name"] = candidate.party.name;
	// 					party["abr"] = candidate.party.abr
	// 				}
	// 				else{
	// 					party["abr"] = "Independent";
	// 					party["pic"] = "http://latest-api.api-iebc.appspot.com/images/parties/NOPIC.jpg";
	// 				}			
	// 				contestCanList+= '<div class="result-row div clearfix"><div class="box"><img src="'+candidate.picture+'" /></div><div class="box"><img src="'+party.pic+'" /></div><div class="long-box"><div class="title">'+candidate.other_name+' '+candidate.surname+'</div><div class="description"><div class="item">&bull; '+party.abr+'</div></div></div></div>';
	// 			});
	// 			if(contestID){
	// 				candidatesListObj[location.type][postsMappings[contestID]] = contestCanList;
	// 			}
	// 		});
	// 		candidatesShow();
	// 	}
	// });
}