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
            for (var i = 1; i <= 6; i++) {
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
                                    "<div class='sp-dragger'></div>",
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
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            textInput = container.find(".sp-input"),
            palletContainer = container.find(".sp-pallet"),
            cancelButton = container.find(".sp-cancel"),
            chooseButton = container.find(".sp-choose"),
            isInput = boundElement.is("input"),
            changeOnMove = (opts.changeOnMove || flat),
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
    
    fnspectrum.load = true;
    fnspectrum.loadOpts = { };
    
    $(function() {
    	if (fnspectrum.load) {
    		$("input[type=spectrum]").spectrum(fnspectrum.loadOpts);
    	}
    });
    
})(this, jQuery);


// TinyColor.js - https://github.com/bgrins/TinyColor - 2011 Brian Grinstead - v0.4.3
(function(t){function w(b){var a={r:255,g:255,b:255},c=1,n=!1;typeof b=="string"&&(b=x(b));if(typeof b=="object"){if(b.hasOwnProperty("r")&&b.hasOwnProperty("g")&&b.hasOwnProperty("b"))a={r:h(b.r,255)*255,g:h(b.g,255)*255,b:h(b.b,255)*255},n=!0;else if(b.hasOwnProperty("h")&&b.hasOwnProperty("s")&&b.hasOwnProperty("v")){var d=b.h,f=b.s;a=b.v;var k,i,o;d=h(d,360);f=h(f,100);a=h(a,100);n=p.floor(d*6);var e=d*6-n;d=a*(1-f);var j=a*(1-e*f);f=a*(1-(1-e)*f);switch(n%6){case 0:k=a;i=f;o=d;break;case 1:k=
j;i=a;o=d;break;case 2:k=d;i=a;o=f;break;case 3:k=d;i=j;o=a;break;case 4:k=f;i=d;o=a;break;case 5:k=a,i=d,o=j}a={r:k*255,g:i*255,b:o*255};n=!0}else b.hasOwnProperty("h")&&b.hasOwnProperty("s")&&b.hasOwnProperty("l")&&(a=y(b.h,b.s,b.l),n=!0);b.hasOwnProperty("a")&&(c=h(b.a,1))}return{ok:n,r:l(255,m(a.r,0)),g:l(255,m(a.g,0)),b:l(255,m(a.b,0)),a:c}}function u(b,a,c){b=h(b,255);a=h(a,255);c=h(c,255);var d=m(b,a,c),g=l(b,a,c),f,k=(d+g)/2;if(d==g)f=g=0;else{var i=d-g;g=k>0.5?i/(2-d-g):i/(d+g);switch(d){case b:f=
(a-c)/i+(a<c?6:0);break;case a:f=(c-b)/i+2;break;case c:f=(b-a)/i+4}f/=6}return{h:f,s:g,l:k}}function y(b,a,c){function d(a,b,c){c<0&&(c+=1);c>1&&(c-=1);if(c<1/6)return a+(b-a)*6*c;if(c<0.5)return b;if(c<2/3)return a+(b-a)*(2/3-c)*6;return a}b=h(b,360);a=h(a,100);c=h(c,100);if(a==0)c=a=b=c;else{var g=c<0.5?c*(1+a):c+a-c*a,f=2*c-g;c=d(f,g,b+1/3);a=d(f,g,b);b=d(f,g,b-1/3)}return{r:c*255,g:a*255,b:b*255}}function v(b,a,c){b=h(b,255);a=h(a,255);c=h(c,255);var d=m(b,a,c),g=l(b,a,c),f,e=d-g;if(d==g)f=0;
else{switch(d){case b:f=(a-c)/e+(a<c?6:0);break;case a:f=(c-b)/e+2;break;case c:f=(b-a)/e+4}f/=6}return{h:f,s:d==0?0:e/d,v:d}}function q(b,a,c){function d(a){return a.length==1?"0"+a:a}return[d(e(b).toString(16)),d(e(a).toString(16)),d(e(c).toString(16))].join("")}function h(b,a){typeof b=="string"&&b.indexOf(".")!=-1&&r(b)===1&&(b="100%");var c=typeof b==="string"&&b.indexOf("%")!=-1;b=l(a,m(0,r(b)));c&&(b*=a/100);if(p.abs(b-a)<1.0E-6)return 1;else if(b>=1)return b%a/r(a);return b}function x(b){b=
b.replace(z,"").replace(A,"").toLowerCase();s[b]&&(b=s[b]);if(b=="transparent")return{r:0,g:0,b:0,a:0};var a;if(a=j.rgb.exec(b))return{r:a[1],g:a[2],b:a[3]};if(a=j.rgba.exec(b))return{r:a[1],g:a[2],b:a[3],a:a[4]};if(a=j.hsl.exec(b))return{h:a[1],s:a[2],l:a[3]};if(a=j.hsla.exec(b))return{h:a[1],s:a[2],l:a[3],a:a[4]};if(a=j.hsv.exec(b))return{h:a[1],s:a[2],v:a[3]};if(a=j.hex6.exec(b))return{r:parseInt(a[1],16),g:parseInt(a[2],16),b:parseInt(a[3],16)};if(a=j.hex3.exec(b))return{r:parseInt(a[1]+""+a[1],
16),g:parseInt(a[2]+""+a[2],16),b:parseInt(a[3]+""+a[3],16)};return!1}var d=function(b,a){if(typeof b=="object"&&b.hasOwnProperty("_tc_id"))return b;if(typeof b=="object"&&(!a||!a.skipRatio))for(var c in b)b[c]===1&&(b[c]="1.0");c=w(b);var d=c.r,g=c.g,f=c.b,h=c.a;d<1&&(d=e(d));g<1&&(g=e(g));f<1&&(f=e(f));return{ok:c.ok,_tc_id:B++,alpha:h,toHsv:function(){return v(d,g,f)},toHsvString:function(){var a=v(d,g,f),b=e(a.h*360),c=e(a.s*100);a=e(a.v*100);return"hsv("+b+", "+c+"%, "+a+"%)"},toHsl:function(){return u(d,
g,f)},toHslString:function(){var a=u(d,g,f),b=e(a.h*360),c=e(a.s*100);a=e(a.l*100);return h==1?"hsl("+b+", "+c+"%, "+a+"%)":"hsla("+b+", "+c+"%, "+a+"%, "+h+")"},toHex:function(){return q(d,g,f)},toHexString:function(){return"#"+q(d,g,f)},toRgb:function(){return{r:e(d),g:e(g),b:e(f)}},toRgbString:function(){return h==1?"rgb("+e(d)+", "+e(g)+", "+e(f)+")":"rgba("+e(d)+", "+e(g)+", "+e(f)+", "+h+")"},toName:function(){return C[q(d,f,g)]||!1}}};d.version="0.4.3";var z=/^[\s,#]+/,A=/\s+$/,B=0,p=Math,
e=p.round,l=p.min,m=p.max,r=t.parseFloat;d.equals=function(b,a){return d(b).toHex()==d(a).toHex()};d.desaturate=function(b,a){var c=d(b).toHsl();c.s-=(a||10)/100;c.s=l(1,m(0,c.s));return d(c)};d.saturate=function(b,a){var c=d(b).toHsl();c.s+=(a||10)/100;c.s=l(1,m(0,c.s));return d(c)};d.greyscale=function(b){return d.desaturate(b,100)};d.lighten=function(b,a){var c=d(b).toHsl();c.l+=(a||10)/100;c.l=l(1,m(0,c.l));return d(c)};d.darken=function(b,a){var c=d(b).toHsl();c.l-=(a||10)/100;c.l=l(1,m(0,c.l));
return d(c)};d.complement=function(b){b=d(b).toHsl();b.h=(b.h+0.5)%1;return d(b)};d.triad=function(b){var a=d(b).toHsl(),c=a.h*360;return[d(b),d({h:(c+120)%360,s:a.s,l:a.l}),d({h:(c+240)%360,s:a.s,l:a.l})]};d.tetrad=function(b){var a=d(b).toHsl(),c=a.h*360;return[d(b),d({h:(c+90)%360,s:a.s,l:a.l}),d({h:(c+180)%360,s:a.s,l:a.l}),d({h:(c+270)%360,s:a.s,l:a.l})]};d.splitcomplement=function(b){var a=d(b).toHsl(),c=a.h*360;return[d(b),d({h:(c+72)%360,s:a.s,l:a.l}),d({h:(c+216)%360,s:a.s,l:a.l})]};d.analogous=
function(b,a,c){a=a||6;c=c||30;var e=d(b).toHsl();c=360/c;b=[d(b)];e.h*=360;for(e.h=(e.h-(c*a>>1)+720)%360;--a;)e.h=(e.h+c)%360,b.push(d(e));return b};d.monochromatic=function(b,a){a=a||6;var c=d(b).toHsv(),e=c.h,g=c.s;c=c.v;for(var f=[];a--;)f.push(d({h:e,s:g,v:c})),c=(c+0.2)%1;return f};d.readable=function(b,a){var c=d(b).toRgb(),e=d(a).toRgb();return(e.r-c.r)*(e.r-c.r)+(e.g-c.g)*(e.g-c.g)+(e.b-c.b)*(e.b-c.b)>10404};var s=d.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",
azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",
darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",
hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",
linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",
paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",
tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},C=function(b){var a={},c;for(c in b)b.hasOwnProperty(c)&&(a[b[c]]=c);return a}(s),j={rgb:RegExp("rgb[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),rgba:RegExp("rgba[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
hsl:RegExp("hsl[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),hsla:RegExp("hsla[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),hsv:RegExp("hsv[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/};t.tinycolor=d})(this);

