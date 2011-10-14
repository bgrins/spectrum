var WebInspector = { };

WebInspector.Spectrum = function(swatch, rgb)
{
    this.document = swatch.ownerDocument;
    this.swatch = swatch;
    this.element = this.document.createElement('div');
    this.element.className = "sp-container";
    this.element.innerHTML = WebInspector.Spectrum.markup;
    this.element.addEventListener("click", WebInspector.Spectrum.stopPropagation, false);
    
    this.swatchInner = this.document.createElement('span');
    this.swatchInner.className = 'swatch-inner';
    this.swatch.appendChild(this.swatchInner);
    this.swatch.parentNode.insertBefore( this.element, swatch.nextSibling );
    
    this.slider = this.element.querySelectorAll(".sp-hue")[0];
    this.slideHelper = this.element.querySelectorAll(".sp-slider")[0];
    this.dragger = this.element.querySelectorAll(".sp-color")[0];
    this.dragHelper = this.element.querySelectorAll(".sp-dragger")[0];
    this.rangeSlider = this.element.querySelectorAll(".sp-range")[0];
    
    WebInspector.Spectrum.draggable(this.slider, hueDrag.bind(this));
    WebInspector.Spectrum.draggable(this.dragger, colorDrag.bind(this));
    this.rangeSlider.addEventListener("change", alphaDrag.bind(this), false);
    
    if (rgb) {
        this.rgb = rgb;
        this.updateUI();
    }
    
    function hueDrag(dragX, dragY) {
        this.hsv[0] = (dragY / this.slideHeight);
        
        this.updateUI();
        this.onchange();  
    }
    
    function colorDrag(dragX, dragY) {
        this.hsv[1] = dragX / this.dragWidth;
        this.hsv[2] = (this.dragHeight - dragY) / this.dragHeight;
        
        this.updateUI();
        this.onchange();
    }
    
    function alphaDrag() {
        this.hsv[3] = this.rangeSlider.value / 100;
        
        this.updateUI();
        this.onchange();
    }
}

WebInspector.Spectrum.markup = [
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

WebInspector.Spectrum.hsvToRgb = function(h, s, v, a) {

    var r, g, b;
    
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    
    switch(i % 6) {
    case 0: 
        r = v, g = t, b = p; 
        break;
    case 1: 
        r = q, g = v, b = p; 
        break;
    case 2: 
        r = p, g = v, b = t; 
        break;
    case 3: 
        r = p, g = q, b = v; 
        break;
    case 4: 
        r = t, g = p, b = v; 
        break;
    case 5: 
        r = v, g = p, b = q; 
        break;
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
        // achromatic
        h = 0; 
    }
    else {
        switch(max) {
        case r: 
            h = (g - b) / d + (g < b ? 6 : 0); 
            break;
        case g: 
            h = (b - r) / d + 2; 
            break;
        case b: 
            h = (r - g) / d + 4; 
            break;
        }
        h /= 6;
    }
    return [h, s, v, a];
};

WebInspector.Spectrum.stopPropagation = function(e) {
    e.stopPropagation();
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
    
    var duringDragEvents = { };
    duringDragEvents["selectstart"] = prevent;
    duringDragEvents["dragstart"] = prevent;
    duringDragEvents["mousemove"] = move;
    duringDragEvents["mouseup"] = stop;

    function prevent(e) {
        if (e.stopPropagation)
            e.stopPropagation();
        
        if (e.preventDefault)
            e.preventDefault();
            
        e.returnValue = false;
    }
    
    function move(e) {
        if (dragging) {
            
            var dragX = Math.max(0, Math.min(e.pageX - offset.left, maxWidth));
            var dragY = Math.max(0, Math.min(e.pageY - offset.top, maxHeight));
            
            onmove.apply(element, [dragX, dragY]); 
        } 
    }
    
    function start(e) { 
        var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
        
        if (!rightclick && !dragging) { 
            if (onstart.apply(element, arguments) !== false) {
                dragging = true; 
                maxHeight = element.clientHeight;
                maxWidth = element.clientWidth;
                
                offset = WebInspector.Spectrum.getOffset(element);
                
                WebInspector.Spectrum.addEvent(doc, duringDragEvents);
                
                prevent(e);
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
    
    WebInspector.Spectrum.addEvent(element, "mousedown", start);
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
        
        this.dragHelper.positionAt(dragX, dragY);
        
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
        
        this.dragger.style.backgroundColor = flatColor;
        this.swatchInner.style.backgroundColor = fullColor;
        
        this.rangeSlider.value = this.hsv[3] * 100;
    },
    
    toggle: function(e) {
        if (this.element.hasStyleClass('sp-show')) 
            this.hide(e);
        else
            this.show(e);
    },
    
    show: function(e) {
    
        if (e) 
            e.stopPropagation();
        
        this.element.addStyleClass('sp-show');
        this.swatch.addStyleClass('swatch-active');
        this.element.positionAt(this.swatch.offsetLeft, this.swatch.offsetTop + this.swatch.clientHeight);
        
        this.slideHeight = this.slider.offsetHeight;
        this.dragWidth = this.dragger.offsetWidth;
        this.dragHeight = this.dragger.offsetHeight;
        this.dragHelperHeight = this.dragHelper.clientHeight;
        this.slideHelperHeight = this.slideHelper.clientHeight;
        
        this.document.addEventListener("click", this.hide.bind(this), false);
        
        this.updateUI();
    },
    
    hide: function(e) {
        
        if (e) 
            e.stopPropagation();
        
        this.element.removeStyleClass('sp-show');
        this.swatch.removeStyleClass('swatch-active');
    },
    
    addChangeListener: function(listener) {
        this._onchange = listener;
    }
    
};





/* Remove prototypes once moved into WebInspector project (these are pulled from utilities.js) */

Function.prototype.bind = function(thisObject)
{
    var func = this;
    var args = Array.prototype.slice.call(arguments, 1);
    function bound()
    {
        return func.apply(thisObject, args.concat(Array.prototype.slice.call(arguments, 0)));
    }
    bound.toString = function() {
        return "bound: " + func;
    };
    return bound;
}
Element.prototype.removeStyleClass = function(className)
{
    this.classList.remove(className);
}
Element.prototype.addStyleClass = function(className)
{
    this.classList.add(className);
}

Element.prototype.hasStyleClass = function(className)
{
    return this.classList.contains(className);
}

Element.prototype.positionAt = function(x, y)
{
    this.style.left = x + "px";
    this.style.top = y + "px";
}

