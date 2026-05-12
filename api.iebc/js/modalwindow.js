var modalWindows={};
String.prototype.capitalize = function() { // add the capitalize method to the string object.
    return this.charAt(0).toUpperCase() + this.slice(1);
}
var ModalWindow = function(config){
	var $this = this;
	this.title = config.title;
	this.content = config.content;
	this.parent = config.parent;
	this.closeFunc = config.closeFunc;
	this.element = $("<div class='modal-window'></div>");
	
	this.close = function(){
		if($this.closeFunc){
			$this.closeFunc();
		}
		$this.element.hide('slide',{direction:'left'},1000, function(){
			$this.element.empty().remove();
			delete(modalWindows[$this.title]);
		});
		
	}
	
	this.getContent = function(){
		return $this.element;
	}
	
	this.resize = function(){
		var docHeight = $(window).height();
		var docWidth = $(window).width();
		var contentHeight = $this.element.outerHeight();
		var contentWidth = $this.element.outerWidth();
		var cTop = (docHeight-contentHeight)/2;
		var cLeft = (docWidth-contentWidth)/2;
		$this.element.animate({
			top: cTop,
			left: cLeft
		},1000);
	}
	
	this.create = function(ops){
		if(!modalWindows[$this.title]){
			var $modalClose = $("<div class='modal-window-close'>x</div>");
			var $modalTitle = $("<div class='modal-window-title'></div>");
			var $modalTitleText = $("<div class='modal-window-title-text'></div>");
			var $modalBody = $("<div class='modal-window-body'></div>");
			$modalTitleText.html("<span class='hint--top' data-hint='Double Click to Minimize/Maximize'>"+$this.title+"</span>");
			$modalTitle.append($modalTitleText).append($modalClose);
			$modalBody.append($this.content);
			$this.element.append($modalTitle);
			$this.element.append($modalBody);
			$modalTitle.dblclick(function(e) {
				$modalBody.slideToggle(700);
			});
			$modalClose.click(function(){
				$this.close();
			})
			
			var parentDIV = $('#gadget');
			parentDIV.css({
				"position":"relative"
			});
			parentDIV.append($this.element)
			$this.element.show('slide',{direction:'left'},1000, function(){
				$this.resize();
			});
			modalWindows[$this.title] = $this;
			if(!ops){
				$this.element.draggable();
			}
		}
	}
	return this;
}
