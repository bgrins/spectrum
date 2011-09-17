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
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,
        showPallet: false,
        maxPalletSize: 12,
        theme: 'sp-dark',
        pallet: ['fff', '000']
    },
    spectrums = [],
    trimLeft = /^[\s,#]+/,
    trimRight = /\s+$/,
    IE = $.browser.msie,
    replaceInput = [
    	"<div class='sp-replacer sp-cf'>",
    		"<div class='sp-preview'></div>",
    		"<div class='sp-dd'>&#9660;</div>",
    	"</div>"
    ].join(''),
    markup = (function() {
        
        // IE does not support gradients with multiple stops, so we need to simulate            
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i < 9; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }
        
        return [
            "<div class='sp-container'>",
                "<div class='sp-top sp-cf'>",
                    "<div class='sp-fill'></div>",
                    "<div class='sp-top-inner'>",
                        "<div class='sp-color'>",
                            "<div class='sp-sat'>",
                                "<div class='sp-val'>",
                                    "<div class='sp-drag-helper'></div>",
                                "</div>",
                            "</div>",
                        "</div>",
                        "<div class='sp-hue'>",
                            "<div class='sp-slider'></div>",
                            gradientFix,
                        "</div>",
                    "</div>",
                "</div>",
                "<div class='sp-pallet sp-cf'></div>",
                "<div class='sp-input-container sp-cf'>",
                    "<input class='sp-input' type='text' spellcheck='false'  />",
                    "<div>",
                        "<button class='sp-cancel sp-hide-small'>Cancel</button>",
                        "<button class='sp-choose sp-hide-small'>Choose</button>",
                        "<button class='sp-cancel sp-show-small'>X</button>",
                        "<button class='sp-choose sp-show-small'>✔</button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })(),
    palletTemplate = function(p, active) {
    	var html = [];
    	for (var i = 0; i < p.length; i++) {
    		var c = i == active ? " class='sp-pallet-active' " : "";
    		html.push('<span style="background-color:' + tinycolor(p[i]).toHexString() + ';"' + c + '></span>');
    	}
    	return html.join('');
    };
    
    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            spectrums[i].hide();
        }
    }
    function instanceOptions(o, callbackContext) {
        var opts = $.extend({ }, defaultOpts, o);
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
            flat = opts.flat,
            showPallet = opts.showPallet,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
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
            draggingClass = "sp-dragging",
            palletLookup = { };
        
        var doc = element.ownerDocument,
            body = doc.body, 
            boundElement = $(element),
        	container = $(markup, doc).addClass(theme),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-drag-helper"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            textInput = container.find(".sp-input"),
            palletContainer = container.find(".sp-pallet"),
            cancelButton = container.find(".sp-cancel"),
            chooseButton = container.find(".sp-choose"),
            isInput = boundElement.is("input"),
            changeOnMove = isInput && (opts.changeOnMove || flat),
            shouldReplace = isInput && !flat,
            replacer = (shouldReplace) ? $(replaceInput).addClass(theme) : $([]),
            offsetElement = (shouldReplace) ? replacer : boundElement,
            previewElement = replacer.find(".sp-preview"),
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            hasOpened = false;

		function initialize() {
			
    	    if (IE) {
    	        container.find("*:not(input)").attr("unselectable", "on");
    	    }   
    	    
    	    container.toggleClass("sp-flat", flat);
    	    container.toggleClass("sp-input-disabled", !opts.showInput);
    	    container.toggleClass("sp-pallet-disabled", !showPallet);
    	    
    	    if (shouldReplace) {
    	        boundElement.hide().after(replacer);
    	    }
    	    
        	if (flat) {
            	boundElement.after(container).hide();
            }
        	else {
        	    $(body).append(container.hide());
        	}
    	    
    	    offsetElement.bind("click touchstart", function(e) {
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

            cancelButton.click(function() {
                cancel();
                hide();
            });
            chooseButton.click(function() {
                hide();
            });
    	    draggable(slider, function(dragX, dragY) {
    	        currentHue = (dragY / slideHeight);
    	        updateUI();
                callbacks.move(get());
    	    }, dragStart, dragStop);
    	    
    	    draggable(dragger, function(dragX, dragY) {
    	        currentSaturation = dragX / dragWidth;
    	        currentValue = (dragHeight -     dragY) / dragHeight;
    	        updateUI();
                callbacks.move(get());
    	    }, dragStart, dragStop);
    	    
        	if (!!initialColor) {
        	    set(initialColor);
        	    pallet.push(initialColor);
        	}
        	
        	setPallet(pallet);
        	
        	if (flat) {
        	    show();
        	}
        	
        	palletContainer.delegate("span", "click", function() {
        		set($(this).css("background-color"));
        	});
		}
		
		function setPallet(p) {
        	if (showPallet) {
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
		function dragStart() {
		  container.addClass(draggingClass);
		}
		function dragStop() {
		  container.removeClass(draggingClass);
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
            
            if (!hasOpened) {
            	hasOpened = true;
            }
            
            hideAll();
            
            visible = true;
            
            $(doc).bind("click touchstart", hide);
            $(window).bind("resize", resize);
            replacer.addClass("sp-active");
            container.show();
            
            reflow();
            updateUI();
            
            colorOnShow = get();
            callbacks.show(get())
        }
        
        function cancel() {
            set(colorOnShow);
        }
        
        function hide() {
            if (!visible || flat) { return; }
            visible = false;
            
            $(doc).unbind("click touchstart", hide);
            $(window).unbind("resize", resize);
            
           	replacer.removeClass("sp-active");
            container.hide();
            
            var realColor = get();
            
            // Update the pallet with the current color
        	pallet.push(realColor.toHexString());
        	setPallet(pallet);
        	
        	if (!changeOnMove) {
            	updateOriginalInput();
        	}
        	
            callbacks.hide(realColor);
        }
        
        function set(color) {
            var newColor = tinycolor(color);
            var newHsv = newColor.toHsv();
            
            currentHue = newHsv.h;
            currentSaturation = newHsv.s;
            currentValue = newHsv.v;
            
            updateUI();
        }
        
        function get() {
            return tinycolor({ h: currentHue, s: currentSaturation, v: currentValue });
        }
        
        function updateUI() {
        
            updateHelperLocations();
            
            // Update dragger background color ("flat" because gradients take care of saturation
            // and value).
            var flatColor = tinycolor({ h: currentHue, s: "1.0", v: "1.0"});
            dragger.css("background-color", flatColor.toHexString());
            
            var realColor = get(),
            	realHex = realColor.toHexString();
            
            // Update the replaced elements background color (with actual selected color)
            previewElement.css("background-color", realHex);
            
            // Update the input as it changes happen
            if (isInput) {
                textInput.val(realHex);
            }
            
            if (hasOpened && changeOnMove) {
            	updateOriginalInput();
            }

			if (showPallet) {
				drawPallet(palletLookup[realHex]);
			}
        }
        
        function updateHelperLocations() {
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
        
        }
        
        function updateOriginalInput() {
            var color = get();
        	if (isInput) {
        		boundElement.val(color.toHexString());
        	}
        	
        	callbacks.change(color);
        }
        
        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHelperHeight = slideHelper.height();
            
            if (!flat) {
            	container.offset(getOffset(container, offsetElement));
            }
            
            updateHelperLocations();
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
        var extraY = 6;
		var dpWidth = picker.outerWidth();
		var dpHeight = picker.outerHeight();
		var inputWidth = input.outerWidth();
		var inputHeight =  input.outerHeight();
		var doc = picker[0].ownerDocument;
		var docElem = doc.documentElement;
		var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
		var viewHeight = docElem.clientHeight + $(doc).scrollTop();
		var offset = input.offset();
		offset.top += inputHeight;
		
		offset.left -= 
			Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
			Math.abs(offset.left + dpWidth - viewWidth) : 0);
		
		offset.top -= 
			Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
			Math.abs(dpHeight + inputHeight - extraY) : extraY)  );

        
		return offset;
	}
	
	/** 
	 * noop - do nothing
	 */
    function noop() { 
    
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
    
    function throttle(func, wait, debounce) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          var throttler = function() {
            timeout = null;
            func.apply(context, args);
          };
          if (debounce) clearTimeout(timeout);
          if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }
    
    
    /**
     * Define a jQuery plugin
     */
    var dataID = "spectrum.id";
    var fnspectrum = $.fn.spectrum = function(opts, extra) {
        if (typeof opts == "string") {
            if (opts == "get") {
                return spectrums[this.eq(0).data(dataID)].get();
            }
            
            return this.each(function() {
                var spect = spectrums[$(this).data(dataID)];
                if (opts == "show") { spect.show(); }
                if (opts == "hide") { spect.hide(); }
                if (opts == "set")  { spect.set(extra); }
            });
        }
        
        // Initializing a new one
        return this.each(function() {
            var spect = spectrum(this, opts);
            $(this).data(dataID, spect.id);
        }); 
    };
    
    fnspectrum.processOnLoad = true;
    fnspectrum.processOnLoadOpts = { };
    
    $(function() {
    	if (fnspectrum.processOnLoad) {
    		$("input[type=spectrum]").spectrum(fnspectrum.processOnLoadOpts);
    	}
    });
    
})(this, jQuery);

// TinyColor.js - https://github.com/bgrins/TinyColor - 2011 Brian Grinstead - v0.4.3
var tinycolor=function(){function v(a){var b={r:255,g:255,b:255},c=1,f=!1;typeof a=="string"&&(a=w(a));if(typeof a=="object"){if(a.hasOwnProperty("r")&&a.hasOwnProperty("g")&&a.hasOwnProperty("b"))b={r:h(a.r,255)*255,g:h(a.g,255)*255,b:h(a.b,255)*255},f=!0;else if(a.hasOwnProperty("h")&&a.hasOwnProperty("s")&&a.hasOwnProperty("v")){var d=a.h,e=a.s;b=a.v;var l,j,o;d=h(d,360);e=h(e,100);b=h(b,100);f=p.floor(d*6);var g=d*6-f;d=b*(1-e);var k=b*(1-g*e);e=b*(1-(1-g)*e);switch(f%6){case 0:l=b;j=e;o=d;break;
case 1:l=k;j=b;o=d;break;case 2:l=d;j=b;o=e;break;case 3:l=d;j=k;o=b;break;case 4:l=e;j=d;o=b;break;case 5:l=b,j=d,o=k}b={r:l*255,g:j*255,b:o*255};f=!0}else a.hasOwnProperty("h")&&a.hasOwnProperty("s")&&a.hasOwnProperty("l")&&(b=x(a.h,a.s,a.l),f=!0);a.hasOwnProperty("a")&&(c=h(a.a,1))}return{ok:f,r:m(255,n(b.r,0)),g:m(255,n(b.g,0)),b:m(255,n(b.b,0)),a:c}}function t(a,b,c){a=h(a,255);b=h(b,255);c=h(c,255);var f=n(a,b,c),d=m(a,b,c),e,l=(f+d)/2;if(f==d)e=d=0;else{var j=f-d;d=l>0.5?j/(2-f-d):j/(f+d);
switch(f){case a:e=(b-c)/j+(b<c?6:0);break;case b:e=(c-a)/j+2;break;case c:e=(a-b)/j+4}e/=6}return{h:e,s:d,l:l}}function x(a,b,c){function d(a,b,c){c<0&&(c+=1);c>1&&(c-=1);if(c<1/6)return a+(b-a)*6*c;if(c<0.5)return b;if(c<2/3)return a+(b-a)*(2/3-c)*6;return a}a=h(a,360);b=h(b,100);c=h(c,100);if(b==0)c=b=a=c;else{var i=c<0.5?c*(1+b):c+b-c*b,e=2*c-i;c=d(e,i,a+1/3);b=d(e,i,a);a=d(e,i,a-1/3)}return{r:c*255,g:b*255,b:a*255}}function u(a,b,c){a=h(a,255);b=h(b,255);c=h(c,255);var d=n(a,b,c),i=m(a,b,c),
e,g=d-i;if(d==i)e=0;else{switch(d){case a:e=(b-c)/g+(b<c?6:0);break;case b:e=(c-a)/g+2;break;case c:e=(a-b)/g+4}e/=6}return{h:e,s:d==0?0:g/d,v:d}}function q(a,b,c){function d(a){return a.length==1?"0"+a:a}return[d(g(a).toString(16)),d(g(b).toString(16)),d(g(c).toString(16))].join("")}function h(a,b){typeof a=="string"&&a.indexOf(".")!=-1&&r(a)===1&&(a="100%");var c=typeof a==="string"&&a.indexOf("%")!=-1;a=m(b,n(0,r(a)));c&&(a*=b/100);if(p.abs(a-b)<1.0E-6)return 1;else if(a>=1)return a%b/r(b);return a}
function w(a){a=a.replace(y,"").replace(z,"").toLowerCase();s[a]&&(a=s[a]);if(a=="transparent")return{r:0,g:0,b:0,a:0};var b;if(b=k.rgb.exec(a))return{r:b[1],g:b[2],b:b[3]};if(b=k.rgba.exec(a))return{r:b[1],g:b[2],b:b[3],a:b[4]};if(b=k.hsl.exec(a))return{h:b[1],s:b[2],l:b[3]};if(b=k.hsla.exec(a))return{h:b[1],s:b[2],l:b[3],a:b[4]};if(b=k.hsv.exec(a))return{h:b[1],s:b[2],v:b[3]};if(b=k.hex6.exec(a))return{r:parseInt(b[1],16),g:parseInt(b[2],16),b:parseInt(b[3],16)};if(b=k.hex3.exec(a))return{r:parseInt(b[1]+
""+b[1],16),g:parseInt(b[2]+""+b[2],16),b:parseInt(b[3]+""+b[3],16)};return!1}var d=function(a,b){if(typeof a=="object"&&a.hasOwnProperty("_tc_id"))return a;if(typeof a=="object"&&(!b||!b.skipRatio))for(var c in a)a[c]===1&&(a[c]="1.0");c=v(a);var d=c.r,i=c.g,e=c.b,h=c.a;return{ok:c.ok,_tc_id:A++,alpha:h,toHsv:function(){return u(d,i,e)},toHsvString:function(){var a=u(d,i,e),b=g(a.h*360),c=g(a.s*100);a=g(a.v*100);return"hsv("+b+", "+c+"%, "+a+"%)"},toHsl:function(){return t(d,i,e)},toHslString:function(){var a=
t(d,i,e),b=g(a.h*360),c=g(a.s*100);a=g(a.l*100);return h==1?"hsl("+b+", "+c+"%, "+a+"%)":"hsla("+b+", "+c+"%, "+a+"%, "+h+")"},toHex:function(){return q(d,i,e)},toHexString:function(){return"#"+q(d,i,e)},toRgb:function(){return{r:g(d),g:g(i),b:g(e)}},toRgbString:function(){return h==1?"rgb("+g(d)+", "+g(i)+", "+g(e)+")":"rgba("+g(d)+", "+g(i)+", "+g(e)+", "+h+")"},toName:function(){return B[q(d,e,i)]||!1}}};d.version="0.4.3";var y=/^[\s,#]+/,z=/\s+$/,A=0,p=Math,g=p.round,m=p.min,n=p.max,r=parseFloat;
d.equals=function(a,b){return d(a).toHex()==d(b).toHex()};d.desaturate=function(a,b){var c=d(a).toHsl();c.s-=(b||10)/100;c.s=m(1,n(0,c.s));return d(c)};d.saturate=function(a,b){var c=d(a).toHsl();c.s+=(b||10)/100;c.s=m(1,n(0,c.s));return d(c)};d.greyscale=function(a){return d.desaturate(a,100)};d.lighten=function(a,b){var c=d(a).toHsl();c.l+=(b||10)/100;c.l=m(1,n(0,c.l));return d(c)};d.darken=function(a,b){var c=d(a).toHsl();c.l-=(b||10)/100;c.l=m(1,n(0,c.l));return d(c)};d.triad=function(a){return d.tetrad(a).slice(0,
3)};d.tetrad=function(a){a=d(a).toRgb();return[d({r:a.r,g:a.g,b:a.b}),d({r:a.b,g:a.r,b:a.g}),d({r:a.g,g:a.b,b:a.r}),d({r:a.r,g:a.b,b:a.r})]};d.splitcomplement=function(a){var b=d(a).toHsv({expand:!0}),c=b.h*360;return[d(a),d({h:(c+72)%360,s:b.s,v:b.v}),d({h:(c+216)%360,s:b.s,v:b.v})]};d.analogous=function(a,b,c){b=b||6;c=c||30;var f=d(a).toHsv();c=360/c;a=[d(a)];f.h*=360;for(f.h=(f.h-(c*b>>1)+720)%360;--b;)f.h=(f.h+c)%360,a.push(d(f));return a};d.monochromatic=function(a,b){b=b||6;for(var c=d(a).toHsv(),
f=[];b--;)f.push(d(c)),c.v+=0.2,c.v%=1;return f};d.readable=function(a,b){var c=d(a).toRgb(),f=d(b).toRgb();return(f.r-c.r)*(f.r-c.r)+(f.g-c.g)*(f.g-c.g)+(f.b-c.b)*(f.b-c.b)>10404};var s=d.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",
cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",
dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",
lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",
midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",
sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},B=function(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&(b[a[c]]=c);return b}(s),k={rgb:RegExp("rgb[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
rgba:RegExp("rgba[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),hsl:RegExp("hsl[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),hsla:RegExp("hsla[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
hsv:RegExp("hsv[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/};return d}();

