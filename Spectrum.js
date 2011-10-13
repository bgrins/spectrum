var WebInspector = { };

WebInspector.Spectrum = function(swatch, rgb)
{
	var document = this.document = swatch.ownerDocument;
	this.element = document.createElement('div');
	this.swatch = swatch;
	this.swatchInner = document.createElement('span');
	this.swatchInner.className = 'swatch-inner';
	this.swatch.appendChild(this.swatchInner);
	
	this.element.className = "sp-container sp-dev";
	this.element.innerHTML = [
		"<div class='sp-top'>",
			"<div class='sp-fill'></div>",
			"<div class='sp-top-inner'>",
				"<div class='sp-color'>",
					"<div class='sp-sat'>",
						"<div class='sp-val'>",
							"<div class='sp-dragger'></div>",
						"</div>",
					"</div>",
				"</div>",
				"<div class='sp-hue'>",
					"<div class='sp-slider'></div>",
				"</div>",
			"</div>",
		"</div>",
		"<div class='sp-range-container'>",
			"<input type='range' class='sp-range' min='0' max='100' />",
		"</div>"
	].join('');	
	this.element.addEventListener("click", WebInspector.Spectrum.stopPropagation, false);
	swatch.parentNode.insertBefore( this.element, swatch.nextSibling );
		
	var that = this;
	
	this.slider = this.element.querySelectorAll(".sp-hue")[0];
	this.slideHelper = this.element.querySelectorAll(".sp-slider")[0];
	WebInspector.Spectrum.draggable(this.slider, function(dragX, dragY) {
		that.hsv[0] = (dragY / that.slideHeight);
		
		that.updateUI();
		that.onchange();
	});
	
	this.dragger = this.element.querySelectorAll(".sp-color")[0];
	this.dragHelper = this.element.querySelectorAll(".sp-dragger")[0];
	WebInspector.Spectrum.draggable(this.dragger, function(dragX, dragY) {
		that.hsv[1] = dragX / that.dragWidth;
		that.hsv[2] = (that.dragHeight - dragY) / that.dragHeight;
		
		that.updateUI();
		that.onchange();
	});
	
	this.rangeSlider = this.element.querySelectorAll(".sp-range")[0];
	this.rangeSlider.addEventListener("change", function() {
		that.hsv[3] = this.value / 100;
		that.updateUI();
		that.onchange();
	}, false);
	
	if (rgb) {
		this.rgb = rgb;
		this.updateUI();
	}
};


WebInspector.Spectrum.prototype = {
    set rgb(color)
    {
		this.hsv = WebInspector.Spectrum.rgbToHsv(color[0], color[1], color[2], color[3]);
    },

    get rgb()
    {
		var rgb = WebInspector.Spectrum.hsvToRgb(this.hsv[0], this.hsv[1], this.hsv[2], this.hsv[3]);
		return [Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2]), rgb[3]];
    },
	
	get rgbNoSatVal()
	{
		var rgb = WebInspector.Spectrum.hsvToRgb(this.hsv[0], 1, 1);
		return [Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2]), rgb[3]];
	},
	
	onchange: function() {
		this._onchange(this.rgb);
	},
	
	_onchange: function() {
	
	},

	updateHelperLocations: function() {

		var h = this.hsv[0];
		var s = this.hsv[1];
		var v = this.hsv[2];
		
		// Where to show the little circle in that displays your current selected color
		var dragX = s * this.dragWidth;
		var dragY = this.dragHeight - (v * this.dragHeight);
		
		dragX = Math.max(
			-this.dragHelperHeight, 
			Math.min(this.dragWidth - this.dragHelperHeight, dragX - this.dragHelperHeight)
		);
		dragY = Math.max(
			-this.dragHelperHeight, 
			Math.min(this.dragHeight - this.dragHelperHeight, dragY - this.dragHelperHeight)
		);
		
		this.dragHelper.style.top = dragY + "px";
		this.dragHelper.style.left = dragX + "px";
		
		// Where to show the bar that displays your current selected hue
		var slideY = (h * this.slideHeight) - this.slideHelperHeight;
		this.slideHelper.style.top = slideY + "px";
		
		
		this.rangeSlider.value = this.hsv[3] * 100;
	},
	
	updateUI: function() {
	
            this.updateHelperLocations();
            
			var rgb = this.rgb;
			var rgbNoSatVal = this.rgbNoSatVal;
			
			var flatColor = "rgb(" + rgbNoSatVal[0] + ", " + rgbNoSatVal[1] + ", " + rgbNoSatVal[2] + ")";
			var fullColor = "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + rgb[3] + ")";
			
			console.log(flatColor);
			this.dragger.style.backgroundColor = flatColor;
			this.swatchInner.style.backgroundColor = fullColor;
			
			
			this.rangeSlider.value = this.hsv[3] * 100;
			
	},
	
	show: function(e) {
		this.element.classList.add('sp-show');
		this.element.style.left = this.swatch.offsetLeft + "px";
		this.element.style.top = (this.swatch.offsetTop  + this.swatch.clientHeight) + "px";
		
		this.slideHeight = this.slider.offsetHeight;
		this.dragWidth = this.dragger.offsetWidth;
		this.dragHeight = this.dragger.offsetHeight;
		this.dragHelperHeight = this.dragHelper.clientHeight;
		this.slideHelperHeight = this.slideHelper.clientHeight;
		
		if (e) { e.stopPropagation(); }
		var that = this;
		this.document.addEventListener("click", function() { that.hide(); }, false);
		
		this.updateUI();
	},
	
	toggle: function() {
		if (this.element.classList.contains('sp-show')) {
			this.hide();
		}
		else {
			this.show();
		}
	},
	
	hide: function() {
		this.element.classList.remove('sp-show');
	},
	
	addChangeListener: function(listener) {
		this._onchange = listener;
	}
	
};

WebInspector.Spectrum.stopPropagation = function(e) {
	e.stopPropagation();
};

WebInspector.Spectrum.hsvToRgb = function(h, s, v, a) {

    var r, g, b;
    

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    
    switch(i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    
    return [r * 255, g * 255, b * 255, a];
};

WebInspector.Spectrum.rgbToHsv = function(r, g, b, a) {

    r = r / 255;
    g = g / 255;
    b = b / 255;
    
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min) {
        h = 0; // achromatic
    }
    else {
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v, a];
};

WebInspector.Spectrum.addEvent = function (el, name, cb) {
	if (typeof name === "object") {
		for (var i in name) {
			el.addEventListener(i, name[i], false); 
		}   
	}
	else {
		 el.addEventListener(name, cb, false);   
	}
};
    
 WebInspector.Spectrum.removeEvent = function(el, name, cb) {
	if (typeof name === "object") {
		for (var i in name) {
			el.removeEventListener(i, name[i], false); 
		}   
	}
	else {
		 el.removeEventListener(name, cb, false);   
	}
};


WebInspector.Spectrum.getOffset = function(el) {
	var curleft = curtop = 0;
	if (el.offsetParent) {
		do {
			curleft += el.offsetLeft;
			curtop += el.offsetTop;
		} while (el = el.offsetParent);
	}
	return { left: curleft, top: curtop };
};

WebInspector.Spectrum.draggable = function(element, onmove, onstart, onstop) {
	onmove = onmove || function() { };
	onstart = onstart || function() { };
	onstop = onstop || function() { };
	
	var doc = element.ownerDocument || document;
	var dragging = false;
	var offset = { };
	var maxHeight = 0;
	var maxWidth = 0;
	var hasTouch = ('ontouchstart' in window);
	
	var duringDragEvents = { };
	duringDragEvents["selectstart"] = prevent;
	duringDragEvents["dragstart"] = prevent;
	duringDragEvents[(hasTouch ? "touchmove" : "mousemove")] = move;
	duringDragEvents[(hasTouch ? "touchend" : "mouseup")] = stop;

	function prevent(e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.returnValue = false;
	}
	
	function move(e) {
		if (dragging) {
			var touches =  e.touches;
			
			var pageX = touches ? touches[0].pageX : e.pageX;
			var pageY = touches ? touches[0].pageY : e.pageY;
			
			var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
			var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));
			if (hasTouch) {
				// Stop scrolling in iOS
				prevent(e);
			}
			
			onmove.apply(element, [dragX, dragY]); 
		} 
	}
	function start(e) { 
		var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
		var touches =  e.touches;
		
		if (!rightclick && !dragging) { 
			if (onstart.apply(element, arguments) !== false) {
				dragging = true; 
				maxHeight = element.clientHeight;
				maxWidth = element.clientWidth;
				
				offset = WebInspector.Spectrum.getOffset(element);
				
				WebInspector.Spectrum.addEvent(doc, duringDragEvents);
				
				if (!hasTouch) {
					move(e);
				}
				else {
					prevent(e);
				}
			}
		}
	}
	function stop() { 
		if (dragging) { 
			WebInspector.Spectrum.removeEvent(doc, duringDragEvents);
			onstop.apply(element, arguments); 
		}
		dragging = false; 
	}
	
	WebInspector.Spectrum.addEvent(element, hasTouch ? "touchstart" : "mousedown", start);
};
