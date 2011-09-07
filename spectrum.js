// Spectrum: The No Hassle Colorpicker
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT
// Requires: jQuery, spectrum.css

(function(window, $, undefined) {
   
    var defaultOpts = {
        color: false,
        flat: false,
        showInput: false,
        changeOnMove: true,
        beforeShow: function() { },
        move: function() { },
        change: function() { },
        show: function() { },
        hide: function() { },
        showPallet: false,
        maxPalletSize: 12,
        pallet: ['white', 'black']
    },
    spectrums = [],
    hasjQuery = typeof $ != "undefined",
    trimLeft = /^[\s,#]+/,
    trimRight = /\s+$/,
    replaceInput = [
    	"<div class='spectrum-replacer spectrum-cf'>",
    		"<div class='spectrum-text'></div>",
    		"<div class='spectrum-dd'>&#9660;</div>",
    	"</div>"
    ].join(''),
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
                    "<div class='spectrum-saturation'>",
                        "<div class='spectrum-value'>",
                            "<div class='spectrum-drag-helper'></div>",
                        "</div>",
                    "</div>",
                "</div>",
                "<div class='spectrum-slide'>",
                    "<div class='spectrum-slide-helper'></div>",
                    gradientFix,
                "</div>",
                "<br style='clear:both;' />",
                "<div class='spectrum-input-container'>",
                    "<input class='spectrum-input' type='text' />",
                    "<span class='spectrum-button'>Go</span>",
                "</div>",
                "<div class='spectrum-pallet-container'>",
                "</div>",
            "</div>"
        ].join("");
    })(),
    palletTemplate = function(p, active) {
    	var html = [];
    	for (var i = 0; i < p.length; i++) {
    		var c = i == active ? " class='spectrum-pallet-active' " : "";
    		html.push('<span style="background-color:' + p[i] + ';"' + c + '></span>');
    	}
    	return html.join('');
    };
    
    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            spectrums[i].hide();
        }
    }
    function instanceOptions(o, callbackContext) {
        var opts = extend({ }, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };
        
        return opts;
    }
	
    function spectrum(element, o) {
        
        var opts = instanceOptions(o, element),
            callbacks = opts.callbacks,
            visible = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            pallet = opts.pallet.slice(0),
            palletLookup = { };
        
        var doc = element.ownerDocument,
            body = doc.body, 
            boundElement = $(element),
        	container = $(markup, doc),
            dragger = container.find(".spectrum-color"),
            dragHelper = container.find(".spectrum-drag-helper"),
            slider = container.find(".spectrum-slide"),
            slideHelper = container.find(".spectrum-slide-helper"),
            textInput = container.find(".spectrum-input"),
            palletContainer = container.find(".spectrum-pallet-container"),
            isInput = boundElement.is("input"),
            shouldReplace = isInput && !opts.flat,
            visibleElement = (shouldReplace) ? $(replaceInput) : $(element);

		function initialize() {
			
    	    if ($.browser.msie) {
    	        container.find("*:not(input)").attr("unselectable", "on");
    	    }   
    	    
    	    container.toggleClass("spectrum-flat", opts.flat);
    	    container.toggleClass("spectrum-input-disabled", !opts.showInput);
    	    container.toggleClass("spectrum-pallet-disabled", !opts.showPallet);
    	    visibleElement.toggleClass("spectrum-hide-input", !opts.showInput);
    	    
    	    if (shouldReplace) {
    	        boundElement.hide().after(visibleElement);
    	    }
    	    
        	if (opts.flat) {
            	boundElement.after(container).hide();
            }
        	else {
        	    $(body).append(container.hide());
        	}
    	    
    	    visibleElement.bind("click touchstart", function(e) {
    	        toggle();
    	        
    	        e.stopPropagation();
    	        
    	        if (!$(e.target).is("input")) {
    	        	e.preventDefault();
    	        }
    	    });
    	    
    	    // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
    	    container.click(stopPropagation);
    	    
    	    // Handle user typed input
    	    textInput.change(setFromTextInput);
    	    textInput.keydown(function(e) { if (e.keyCode == 13) { setFromTextInput(); } } );

    	    draggable(slider, function(dragX, dragY) {
    	        currentHue = (dragY / slideHeight);
    	        doMove();
    	    });
    	    
    	    draggable(dragger, function(dragX, dragY) {
    	        currentSaturation = dragX / dragWidth;
    	        currentValue = (dragHeight -     dragY) / dragHeight;
    	        doMove();
    	    });
    	    
        	var initialColor = opts.color || (isInput && boundElement.val());
        	if (!!initialColor) {
        	    set(initialColor);
        	    pallet.push(initialColor);
        	}
        	
        	setPallet(pallet);
        	
        	if (opts.flat) {
        	    show();
        	}
        	
        	palletContainer.delegate("span", "click", function() {
        		set($(this).css("background-color"));
        	});
		}
		
		function setPallet(p) {
        	if (opts.showPallet) {
        		var unique = [];
				palletLookup = { };
				for (var i = 0; i < p.length; i++) {
					var hex = tinycolor(p[i]).toHexString();	
					if (!palletLookup.hasOwnProperty(hex)) {
						palletLookup[hex] = unique.push(p[i]) - 1;
					}
				}
				pallet = unique.slice(0, opts.maxPalletSize);
				drawPallet();
        	}
		}
		function drawPallet(active) {
			palletContainer.html(palletTemplate(pallet, active));
		}
		
        function setFromTextInput() {
        	set(textInput.val());
        }
        
        function toggle() {
    		(visible) ? hide() : show();
        }
        
        function show() {
            if (visible) { return; }
            
            if (callbacks.beforeShow(get()) === false) return;
            
            hideAll();
            
            visible = true;
            
            $(doc).bind("click touchstart", hide);
            
            if (!opts.flat) {
            	visibleElement.addClass("spectrum-active");
            	container.show().offset(getOffset(container, visibleElement));
            }
            
            // Cache sizes on start
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHelperHeight = slideHelper.height();
            
            doMove();
            
            callbacks.show(get())
        }
        
        function hide() {
            if (!visible || opts.flat) { return; }
            visible = false;
            
            $(doc).unbind("click", hide);
            
           	visibleElement.removeClass("spectrum-active");
            container.hide();
            
            
        	    pallet.push(get().toHexString());
        	    setPallet(pallet);
        	    
            callbacks.hide(get());
        }
        
        function set(color) {
            var newColor = tinycolor(color);
            var newHsv = newColor.toHsv();
            
            currentHue = newHsv.h;
            currentSaturation = newHsv.s;
            currentValue = newHsv.v;
            
            doMove();
        }
        
        function get() {
            return tinycolor({ h: currentHue, s: currentSaturation, v: currentValue });
        }
        
        function doMove() {
            var h = currentHue;
            var s = currentSaturation;
            var v = currentValue;
            
            // Where to show the little circle in that displays your current selected color
            var dragX = s * dragWidth;
            var dragY = dragHeight - (v * dragHeight);
            dragX = Math.max(
                -dragHelperHeight, 
                Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
            );
            dragY = Math.max(
                -dragHelperHeight, 
                Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
            );
            dragHelper.css({
                "top": dragY,
                "left": dragX
            });
            
            // Where to show the bar that displays your current selected hue
            var slideY = (currentHue) * slideHeight;
            slideHelper.css({
                "top": slideY - slideHelperHeight
            });
            
            // Update dragger background color ("flat" because gradients take care of saturation
            // and value).
            var flatColor = tinycolor({ h: h, s: 1, v: 1});
            dragger.css("background-color", flatColor.toHexString());
            
            var realColor = get(),
            	realHex = realColor.toHexString();
            
            // Update the replaced elements background color (with actual selected color)
            if (shouldReplace) {
            	visibleElement.css("background-color", realHex);
            }
            
            // Update the input as it changes happen
            if (isInput) {
                boundElement.val(realHex);
                textInput.val(realHex);
            }

			if (opts.showPallet) {
				drawPallet(palletLookup[realHex]);
			}
			
            callbacks.move(realColor);
        }
        
        initialize();
        
        var spect = {
            show: show,
            hide: hide,
            set: set,
            get: get
        };
        
        spect.id = spectrums.push(spect) - 1;
        
        return  spect;
    }
	
    /**
     * checkOffset - get the offset below/above and left/right element depending on screen position
     * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
     */
    function getOffset(picker, input) {
		var dpWidth = picker.outerWidth();
		var dpHeight = picker.outerHeight();
		var inputWidth = input.outerWidth();
		var inputHeight =  input.outerHeight();
		var doc = picker[0].ownerDocument;
		var viewWidth = doc.documentElement.clientWidth + $(doc).scrollLeft();
		var viewHeight = doc.documentElement.clientHeight + $(doc).scrollTop();
		var offset = input.offset();
		offset.top += inputHeight;
		
		offset.left -= 
			Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
			Math.abs(offset.left + dpWidth - viewWidth) : 0);
		
		offset.top -= 
			Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
			Math.abs(dpHeight + inputHeight) : 0);

		return offset;
	}
	
    /**
     * stopPropagation - makes the code only doing this a little easier to read in line
     */
    function stopPropagation(e) {
        e.stopPropagation();
    }
    
    /**
     * Create a function bound to a given object
     * Thanks to underscore.js
     */
    function bind (func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function() {
            return func.apply(obj, args.concat(slice.call(arguments)));
        }
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
                // Mouseup happened outside of window
                if (IE && !(document.documentMode >= 9) && !e.button) {
                    return stop();
                }
                
                var touches =  e.originalEvent.touches;
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
            var touches =  e.originalEvent.touches;
            
            if (!rightclick && !dragging) { 
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true; 
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();
                    
                    $(doc).bind(duringDragEvents);
                    
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
    if (hasjQuery) {
        $.fn.spectrum = function(opts, extra) {
            
            if (typeof opts == "string") {
                if (opts == "get") {
                    return spectrums[this.eq(0).data("spectrum.id")].get();
                }
                
                return this.each(function() {
                    var spect = spectrums[$(this).data("spectrum.id")];
                    if (opts == "show") { spect.show(); }
                    if (opts == "hide") { spect.hide(); }
                    if (opts == "set")  { spect.set(extra); }
                });
            }
            
            // Initializing a new one
            return this.each(function() {
                var spect = spectrum(this, opts);
                $(this).data("spectrum.id", spect.id);
            }); 
        };
    }
    
    window.spectrum = spectrum;

})(this, jQuery);
// TinyColor.js - https://github.com/bgrins/TinyColor - 2011 Brian Grinstead - v0.3.1
var tinycolor=function(){function r(a){var b={r:255,g:255,b:255},c=!1;if(typeof a=="string"){a=a.replace(s,"").replace(t,"").toLowerCase();m[a]&&(a=m[a]);for(var d=!1,e=0;e<n.length;e++){var f=n[e].re.exec(a);if(f){d=n[e].process(f);break}}a=d}if(typeof a=="object"){a.hasOwnProperty("r")&&a.hasOwnProperty("g")&&a.hasOwnProperty("b")&&(b={r:g(a.r,255)*255,g:g(a.g,255)*255,b:g(a.b,255)*255},c=!0);if(a.hasOwnProperty("h")&&a.hasOwnProperty("s")&&a.hasOwnProperty("v")){e=a.h;d=a.s;b=a.v;var h,i,k;e=g(e,
360);d=g(d,100);b=g(b,100);c=Math.floor(e*6);var j=e*6-c;e=b*(1-d);f=b*(1-j*d);d=b*(1-(1-j)*d);switch(c%6){case 0:h=b;i=d;k=e;break;case 1:h=f;i=b;k=e;break;case 2:h=e;i=b;k=d;break;case 3:h=e;i=f;k=b;break;case 4:h=d;i=e;k=b;break;case 5:h=b,i=e,k=f}b={r:h*255,g:i*255,b:k*255};c=!0}a.hasOwnProperty("h")&&a.hasOwnProperty("s")&&a.hasOwnProperty("l")&&(b=u(a.h,a.s,a.l),c=!0)}return{ok:c,r:Math.min(255,Math.max(b.r,0)),g:Math.min(255,Math.max(b.g,0)),b:Math.min(255,Math.max(b.b,0))}}function p(a,b,
c){a=g(a,255);b=g(b,255);c=g(c,255);var d=Math.max(a,b,c),e=Math.min(a,b,c),f,h=(d+e)/2;if(d==e)f=e=0;else{var i=d-e;e=h>0.5?i/(2-d-e):i/(d+e);switch(d){case a:f=(b-c)/i+(b<c?6:0);break;case b:f=(c-a)/i+2;break;case c:f=(a-b)/i+4}f/=6}return{h:f,s:e,l:h}}function u(a,b,c){function d(a,b,c){c<0&&(c+=1);c>1&&(c-=1);if(c<1/6)return a+(b-a)*6*c;if(c<0.5)return b;if(c<2/3)return a+(b-a)*(2/3-c)*6;return a}a=g(a,360);b=g(b,100);c=g(c,100);if(b==0)c=b=a=c;else{var e=c<0.5?c*(1+b):c+b-c*b,f=2*c-e;c=d(f,e,
a+1/3);b=d(f,e,a);a=d(f,e,a-1/3)}return{r:c*255,g:b*255,b:a*255}}function q(a,b,c){a=g(a,255);b=g(b,255);c=g(c,255);var d=Math.max(a,b,c),e=Math.min(a,b,c),f,h=d-e;if(d==e)f=0;else{switch(d){case a:f=(b-c)/h+(b<c?6:0);break;case b:f=(c-a)/h+2;break;case c:f=(a-b)/h+4}f/=6}return{h:f,s:d==0?0:h/d,v:d}}function o(a,b,c){function d(a){return a.length==1?"0"+a:a}return[d(j(a).toString(16)),d(j(b).toString(16)),d(j(c).toString(16))].join("")}function g(a,b){a=parseFloat(a);if(a==b)return 1;else if(a>1)return a%
b/parseFloat(b);return a}var l=function(a){if(typeof a=="object"&&a.hasOwnProperty("_tc_id"))return a;a=r(a);var b=a.r,c=a.g,d=a.b;return{ok:a.ok,_tc_id:v++,toHsv:function(){return q(b,c,d)},toHsvString:function(){var a=q(b,c,d);return"hsv("+Math.round(a.h*360)+", "+Math.round(a.s*100)+"%, "+Math.round(a.v*100)+"%)"},toHsl:function(){return p(b,c,d)},toHslString:function(){var a=p(b,c,d);return"hsl("+Math.round(a.h*360)+", "+Math.round(a.s*100)+"%, "+Math.round(a.l*100)+"%)"},toHex:function(){return o(b,
c,d)},toHexString:function(){return"#"+o(b,c,d)},toRgb:function(){return{r:j(b),g:j(c),b:j(d)}},toRgbString:function(){return"rgb("+j(b)+", "+j(c)+", "+j(d)+")"},toName:function(){return w[o(b,d,c)]||!1}}};l.version="0.3.1";l.equals=function(a,b){return l(a).toHex()==l(b).toHex()};var s=/^[\s,#]+/,t=/\s+$/,v=0,j=Math.round,m=l.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"00ffff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000000",blanchedalmond:"ffebcd",blue:"0000ff",
blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"00ffff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",
darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dodgerblue:"1e90ff",feldspar:"d19275",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"ff00ff",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",grey:"808080",green:"008000",greenyellow:"adff2f",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",
lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgrey:"d3d3d3",lightgreen:"90ee90",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslateblue:"8470ff",lightslategray:"778899",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"00ff00",limegreen:"32cd32",linen:"faf0e6",magenta:"ff00ff",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370d8",mediumseagreen:"3cb371",
mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"d87093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",
purple:"800080",red:"ff0000",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",violetred:"d02090",wheat:"f5deb3",white:"ffffff",whitesmoke:"f5f5f5",yellow:"ffff00",yellowgreen:"9acd32"},
w=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&(b[a[c]]=c);return b}(m),n=[{re:/rgb[\s|\(]+(\d{1,3})[,|\s]+(\d{1,3})[,|\s]+(\d{1,3})\s*\)?/,process:function(a){return{r:a[1],g:a[2],b:a[3]}}},{re:/hsl[\s|\(]+(\d{1,3})[,|\s]+(\d{1,3}%?)[,|\s]+(\d{1,3}%?)\s*\)?/,process:function(a){return{h:a[1],s:a[2],l:a[3]}}},{re:/hsv[\s|\(]+(\d{1,3})[,|\s]+(\d{1,3}%?)[,|\s]+(\d{1,3}%?)\s*\)?/,process:function(a){return{h:a[1],s:a[2],v:a[3]}}},{re:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,process:function(a){return{r:parseInt(a[1],
16),g:parseInt(a[2],16),b:parseInt(a[3],16)}}},{re:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,process:function(a){return{r:parseInt(a[1]+a[1],16),g:parseInt(a[2]+a[2],16),b:parseInt(a[3]+a[3],16)}}}];return l}();

