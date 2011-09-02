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
            offsetX = 0,
            offsetY = 0,
			dragWidth = 0,
            dragHeight = 0,
			slideHeight = 0,
			slideWidth = 0,
			currentX = 0,
			currentY = 0,
			currentHue = 0;
        
		var el;
		if ($(element).is("input")) {
			el = $(replaceInput);
			$(element).hide().after(el);
		}
		else {
			el = $(element);
		}
		
		el.addClass("spectrum-element");
		
        /* Public API */
        el.bind("spectrum.show", function() {
			if (visible) { return; }
			visible = true;
			
			$(doc).bind("click", docClick);

			var elOffset = el.offset();
			elOffset.left += el.width();
            container.show().offset(elOffset);
            var off = dragger.offset();  
            offsetX = off.left;
            offsetY = off.top;
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
        });
		
        el.bind("spectrum.hide", function() {
			if (!visible) { return; }
			visible = false;
			
			$(doc).unbind("click", docClick);
            container.hide();    
        });
		
        el.bind("spectrum.set", function(e, c) {
            dragger.css("background-color", c);
			if (true) {
			
			}
        });
		
		el.click(function(e) {
			$(this).trigger(visible ? "spectrum.hide" : "spectrum.show");
			e.stopPropagation();
		});
        
        /* DOM event handlers */
		
		function docClick() {
			el.trigger("spectrum.hide");
		}
		
		function move() {
			var h = getCurrentHue();
			var s = getCurrentSaturation();
            var v = getCurrentValue();
			
            var c = hsv2rgb(h, s, v);
			
			$("#console").css('background-color', c.hex);
		}
		
		// Don't let click event go up to document
		container.bind("click", function(e) {
			e.stopPropagation();
		});
		
		draggable(slider, slide);
		draggable(dragger, drag);
        
        function drag(e) {
            var h = dragHelper.height();
			currentX = e.dragX;
			currentY = e.dragY;
			
            dragHelper.css({
                "top": currentY - (h / 2),
                "left": currentX - (h / 2)
            });
			
            $("#console").text(currentX + " " + currentY);
			move();
        }
		
        function slide(e) {
            var h = slideHelper.height();
			currentHue = e.dragY;
            
            slideHelper.css({
                "top": currentHue - (h / 2)
            });
			
			var c = hsv2rgb(getCurrentHue(), 1, 1);
			dragger.css("background-color", c.hex);
			move();
        }
		
		function getCurrentSaturation() {
			return currentX / dragWidth;
		}
		function getCurrentValue() {
			return (dragHeight - currentY) / dragHeight
		}
		function getCurrentHue() {
			return (currentHue / slideHeight) * 360;
		}
        
        $(body).append(container.hide());
		
		if (opts.flat) {
			el.trigger("spectrum.show");
		}
        el.trigger("spectrum.set", opts.color);
    }
	
    $.fn.spectrum = function(opts) {
        return this.each(function() {
            spectrum(this, opts);
        }); 
    };
	
	
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
			if (e.button == 0 && !dragging) { 
				maxHeight = $(element).height();
				maxWidth = $(element).width();
				offset = $(element).offset();
				$(doc).bind({ 
					"mouseup": stop,
					"mousemove": move
				});
				onstart.apply(element, arguments); 
			} 
			dragging = true; 
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
    
    window.spectrum = spectrum;

})();


