(function() {
   
   var replaceInput = "<div></div>";
   var markup = [
    "<div class='spectrum-container'>",
        "<div class='spectrum-color'><div class='spectrum-g1'><div class='spectrum-g2'><div class='spectrum-drag-helper'></div></div></div></div>",
        "<div class='spectrum-slide'><div class='spectrum-slide-helper'></div></div>",
        "<br style='clear:both;' />",
    "</div>"
    ].join("");
    
    var defaultOpts = {
        color: "red",
        move: function() { },
        close: function() { },
        open: function() { },
		flat: false
    };

	var trimLeft = /^[\s,#]+/, 
		trimRight = /\s+$/;
    
    function spectrum(element, o) {

        var opts = $.extend({ }, defaultOpts, o),
            doc = element.ownerDocument,
            body = doc.body,
            container = $(markup),
            dragger = container.find(".spectrum-color"),
            dragHelper = container.find(".spectrum-drag-helper"),
			slider = container.find(".spectrum-slide"),
			slideHelper = container.find(".spectrum-slide-helper"),
            dragging = false,
			sliding = false,
			visible = false,
			dragWidth = 0,
            dragHeight = 0,
			slideHeight = 0,
			slideWidth = 0,
			currentHue = 0,
			currentSaturation = 0,
			currentValue = 0;
		
		if ($.browser.msie) {
			for (var i = 1; i < 9; i++) {
				slider.append("<div class='spectrum-ie-"+i+"'></div>");
			}
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
		
        /* Public API */
        boundElement.bind("spectrum.show", function() {
			if (visible) { return; }
			visible = true;
			
			$(doc).bind("click", docClick);
			
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
        });
		
        boundElement.bind("spectrum.hide", function() {
			if (!visible || opts.flat) { return; }
			visible = false;
			
			$(doc).unbind("click", docClick);
            container.hide();    
        });
		
        boundElement.bind("spectrum.set", function(e, c) {
            setColor(c);
        });
		
		visibleElement.click(function(e) {
			boundElement.trigger(visible ? "spectrum.hide" : "spectrum.show");
			e.stopPropagation();
		});
        
        /* DOM event handlers */
		
		function docClick() {
			boundElement.trigger("spectrum.hide");
		}
		
		function updateUI() {
			var h = currentHue;
			var s = currentSaturation;
            var v = currentValue;
            
            // Update dragger UI
            var dragX = s * dragWidth;
            var dragY = dragHeight - (v * dragHeight);
            var dragHelperHeight = dragHelper.height() / 2;
            dragHelper.css({
                "top": dragY - dragHelperHeight,
                "left": dragX - dragHelperHeight
            });
			
			// Update slider UI
			var slideY = (currentHue / 360) * slideHeight;
            var slideHelperHeight = slideHelper.height() / 2;
            slideHelper.css({
                "top": slideY - slideHelperHeight
            });
			
			// Update dragger background color
			var flatHex = hsv2rgb(h, 1, 1).hex;
			dragger.css("background-color", flatHex);
			
			var realHSV = { h: h, s: s, v: v };
			var realRGB = hsv2rgb(h, s, v);
			visibleElement.css("background-color", realRGB.hex);
			
			opts.move({ hsv: realHSV, rgb: realRGB, hex: realRGB.hex });
		}
		
		// Don't let click event go up to document
		container.bind("click", function(e) {
			e.stopPropagation();
		});
		
		draggable(slider, slide);
		draggable(dragger, drag);
        
        function drag(e) {
			currentSaturation = e.dragX / dragWidth;
			currentValue = (dragHeight -  e.dragY) / dragHeight;
			
			updateUI();
        }
        function slide(e) {
			currentHue = (e.dragY / slideHeight) * 360;
			
			updateUI();
        }
		
		
		function setColor(color) {
			var hsv;
			
			if (typeof color == "object") {
				if (color.hasOwnProperty("r")) {
					hsv = rgb2hsv(color.r, color.g, color.b);
				}
				else if (color.hasOwnProperty("h")) {
					hsv = color;
				}
			}
			
			if (typeof color == "string") {
				
    			color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
    			
    			if (htmlcodes[color]) {
    				color = htmlcodes[color];
    			}
    			
    			hsv = rgb2hsv(
    				parseInt(color.substr(0, 2), 16), 
    				parseInt(color.substr(2, 2), 16), 
    				parseInt(color.substr(4, 2), 16)
    			);
			}
			
			var h = hsv.h % 360;
	       	var s = hsv.s;
	        var v = hsv.v;
	        
	        var c = hsv2rgb(h, s, v);
	        
	        currentHue = h;
			currentSaturation = s;
			currentValue = v;
			
	        updateUI();
        }
        
		
		if (opts.flat) {
			boundElement.after(container.addClass("spectrum-flat")).hide();
			boundElement.trigger("spectrum.show");
		}
		else {
        	$(body).append(container.hide());
		}
		
        boundElement.trigger("spectrum.set", opts.color);
    }
	
    function draggable(element, onmove, onstart, onstop) {
		onmove = onmove || function() { };
		onstart = onstart || function() { };
		onstop = onstop || function() { };
		var doc = element.ownerDocument || document;
		var dragging = false;
		var offset = { };
		var maxHeight = 0;
		var maxWidth = 0;
		function move(e) { 
			if (dragging) {
				e.dragX = Math.max(0, Math.min(e.pageX - offset.left, maxWidth));
				e.dragY = Math.max(0, Math.min(e.pageY - offset.top, maxHeight));
				
				onmove.apply(element, [e]); 
			} 
		}
		function start(e) { 
			var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
		
			if (!rightclick && !dragging) { 
				if (onstart.apply(element, arguments) !== false) {
					dragging = true; 
					maxHeight = $(element).height();
					maxWidth = $(element).width();
					offset = $(element).offset();
					$(doc).bind({ 
						"mouseup": stop,
						"mousemove": move
					});
				}
			} 
		}
		function stop() { 
			if (dragging) { 
				$(doc).unbind("mouseup", stop);
				onstop.apply(element, arguments); 
			}
			dragging = false; 
		}
	
		$(element).bind("mousedown", start);
	}	
	
    /**
     * Convert HSV representation to RGB HEX string.
     * Credits to http://www.raphaeljs.com
     */
    function hsv2rgb(h, s, v) {
        var R, G, B, X, C;
        h = (h % 360) / 60;
            C = v * s;
        X = C * (1 - Math.abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];

        var r = R * 255,
            g = G * 255,
            b = B * 255;
        return { r: r, g: g, b: b, hex: "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1) };
    }

    /**
     * Convert RGB representation to HSV.
     * r, g, b can be either in <0,1> range or <0,255> range.
     * Credits to http://www.raphaeljs.com
     */
    function rgb2hsv(r, g, b) {
        if (r > 1 || g > 1 || b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;            
        }
        var H, S, V, C;
        V = Math.max(r, g, b);
        C = V - Math.min(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = (H % 6) * 60;
        S = C == 0 ? 0 : C / V;
        return { h: H, s: S, v: V };
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
    
    
    $.fn.spectrum = function(opts) {
        return this.each(function() {
            spectrum(this, opts);
        }); 
    };
    window.spectrum = spectrum;

})();


