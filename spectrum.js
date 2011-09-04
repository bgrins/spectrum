/***
Spectrum: The No Hassle Colorpicker
https://github.com/bgrins/spectrum

Author: Brian Grinstead
License: MIT
Requires: jQuery, spectrum.css
***/

(function() {
   
	var defaultOpts = {
	    color: "red",
	    move: function() { },
	    close: function() { },
	    open: function() { },
	    flat: false
	},
	trimLeft = /^[\s,#]+/,
	trimRight = /\s+$/,
	replaceInput = "<div class='spectrum-replacer'></div>",
	markup = (function() {
		
		// IE does not support gradients with multiple stops, so we need to simulate            
		//  that for the rainbow slider with 8 divs that each have a single gradient
		var gradientFix = "";
		if ($.browser.msie) {
			for (var i = 1; i < 9; i++) {
			    gradientFix += "<div class='spectrum-ie-" + i + "'></div>";
			}
		}
		
		return [
	    	"<div class='spectrum-container'>",
	    	    "<div class='spectrum-color'>",
	    	    	"<div class='spectrum-g1'>",
	    	    		"<div class='spectrum-g2'>",
	    	    			"<div class='spectrum-drag-helper'></div>",
	    	    		"</div>",
	    	    	"</div>",
	    	    "</div>",
	    	    "<div class='spectrum-slide'>",
	    	    	"<div class='spectrum-slide-helper'></div>",
	    	    	gradientFix,
	    	    "</div>",
	    	    "<br style='clear:both;' />",
	    	"</div>"
    	].join("");
	})();
    
    
    function spectrum(element, o) {
		
        var spect = { },
        	opts = extend({ }, defaultOpts, o),
            doc = element.ownerDocument,
            body = doc.body,
            container = $(markup),
            dragger = container.find(".spectrum-color"),
            dragHelper = container.find(".spectrum-drag-helper"),
			slider = container.find(".spectrum-slide"),
			slideHelper = container.find(".spectrum-slide-helper"),
			visible = false,
			dragWidth = 0,
            dragHeight = 0,
			slideHeight = 0,
			slideWidth = 0,
			currentHue = 0,
			currentSaturation = 0,
			currentValue = 0;

		if ($.browser.msie) {
			container.find("*").attr("unselectable", "on");
		}	
		
        var boundElement = $(element);
		var visibleElement;
		if (boundElement.is("input") && !opts.flat) {
			visibleElement = $(replaceInput);
			boundElement.hide().after(visibleElement);
		}
		else {
			visibleElement = $(element);
		}
		
		visibleElement.addClass("spectrum-element");
		
		visibleElement.click(function(e) {
			(visible) ? hide() : show();
			
			// Need to prevent the event from causing a click on the document,
			// which would cause the picker to hide, even if you were clicking on it
			e.stopPropagation();
		});
		container.click(stopPropagation);
		
        function show() {
			if (visible) { return; }
			visible = true;
			
			$(doc).bind("click", hide);
			
			if (!opts.flat) {
				var elOffset = visibleElement.offset();
				elOffset.left += visibleElement.width();
            	container.show().offset(elOffset);
            }
            
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            
            updateUI();
        }
		
		function hide() {
			if (!visible || opts.flat) { return; }
			visible = false;
			
			$(doc).unbind("click", hide);
            container.hide();
		}
		
		function set(color) {
			setColor(color);
		}
		
		function updateUI() {
			var h = currentHue;
			var s = currentSaturation;
            var v = currentValue;
            
            // Update dragger UI
            var dragHelperHeight = dragHelper.height();
            var dragX = s * dragWidth;
            var dragY = dragHeight - (v * dragHeight);
            
            dragX = Math.max(-dragHelperHeight, Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight));
            dragY = Math.max(-dragHelperHeight, Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight));
            
            dragHelper.css({
                "top": dragY,
                "left": dragX
            });
			
			// Update slider UI
			var slideY = (currentHue) * slideHeight;
            var slideHelperHeight = slideHelper.height() / 2;
            slideHelper.css({
                "top": slideY - slideHelperHeight
            });
			
			// Update dragger background color
			var flatColor = tinycolor({ h: h, s: 1, v: 1});
			dragger.css("background-color", flatColor.toHexCss());
			
			var realColor = tinycolor({ h: h, s: s, v: v });
			visibleElement.css("background-color", realColor.toHexCss());
			
			opts.move({ hsv: realColor.toHsv(), rgb: realColor.toRgb(), hex: realColor.toHexCss() });
		}
		
		
		draggable(slider, function(dragX, dragY) {
			currentHue = (dragY / slideHeight);
			updateUI();
		});
		
		draggable(dragger, function(dragX, dragY) {
			currentSaturation = dragX / dragWidth;
			currentValue = (dragHeight -  dragY) / dragHeight;
			updateUI();
		});
		
		
		function setColor(color) {
			var newColor = tinycolor(color);
			var newHsv = newColor.toHsv();
			
	        currentHue = newHsv.h;
			currentSaturation = newHsv.s;
			currentValue = newHsv.v;
			
	        updateUI();
        }
        
		
		if (opts.flat) {
			boundElement.after(container.addClass("spectrum-flat")).hide();
			show();
		}
		else {
        	$(body).append(container.hide());
		}
		
		set(opts.color);
		
		return {
			show: show,
			hide: hide,
			set: set
		};
    }
    
    /**
     * stopPropagation - makes the code only doing this a little easier to read in line
     */
	function stopPropagation(e) {
		e.stopPropagation();
	}

    /**
     * Lightweight drag helper.  Handles containment within the element, so that
     * when dragging, the x is within [0,element.width] and y is within [0,element.height]
     */
    function draggable(element, onmove, onstart, onstop) {
		onmove = onmove || function() { };
		onstart = onstart || function() { };
		onstop = onstop || function() { };
		var doc = element.ownerDocument || document;
		var dragging = false;
		var offset = { };
		var maxHeight = 0;
		var maxWidth = 0;
		
		var HELPER_SIZE = 100;
		var helper = $("<div></div>").css({
			"position": "absolute",
			"width": HELPER_SIZE,
			"height": HELPER_SIZE,
			"z-index": 1000,
			"background": "transparent"
		});
		
		function move(e) { 
			if (dragging) {
				// Mouseup happened outside of window
				if ($.browser.msie && !(document.documentMode >= 9) && !e.button) {
					return stop();
				}
				
				helper.offset({top:e.pageY - (HELPER_SIZE/2), left: e.pageX - (HELPER_SIZE/2)});
				
				var dragX = Math.max(0, Math.min(e.pageX - offset.left, maxWidth));
				var dragY = Math.max(0, Math.min(e.pageY - offset.top, maxHeight));
				
				onmove.apply(element, [dragX, dragY]); 
			} 
		}
		function start(e) { 
			var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
			if (!rightclick && !dragging) { 
				if (onstart.apply(element, arguments) !== false) {
					helper.appendTo("body");
					dragging = true; 
					maxHeight = $(element).height();
					maxWidth = $(element).width();
					offset = $(element).offset();
					$(doc).bind({ 
						"mouseup": stop,
						"mousemove": move
					});
					
					move(e);
				}
			} 
		}
		function stop() { 
			if (dragging) { 
				$(doc).unbind("mouseup", stop);
				helper.remove();
				onstop.apply(element, arguments); 
			}
			dragging = false; 
		}
	
		$(element).bind("mousedown", start);
	}	
	
    
    /**
     * Extend a given object with all the properties in passed-in object(s)
     * Thanks to underscore.js
     */
    function extend (obj) {
    	var a = Array.prototype.slice.call(arguments, 1);
		for (var i = 0; i < a.length; i++) {
			var source = a[i];
			for (var prop in source) {
				if (source[prop] !== void 0) obj[prop] = source[prop];
			}
		}
		return obj;
	};
    
    $.fn.spectrum = function(opts) {
        return this.each(function() {
        	var spect = spectrum(this, opts);
        	$(this).bind({
        		"spectrum.show": spect.show,
        		"spectrum.hide": spect.hide,
        		"spectrum.set":  function(e, color) { spect.set(color); }
        	});
        }); 
    };
    window.spectrum = spectrum;

})();


// TinyColor.js - https://github.com/bgrins/TinyColor - 2011 Brian Grinstead - v0.1

var tinycolor = (function() {

var tc = _tinycolor;
tc.version = "0.1";
tc.equals = function(color1, color2) {
	return tc(color1).toHex() == tc(color2).toHex();
}

var trimLeft = /^[\s,#]+/, 
	trimRight = /\s+$/,
	tinyCounter = 0;

function _tinycolor (color) {
	
	// If input is already a tinycolor, return itself
	if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
		return color;
	}
	
	var rgb = inputToRGB(color);
	var r = rgb.r, g = rgb.g, b = rgb.b;
	
	return {
		_tc_id: tinyCounter++,
		toHsv: function() {
			return rgbToHsv(r, g, b);
		},
		toHsl: function() {
			return rgbToHsl(r, g, b);
		},
		toHslCss: function() {
			var hsl = rgbToHsl(r, g, b);
			var h = Math.round(hsl.h * 360);
			var s = Math.round(hsl.s * 100);
			var l = Math.round(hsl.l * 100);
			return "hsl(" + h + ", " + s + "%, " + l + "%)";
		},
		toHex: function() {
			return rgbToHex(r, g, b);
		},
		toHexCss: function() {
			return '#' + rgbToHex(r, g, b);
		},
		toRgb: function() {
			return { r: r, g: g, b: b };
		},
		toRgbCss: function() {
			return "rgb(" + r + ", " + g + ", " + b + ")";
		},
		toName: function() {
			var hex = rgbToHex(r, g, b);
			for (var i in htmlcodes) {
				if (htmlcodes[i] == hex) {
					return i;
				}
			}
			return false;
		}
	};
};


function inputToRGB(color) {

	var r = g = b = 255;
	var ok = false;
	
	if (typeof color == "string") {
    	color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
    	if (htmlcodes[color]) {
    		color = htmlcodes[color];
    	}
    	
    	for (var i = 0; i < colorparsers.length; i++) {
    	    var processor = colorparsers[i].process;
    	    var bits = colorparsers[i].re.exec(color);
    	    if (bits) {
    	        channels = processor(bits);
    	        r = channels[0];
    	        g = channels[1];
    	        b = channels[2];
    	        ok = true;
    	    }
		
    	}
	}
	else if (typeof color == "object") {
		if (color.hasOwnProperty("r")) {
			r = color.r;
			g = color.g;
			b = color.b;		
		}
		if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
			var rgb = hsvToRgb(color.h, color.s, color.v);
			
			r = rgb.r;
			g = rgb.g;
			b = rgb.b;
		}
		if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
			var rgb = hslToRgb(color.h, color.s, color.l);
			r = rgb.r;
			g = rgb.g;
			b = rgb.b;
		}
	}
	
	return {
		r: Math.min(255, Math.max(parseInt(r, 10), 0)),
		g: Math.min(255, Math.max(parseInt(g, 10), 0)),
		b: Math.min(255, Math.max(parseInt(b, 10), 0))
	};
}

// hsv and hsl to and from rgb taken from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
/** 
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h, s: s, l: l };
}

function bound01(n, max) {
	n = parseFloat(n);
	if (n == max) {
		return 1;
	}
	else if (n > 1) {
		return (n % max) / parseFloat(max);
	}
	return n;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

	h = bound01(h, 360);
	s = bound01(s, 100);
	l = bound01(l, 100);
	
    function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }
    
    if(s == 0){
        r = g = b = l; // achromatic
    }else{

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h, s: s, v: v };
}


/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;
    
    
	h = bound01(h, 360);
	s = bound01(s, 100);
	v = bound01(v, 100);
	
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    
    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    
    return {r: r * 255, g: g * 255, b: b * 255};
}


function rgbToHex(r, g, b) {
	function pad(c) {
		return c.length == 1 ? '0' + c : c;
	}	
	return [ 
		pad(r.toString(16)),
		pad(g.toString(16)),
		pad(b.toString(16))
	].join("");
}



var htmlcodes = {
	aliceblue: 'f0f8ff',
	antiquewhite: 'faebd7',
	aqua: '00ffff',
	aquamarine: '7fffd4',
	azure: 'f0ffff',
	beige: 'f5f5dc',
	bisque: 'ffe4c4',
	black: '000000',
	blanchedalmond: 'ffebcd',
	blue: '0000ff',
	blueviolet: '8a2be2',
	brown: 'a52a2a',
	burlywood: 'deb887',
	cadetblue: '5f9ea0',
	chartreuse: '7fff00',
	chocolate: 'd2691e',
	coral: 'ff7f50',
	cornflowerblue: '6495ed',
	cornsilk: 'fff8dc',
	crimson: 'dc143c',
	cyan: '00ffff',
	darkblue: '00008b',
	darkcyan: '008b8b',
	darkgoldenrod: 'b8860b',
	darkgray: 'a9a9a9',
	darkgreen: '006400',
	darkkhaki: 'bdb76b',
	darkmagenta: '8b008b',
	darkolivegreen: '556b2f',
	darkorange: 'ff8c00',
	darkorchid: '9932cc',
	darkred: '8b0000',
	darksalmon: 'e9967a',
	darkseagreen: '8fbc8f',
	darkslateblue: '483d8b',
	darkslategray: '2f4f4f',
	darkturquoise: '00ced1',
	darkviolet: '9400d3',
	deeppink: 'ff1493',
	deepskyblue: '00bfff',
	dimgray: '696969',
	dodgerblue: '1e90ff',
	feldspar: 'd19275',
	firebrick: 'b22222',
	floralwhite: 'fffaf0',
	forestgreen: '228b22',
	fuchsia: 'ff00ff',
	gainsboro: 'dcdcdc',
	ghostwhite: 'f8f8ff',
	gold: 'ffd700',
	goldenrod: 'daa520',
	gray: '808080',
	grey: '808080',
	green: '00ff00',
	greenyellow: 'adff2f',
	honeydew: 'f0fff0',
	hotpink: 'ff69b4',
	indianred : 'cd5c5c',
	indigo : '4b0082',
	ivory: 'fffff0',
	khaki: 'f0e68c',
	lavender: 'e6e6fa',
	lavenderblush: 'fff0f5',
	lawngreen: '7cfc00',
	lemonchiffon: 'fffacd',
	lightblue: 'add8e6',
	lightcoral: 'f08080',
	lightcyan: 'e0ffff',
	lightgoldenrodyellow: 'fafad2',
	lightgrey: 'd3d3d3',
	lightgreen: '90ee90',
	lightpink: 'ffb6c1',
	lightsalmon: 'ffa07a',
	lightseagreen: '20b2aa',
	lightskyblue: '87cefa',
	lightslateblue: '8470ff',
	lightslategray: '778899',
	lightsteelblue: 'b0c4de',
	lightyellow: 'ffffe0',
	lime: '00ff00',
	limegreen: '32cd32',
	linen: 'faf0e6',
	magenta: 'ff00ff',
	maroon: '800000',
	mediumaquamarine: '66cdaa',
	mediumblue: '0000cd',
	mediumorchid: 'ba55d3',
	mediumpurple: '9370d8',
	mediumseagreen: '3cb371',
	mediumslateblue: '7b68ee',
	mediumspringgreen: '00fa9a',
	mediumturquoise: '48d1cc',
	mediumvioletred: 'c71585',
	midnightblue: '191970',
	mintcream: 'f5fffa',
	mistyrose: 'ffe4e1',
	moccasin: 'ffe4b5',
	navajowhite: 'ffdead',
	navy: '000080',
	oldlace: 'fdf5e6',
	olive: '808000',
	olivedrab: '6b8e23',
	orange: 'ffa500',
	orangered: 'ff4500',
	orchid: 'da70d6',
	palegoldenrod: 'eee8aa',
	palegreen: '98fb98',
	paleturquoise: 'afeeee',
	palevioletred: 'd87093',
	papayawhip: 'ffefd5',
	peachpuff: 'ffdab9',
	peru: 'cd853f',
	pink: 'ffc0cb',
	plum: 'dda0dd',
	powderblue: 'b0e0e6',
	purple: '800080',
	red: 'ff0000',
	rosybrown: 'bc8f8f',
	royalblue: '4169e1',
	saddlebrown: '8b4513',
	salmon: 'fa8072',
	sandybrown: 'f4a460',
	seagreen: '2e8b57',
	seashell: 'fff5ee',
	sienna: 'a0522d',
	silver: 'c0c0c0',
	skyblue: '87ceeb',
	slateblue: '6a5acd',
	slategray: '708090',
	snow: 'fffafa',
	springgreen: '00ff7f',
	steelblue: '4682b4',
	tan: 'd2b48c',
	teal: '008080',
	thistle: 'd8bfd8',
	tomato: 'ff6347',
	turquoise: '40e0d0',
	violet: 'ee82ee',
	violetred: 'd02090',
	wheat: 'f5deb3',
	white: 'ffffff',
	whitesmoke: 'f5f5f5',
	yellow: 'ffff00',
	yellowgreen: '9acd32'
};


var colorparsers = [
	{
	    re: /^rgb\s*\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
	    process: function (bits){
	        return [
	            parseInt(bits[1]),
	            parseInt(bits[2]),
	            parseInt(bits[3])
	        ];
	    }
	},
	{
	    re: /^rgb\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/,
	    process: function (bits) {
	        return [
	            parseInt(bits[1]),
	            parseInt(bits[2]),
	            parseInt(bits[3])
	        ];
	    }
	},
	{
	    re: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
	    process: function (bits) {
	        return [
	            parseInt(bits[1], 16),
	            parseInt(bits[2], 16),
	            parseInt(bits[3], 16)
	        ];
	    }
	},
	{
	    re: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
	    process: function (bits) {
	        return [
	            parseInt(bits[1] + bits[1], 16),
	            parseInt(bits[2] + bits[2], 16),
	            parseInt(bits[3] + bits[3], 16)
	        ];
	    }
	},
	{
	    re: /^hsl\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/,
	    process: function (bits) {
	    	var rgb = hslToRgb(bits[1], bits[2], bits[3]);
	        return [
	            rgb.r,
	            rgb.g,
	            rgb.b
	        ];
	    }
	},
	{
	    re: /^hsv\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/,
	    process: function (bits) {
	    	var rgb = hsvToRgb(bits[1], bits[2], bits[3]);
	        return [
	            rgb.r,
	            rgb.g,
	            rgb.b
	        ];
	    }
	}
];

function log() { if (console) { console.log( Array.prototype.slice.call(arguments) ); } }

return tc;

})();
