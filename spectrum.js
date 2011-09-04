// Spectrum: The No Hassle Colorpicker
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT
// Requires: jQuery, spectrum.css

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
		
        var opts = extend({ }, defaultOpts, o),
            doc = element.ownerDocument,
            body = doc.body,
			visible = false,
			dragWidth = 0,
            dragHeight = 0,
			slideHeight = 0,
			slideWidth = 0,
			currentHue = 0,
			currentSaturation = 0,
			currentValue = 0;
		
        var container = $(markup, doc),
            dragger = container.find(".spectrum-color"),
            dragHelper = container.find(".spectrum-drag-helper"),
			slider = container.find(".spectrum-slide"),
			slideHelper = container.find(".spectrum-slide-helper");

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
			var newColor = tinycolor(color);
			var newHsv = newColor.toHsv();
			
	        currentHue = newHsv.h;
			currentSaturation = newHsv.s;
			currentValue = newHsv.v;
			
	        updateUI();
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
		var IE = $.browser.msie;
		var hasTouch = (function() {
				var ret, elem = document.createElement('div');
				ret = ('ontouchstart' in elem);
				elem = null;
				return ret;
		}());
		
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
				// Mouseup happened outside of window
				if (IE && !(document.documentMode >= 9) && !e.button) {
					return stop();
				}
				
				var pageX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX : e.pageX;
				var pageY = e.originalEvent.touches ? e.originalEvent.touches[0].pageY : e.pageY;
				
				var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
				var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));
				
				if (hasTouch) {
					// stop scrolling in iOS
					prevent(e);
				}
				
				onmove.apply(element, [dragX, dragY]); 
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
					$(doc).bind(duringDragEvents);
					
					move(e);
				}
			} 
		}
		function stop() { 
			if (dragging) { 
				$(doc).unbind(duringDragEvents);
				onstop.apply(element, arguments); 
			}
			dragging = false; 
		}
	
		$(element).bind(hasTouch ? "touchstart" : "mousedown", start);
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
	}
    
    /**
     * Define a jQuery plugin if possible
     */
    if (typeof jQuery != "undefined") {
    	jQuery.fn.spectrum = function(opts) {
    	    return this.each(function() {
    	    	var spect = spectrum(this, opts);
    	    	jQuery(this).bind({
    	    		"spectrum.show": spect.show,
    	    		"spectrum.hide": spect.hide,
    	    		"spectrum.set":  function(e, color) { spect.set(color); }
    	    	});
    	    }); 
    	};
    }
    
    window.spectrum = spectrum;

})();

// TinyColor.js - https://github.com/bgrins/TinyColor - 2011 Brian Grinstead - v0.1
var tinycolor=function(){function s(a){var c=g=b=255;if(typeof a=="string"){a=a.replace(t,"").replace(u,"").toLowerCase();m[a]&&(a=m[a]);for(var d=!1,f=0;f<o.length;f++){var h=o[f].re.exec(a);if(h){d=o[f].process(h);break}}a=d}if(typeof a=="object"){a.hasOwnProperty("r")&&(c=i(a.r,255)*255,g=i(a.g,255)*255,b=i(a.b,255)*255);if(a.hasOwnProperty("h")&&a.hasOwnProperty("s")&&a.hasOwnProperty("v")){f=i(a.h,360);c=i(a.s,100);d=i(a.v,100);var e,k,j;h=i(f,360);c=i(c,100);d=i(d,100);f=Math.floor(h*6);var q=
h*6-f;h=d*(1-c);var l=d*(1-q*c);c=d*(1-(1-q)*c);switch(f%6){case 0:e=d;k=c;j=h;break;case 1:e=l;k=d;j=h;break;case 2:e=h;k=d;j=c;break;case 3:e=h;k=l;j=d;break;case 4:e=c;k=h;j=d;break;case 5:e=d,k=h,j=l}e={r:e*255,g:k*255,b:j*255};c=e.r;g=e.g;b=e.b}if(a.hasOwnProperty("h")&&a.hasOwnProperty("s")&&a.hasOwnProperty("l"))f=i(a.h,360),c=i(a.s,100),e=i(a.l,100),e=v(f,c,e),c=e.r,g=e.g,b=e.b}return{r:Math.min(255,Math.max(Math.round(c),0)),g:Math.min(255,Math.max(Math.round(g),0)),b:Math.min(255,Math.max(Math.round(b),
0))}}function r(a,c,d){a=i(a,255);c=i(c,255);d=i(d,255);var f=Math.max(a,c,d),h=Math.min(a,c,d),e,k=(f+h)/2;if(f==h)e=h=0;else{var j=f-h;h=k>0.5?j/(2-f-h):j/(f+h);switch(f){case a:e=(c-d)/j+(c<d?6:0);break;case c:e=(d-a)/j+2;break;case d:e=(a-c)/j+4}e/=6}return{h:e,s:h,l:k}}function v(a,c,d){function f(a,c,d){d<0&&(d+=1);d>1&&(d-=1);if(d<1/6)return a+(c-a)*6*d;if(d<0.5)return c;if(d<2/3)return a+(c-a)*(2/3-d)*6;return a}a=i(a,360);c=i(c,100);d=i(d,100);if(c==0)d=c=a=d;else{var h=d<0.5?d*(1+c):d+c-
d*c,e=2*d-h;d=f(e,h,a+1/3);c=f(e,h,a);a=f(e,h,a-1/3)}return{r:d*255,g:c*255,b:a*255}}function p(a,c,d){function f(a){return a.length==1?"0"+a:a}return[f(a.toString(16)),f(c.toString(16)),f(d.toString(16))].join("")}function i(a,c){a=parseFloat(a);if(a==c)return 1;else if(a>1)return a%c/parseFloat(c);return a}var n=function(a){if(typeof a=="object"&&a.hasOwnProperty("_tc_id"))return a;a=s(a);var c=a.r,d=a.g,f=a.b;return{_tc_id:w++,toHsv:function(){var a=c,e=d,k=f;a=i(a,255);e=i(e,255);k=i(k,255);var j=
Math.max(a,e,k),n=Math.min(a,e,k),l,m=j-n;if(j==n)l=0;else{switch(j){case a:l=(e-k)/m+(e<k?6:0);break;case e:l=(k-a)/m+2;break;case k:l=(a-e)/m+4}l/=6}return{h:l,s:j==0?0:m/j,v:j}},toHsl:function(){return r(c,d,f)},toHslCss:function(){var a=r(c,d,f);return"hsl("+Math.round(a.h*360)+", "+Math.round(a.s*100)+"%, "+Math.round(a.l*100)+"%)"},toHex:function(){return p(c,d,f)},toHexCss:function(){return"#"+p(c,d,f)},toRgb:function(){return{r:c,g:d,b:f}},toRgbCss:function(){return"rgb("+c+", "+d+", "+f+
")"},toName:function(){var a=p(c,d,f),e;for(e in m)if(m[e]==a)return e;return!1}}};n.version="0.2";n.equals=function(a,c){return n(a).toHex()==n(c).toHex()};var t=/^[\s,#]+/,u=/\s+$/,w=0,m=n.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"00ffff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000000",blanchedalmond:"ffebcd",blue:"0000ff",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",
cornsilk:"fff8dc",crimson:"dc143c",cyan:"00ffff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dodgerblue:"1e90ff",feldspar:"d19275",firebrick:"b22222",
floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"ff00ff",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",grey:"808080",green:"00ff00",greenyellow:"adff2f",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgrey:"d3d3d3",lightgreen:"90ee90",
lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslateblue:"8470ff",lightslategray:"778899",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"00ff00",limegreen:"32cd32",linen:"faf0e6",magenta:"ff00ff",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370d8",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",
mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"d87093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"ff0000",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",
seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",violetred:"d02090",wheat:"f5deb3",white:"ffffff",whitesmoke:"f5f5f5",yellow:"ffff00",yellowgreen:"9acd32"},o=[{re:/^rgb\s*\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,process:function(a){return{r:a[1],g:a[2],b:a[3]}}},{re:/^rgb\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/,
process:function(a){return{r:a[1],g:a[2],b:a[3]}}},{re:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,process:function(a){return{r:parseInt(a[1],16),g:parseInt(a[2],16),b:parseInt(a[3],16)}}},{re:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,process:function(a){return{r:parseInt(a[1]+a[1],16),g:parseInt(a[2]+a[2],16),b:parseInt(a[3]+a[3],16)}}},{re:/^hsl\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/,process:function(a){return{h:a[1],s:a[2],l:a[3]}}},{re:/^hsv\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/,
process:function(a){return{h:a[1],s:a[2],v:a[3]}}}];return n}();
