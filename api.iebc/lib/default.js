// JavaScript Document
$(document).ready(function() {
    $('.menu-item').click(function(){//manipulates the menu items
		$(this).addClass('selected').siblings('.menu-item').removeClass('selected');		
	});
	jQuery.easing.def = "linear";
	$('#body-content').cycle({
		fx: 'turnDown',
		timeout:0,
		speed: 400,
		pager: '#menu',
		pagerAnchorBuilder: function(idx, slide) { 
			// return selector string for existing anchor 
			return '#menu a:eq(' + idx + ')'; 
		} 
	});
});
