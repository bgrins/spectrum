// Spectrum Colorpicker v1.9.0 ??
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// ++ with more features added by danicotra
// License: MIT

(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) { // AMD
        define(['jquery'], factory);
    }
    else if (typeof exports == "object" && typeof module == "object") { // CommonJS
        module.exports = factory(require('jquery'));
    }
    else { // Browser
        factory(jQuery);
    }
})(function($, undefined) {
    "use strict";

    var defaultOpts = {

        // Callbacks
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,

        // Options
        color: false,
        flat: false,
        showInput: false,
        allowEmpty: false,
        showButtons: true,
        clickoutFiresChange: true,
        showInitial: false,
        showPalette: false,
        showPaletteOnly: false,
        hideAfterPaletteSelect: false,
        togglePaletteOnly: false,
        showSelectionPalette: true,
        localStorageKey: false,
        appendTo: "body",
        maxSelectionSize: 7,

        maxPaletteRowElements: 6,

        cancelText: "cancel",
        chooseText: "choose",
        togglePaletteMoreText: "more",
        togglePaletteLessText: "less",
        clearText: "Clear Color Selection",
        noColorSelectedText: "No Color Selected",
        preferredFormat: false,
        className: "", // Deprecated - use containerClassName and replacerClassName instead.
        containerClassName: "",
        replacerClassName: "",

        clearFilteredPaletteText: "clear unfiltered",

        showRGBsliders: false,
        showRGBApickers: false,
        aPickerScale: 100,

        showAlpha: false,

        showRGBmodes: false,

        theme: "sp-light",
        palette: [["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]],
        selectionPalette: [],

        paletteRGBAfiltering: false,

        disabled: false,
        offset: null
    },
    spectrums = [],
    IE = !!/msie/i.exec( window.navigator.userAgent ),
    rgbaSupport = (function() {
        function contains( str, substr ) {
            return !!~('' + str).indexOf(substr);
        }

        var elem = document.createElement('div');
        var style = elem.style;
        style.cssText = 'background-color:rgba(0,0,0,.5)';
        return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
    })(),
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    markup = (function () {

        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
"<fieldset class='sp-palette_filtering_set'><legend class='sp-palette_filtering-legend'>palette filtering: </legend>",
"<input name='sp-palette_filtering' value='1' type='radio' class='sp-palette_filter_selector'><label>on</label>",
"<input name='sp-palette_filtering' value='0' type='radio' class='sp-palette_filter_selector' checked='checked'><label>off</label>",
"<div class='sp-palette-filters'>",
"<label class='sp-palette_filter_label head'>min</label><label class='sp-palette_filter_label head'>max</label>",
"<br style='clear: both;'>",
"<label class='sp-palette_filter_label r row'>R</label><input id='r_filter1' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-r_filter1' data-type='range' type='number' disabled='disabled'><input id='r_filter2' min='0' max='255' value='255' data-highlight='true' class='sp-x_picker sp-r_filter2' data-type='range' type='number' disabled='disabled'>",
"<br style='clear: both;'>",
"<label class='sp-palette_filter_label g row'>G</label><input id='g_filter1' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-g_filter1' data-type='range' type='number' disabled='disabled'><input id='g_filter2' min='0' max='255' value='255' data-highlight='true' class='sp-x_picker sp-g_filter2' data-type='range' type='number' disabled='disabled'>",
"<br style='clear: both;'>",
"<label class='sp-palette_filter_label b row'>B</label><input id='b_filter1' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-b_filter1' data-type='range' type='number' disabled='disabled'><input id='b_filter2' min='0' max='255' value='255' data-highlight='true' class='sp-x_picker sp-b_filter2' data-type='range' type='number' disabled='disabled'>",
"<br style='clear: both;'>",
"<label class='sp-palette_filter_label a row'>A</label><input id='a_filter1' min='0' max='100' value='0' data-highlight='true' class='sp-x_picker sp-a_filter1' data-type='range' type='number' disabled='disabled'><input id='a_filter2' min='0' max='100' value='100' data-highlight='true' class='sp-x_picker sp-a_filter2' data-type='range' type='number' disabled='disabled'>",
"<br style='clear: both;'>",
"<button type='button' class='sp-palette_filter-clear'></button>",
"</div>",
"</fieldset>",
                "</div>",
                "<div class='sp-picker-container'>",
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
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",

                        "<div class='sp-rgb_sliders'>",
//"<input class='sp-r_slider' type='range' id='test-range' min='0' max='255' />",
                        "<div class='sp-r_slider'><div class='sp-r_slider-inner'><div class='sp-r_slider-constraint1'></div><div class='sp-r_slider-constraint2'></div><div class='sp-r_slider-handle'></div></div></div>",
                        "<div class='sp-g_slider'><div class='sp-g_slider-inner'><div class='sp-g_slider-constraint1'></div><div class='sp-g_slider-constraint2'></div><div class='sp-g_slider-handle'></div></div></div>",
                        "<div class='sp-b_slider'><div class='sp-b_slider-inner'><div class='sp-b_slider-constraint1'></div><div class='sp-b_slider-constraint2'></div><div class='sp-b_slider-handle'></div></div></div>",
                        "</div>",

                        "<div class='sp-pickers'>",
"<input id='r_picker' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-r_picker' data-type='range' type='number'>",
"<input id='g_picker' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-g_picker' data-type='range' type='number'>",
"<input id='b_picker' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-b_picker' data-type='range' type='number'>",
"<input id='a_picker' min='0' max='100' value='100' data-highlight='true' class='sp-x_picker sp-a_picker' data-type='range' type='number' disabled='disabled'>",
                        "</div>",

                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",

"<fieldset class='sp-rgb_modes_set'><legend class='sp-rgb_modes-legend'>RGB mode: <span class='sp-legend-small'>(do not affects hue/saturation controllers)</span></legend>",
"<input name='sp-rgb_mode' value='0' type='radio' class='sp-rgb_mode_selector' checked='checked'><label>normal</label>",
"<input name='sp-rgb_mode' value='1' type='radio' class='sp-rgb_mode_selector'><label>linked</label><br>",
"<input name='sp-rgb_mode' value='2' type='radio' class='sp-rgb_mode_selector'><label>proportional with constraints</label>",
"<div class='sp-rgb_constraints'>",
"<label class='sp-rgb_constraint_label r'>R1</label><input id='r_constraint1' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-r_constraint1' data-type='range' type='number' disabled='disabled'>",
"<label class='sp-rgb_constraint_label g'>G1</label><input id='g_constraint1' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-g_constraint1' data-type='range' type='number' disabled='disabled'>",
"<label class='sp-rgb_constraint_label b'>B1</label><input id='b_constraint1' min='0' max='255' value='0' data-highlight='true' class='sp-x_picker sp-b_constraint1' data-type='range' type='number' disabled='disabled'>",
"<br style='clear: both;'>",
"<label class='sp-rgb_constraint_label r'>R2</label><input id='r_constraint2' min='0' max='255' value='255' data-highlight='true' class='sp-x_picker sp-r_constraint2' data-type='range' type='number' disabled='disabled'>",
"<label class='sp-rgb_constraint_label g'>G2</label><input id='g_constraint2' min='0' max='255' value='255' data-highlight='true' class='sp-x_picker sp-g_constraint2' data-type='range' type='number' disabled='disabled'>",
"<label class='sp-rgb_constraint_label b'>B2</label><input id='b_constraint2' min='0' max='255' value='255' data-highlight='true' class='sp-x_picker sp-b_constraint2' data-type='range' type='number' disabled='disabled'>",
"</div>",
"</fieldset>",

                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate(p, color, className, opts, filter) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = tinycolor(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";

                if (tinycolor.equals(color, current)) c += " sp-thumb-active";
                else if (filter !== undefined && filter !== null && filter.isOn && ! tiny.inRange(filter.lowerbound, filter.upperbound)) c += " sp-thumb-inactive";

                var formattedString = tiny.toString(opts.preferredFormat || "rgb");
                var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.noColorSelectedText)
                    )
                    .html()
                );
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
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
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            isDragging = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,

            rsWidth = 0,
            rSlideHelperWidth = 0,
            gsWidth = 0,
            gSlideHelperWidth = 0,
            bsWidth = 0,
            bSlideHelperWidth = 0,

            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,

            currentR = 0,
            currentG = 0,
            currentB = 0,
            currentAP = 100,

            currentAlpha = 1,

            currentRGBMode = 0,
            currentRC1 = 0,
            currentGC1 = 0,
            currentBC1 = 0,
            currentRC2 = 255,
            currentGC2 = 255,
            currentBC2 = 255,

            paletteFilteringStatus = 0,
            currentRF1 = 0,
            currentGF1 = 0,
            currentBF1 = 0,
            currentAF1 = 0,
            currentRF2 = 255,
            currentGF2 = 255,
            currentBF2 = 255,
            currentAF2 = 100,

 draggerHueUpdateOnBW = false,

            palette = [],
            paletteArray = [],
            paletteLookup = {},
            selectionPalette = opts.selectionPalette.slice(0),
            maxSelectionSize = opts.maxSelectionSize,

            maxPaletteRowElements = (opts.maxPaletteRowElements > 10 ? 10 : opts.maxPaletteRowElements),

            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            pickerContainer = container.find(".sp-picker-container"),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),

            rSliderInner = container.find(".sp-r_slider-inner"),
            rSlider = container.find(".sp-r_slider"),
            rSlideHelper = container.find(".sp-r_slider-handle"),
            gSliderInner = container.find(".sp-g_slider-inner"),
            gSlider = container.find(".sp-g_slider"),
            gSlideHelper = container.find(".sp-g_slider-handle"),
            bSliderInner = container.find(".sp-b_slider-inner"),
            bSlider = container.find(".sp-b_slider"),
            bSlideHelper = container.find(".sp-b_slider-handle"),
            rPickerInput = container.find(".sp-r_picker"),
            gPickerInput = container.find(".sp-g_picker"),
            bPickerInput = container.find(".sp-b_picker"),
            aPickerInput = container.find(".sp-a_picker"),

            alphaSliderInner = container.find(".sp-alpha-inner"),
            alphaSlider = container.find(".sp-alpha"),
            alphaSlideHelper = container.find(".sp-alpha-handle"),

            rgbModes = container.find("input[name=sp-rgb_mode]"),
            rC1Input = container.find(".sp-r_constraint1"),
            rC2Input = container.find(".sp-r_constraint2"),
            gC1Input = container.find(".sp-g_constraint1"),
            gC2Input = container.find(".sp-g_constraint2"),
            bC1Input = container.find(".sp-b_constraint1"),
            bC2Input = container.find(".sp-b_constraint2"),

            paletteFilters = container.find("input[name=sp-palette_filtering]"),
            rF1Input = container.find(".sp-r_filter1"),
            rF2Input = container.find(".sp-r_filter2"),
            gF1Input = container.find(".sp-g_filter1"),
            gF2Input = container.find(".sp-g_filter2"),
            bF1Input = container.find(".sp-b_filter1"),
            bF2Input = container.find(".sp-b_filter2"),
            aF1Input = container.find(".sp-a_filter1"),
            aF2Input = container.find(".sp-a_filter2"),

            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            cancelButton = container.find(".sp-cancel"),
            clearButton = container.find(".sp-clear"),
            chooseButton = container.find(".sp-choose"),
            toggleButton = container.find(".sp-palette-toggle"),

            clearFilteredPaletteButton = container.find(".sp-palette_filter-clear"),

            isInput = boundElement.is("input"),
            isInputTypeColor = isInput && boundElement.attr("type") === "color" && inputTypeColorSupport(),
            shouldReplace = isInput && !flat,
            replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
            offsetElement = (shouldReplace) ? replacer : boundElement,
            previewElement = replacer.find(".sp-preview-inner"),
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            currentPreferredFormat = opts.preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
            isEmpty = !initialColor,
            allowEmpty = opts.allowEmpty && !isInputTypeColor;

        function applyOptions() {

            if (opts.showPaletteOnly) {
                opts.showPalette = true;
            }

            toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);

            if (opts.palette) {
                palette = opts.palette.slice(0);
                paletteArray = $.isArray(palette[0]) ? palette : [palette];
                paletteLookup = {};
                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        var rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }
            }

            container.toggleClass("sp-flat", flat);
            container.toggleClass("sp-input-disabled", !opts.showInput);

            container.toggleClass("sp-rgb_sliders-enabled", opts.showRGBsliders);
            container.toggleClass("sp-pickers-enabled", opts.showRGBApickers);

            container.toggleClass("sp-alpha-enabled", opts.showAlpha);

            container.toggleClass("sp-rgb_modes-enabled", opts.showRGBmodes);

            container.toggleClass("sp-clear-enabled", allowEmpty);
            container.toggleClass("sp-buttons-disabled", !opts.showButtons);
            container.toggleClass("sp-palette-buttons-disabled", !opts.togglePaletteOnly);
            container.toggleClass("sp-palette-disabled", !opts.showPalette);
            container.toggleClass("sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className).addClass(opts.containerClassName);

            container.toggleClass("sp-palette-filtering-enabled", opts.paletteRGBAfiltering);

            reflow();
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            applyOptions();

            if (opts.aPickerScale != 100) {
              opts.aPickerScale = 255;
              currentAP = opts.aPickerScale;
              aPickerInput.val(currentAP);
              aPickerInput.prop("max", currentAP);

              currentAF2 = opts.aPickerScale;
              aF1Input.prop("max", currentAF2);
              aF2Input.val(currentAF2);
              aF2Input.prop("max", currentAF2);
            }
            aPickerInput.prop('disabled', !opts.showAlpha);

            if (shouldReplace) {
                boundElement.after(replacer).hide();
            }

            if (!allowEmpty) {
                clearButton.hide();
            }

            if (flat) {
                boundElement.after(container).hide();
            }
            else {

                var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                if (appendTo.length !== 1) {
                    appendTo = $("body");
                }

                appendTo.append(container);
            }


            if (opts.showPalette && opts.maxPaletteRowElements > 0) { // resize palette container
                    paletteContainer.css("*width", 20*maxPaletteRowElements+"px");
                    paletteContainer.css("max-width", 20*maxPaletteRowElements+"px");
            }


            updateSelectionPaletteFromStorage();

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if(boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);


            // Handle user typed input on RGBA pickers
            rPickerInput.change(function () { setFromPickerInput(rPickerInput, currentR); });
            rPickerInput.bind("paste", function () {
                setTimeout(setFromPickerInput(rPickerInput, currentR), 1);
            });
            rPickerInput.keydown(function (e) { if (e.keyCode == 13) { setFromPickerInput(rPickerInput, currentR); } });
            gPickerInput.change(function () { setFromPickerInput(gPickerInput, currentG); });
            gPickerInput.bind("paste", function () {
                setTimeout(setFromPickerInput(gPickerInput, currentG), 1);
            });
            gPickerInput.keydown(function (e) { if (e.keyCode == 13) { setFromPickerInput(gPickerInput, currentG); } });
            bPickerInput.change(function () { setFromPickerInput(bPickerInput, currentB); });
            bPickerInput.bind("paste", function () {
                setTimeout(setFromPickerInput(bPickerInput, currentB), 1);
            });
            bPickerInput.keydown(function (e) { if (e.keyCode == 13) { setFromPickerInput(bPickerInput, currentB); } });
            aPickerInput.change(function () { setFromPickerInput(aPickerInput, currentAP, opts.aPickerScale); });
            aPickerInput.bind("paste", function () {
                setTimeout(setFromPickerInput(aPickerInput, currentAP, opts.aPickerScale), 1);
            });
            aPickerInput.keydown(function (e) { if (e.keyCode == 13) { setFromPickerInput(aPickerInput, currentAP, opts.aPickerScale); } });

        rgbModes.on('change', function() {
                if (this.value == '2') { //proportional
                    currentRGBMode = 2;
            }
            else if (this.value == '1') { //linked
                    currentRGBMode = 1;
            }
                else { //normal
                    currentRGBMode = 0;
                }
            //(CSS) classtoggle = handles color + enable/disable+show/hide contraints BUT nothing more (constraints don't have to move here nor handles have to)
                container.toggleClass("sp-rgb_linked", (currentRGBMode == 1));
                container.toggleClass("sp-rgb_prop", (currentRGBMode == 2));
                container.find("[id*=_constraint]").prop('disabled', (currentRGBMode != 2));
                if (opts.showRGBsliders) updateRGBSlidersGradients();
            });

            // Handle user typed input on RGB constraints
        container.find("[id*=_constraint1]").each(function () {
        var cp_id = $(this).prop('id');
                var cHelper = container.find(".sp-" + cp_id.charAt(0) + "_slider-constraint1");
        if (cp_id.charAt(0) == "r") {
                    $(this).change(function () { if ($(this).val() != currentRC1) updateConstraintLocation($(this), cHelper, rsWidth, +300 + (+currentRC2), "r1"); });
                    $(this).bind("paste", function () {
                    setTimeout(updateConstraintLocation($(this), cHelper, rsWidth, +300 + (+currentRC2), "r1"), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updateConstraintLocation($(this), cHelper, rsWidth, +300 + (+currentRC2), "r1"); } });
        } else if (cp_id.charAt(0) == "g") {
                    $(this).change(function () { if ($(this).val() != currentGC1) updateConstraintLocation($(this), cHelper, gsWidth, +300 + (+currentGC2), "g1"); });
                    $(this).bind("paste", function () {
                    setTimeout(updateConstraintLocation($(this), cHelper, gsWidth, +300 + (+currentGC2), "g1"), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updateConstraintLocation($(this), cHelper, gsWidth, +300 + (+currentGC2), "g1"); } });
        } else {
                    $(this).change(function () { if ($(this).val() != currentBC1) updateConstraintLocation($(this), cHelper, bsWidth, +300 + (+currentBC2), "b1"); });
                    $(this).bind("paste", function () {
                    setTimeout(updateConstraintLocation($(this), cHelper, bsWidth, +300 + (+currentBC2), "b1"), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updateConstraintLocation($(this), cHelper, bsWidth, +300 + (+currentBC2), "b1"); } });
        }
        });
        container.find("[id*=_constraint2]").each(function () {
        var cp_id = $(this).prop('id');
                var cHelper = container.find(".sp-" + cp_id.charAt(0) + "_slider-constraint2");
        if (cp_id.charAt(0) == "r") {
                    $(this).change(function () { if ($(this).val() != currentRC2) updateConstraintLocation($(this), cHelper, rsWidth, currentRC1, "r2"); });
                    $(this).bind("paste", function () {
                    setTimeout(updateConstraintLocation($(this), cHelper, rsWidth, currentRC1, "r2"), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updateConstraintLocation($(this), cHelper, rsWidth, currentRC1, "r2"); } });
        } else if (cp_id.charAt(0) == "g") {
                    $(this).change(function () { if ($(this).val() != currentGC2) updateConstraintLocation($(this), cHelper, gsWidth, currentGC1, "g2"); });
                    $(this).bind("paste", function () {
                    setTimeout(updateConstraintLocation($(this), cHelper, gsWidth, currentGC1, "g2"), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updateConstraintLocation($(this), cHelper, gsWidth, currentGC1, "g2"); } });
        } else {
                    $(this).change(function () { if ($(this).val() != currentBC2) updateConstraintLocation($(this), cHelper, bsWidth, currentBC1, "b2"); });
                    $(this).bind("paste", function () {
                    setTimeout(updateConstraintLocation($(this), cHelper, bsWidth, currentBC1, "b2"), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updateConstraintLocation($(this), cHelper, bsWidth, currentBC1, "b2"); } });
        }
        });

        container.find(".sp-rgb_modes-legend").mouseover(function () { $(this).toggleClass("sp-legend-tooltip-show", true); });
        container.find(".sp-rgb_modes-legend").mouseout(function () { $(this).toggleClass("sp-legend-tooltip-show", false); });

        paletteFilters.on('change', function() {
            if (this.value == '1') {
                paletteFilteringStatus = 1;
                container.find("[id*=r_filter]").prop('disabled', false);
                container.find("[id*=g_filter]").prop('disabled', false);
                container.find("[id*=b_filter]").prop('disabled', false);
                if (opts.showAlpha) container.find("[id*=a_filter]").prop('disabled', false);
            }
            else {
                paletteFilteringStatus = 0;
                container.find("[id*=_filter]").prop('disabled', true);
            }
            container.toggleClass("sp-palette-filters-on", (paletteFilteringStatus == 1)); // activate/deactivate palette colors filtering
            drawPalette(); // and then re-draw palette (with/without colors filtering)
        });

        container.find("[id*=_filter1]").each(function () {
        var cp_id = $(this).prop('id');
        if (cp_id.charAt(0) == "r") {
                    $(this).change(function () { updatePaletteFiltering($(this), +300 + (+currentRF2), "r1", currentRF1); });
                $(this).bind("paste", function () {
                    setTimeout(updatePaletteFiltering($(this), +300 + (+currentRF2), "r1", currentRF1), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updatePaletteFiltering($(this), +300 + (+currentRF2), "r1", currentRF1); } });
        } else if (cp_id.charAt(0) == "g") {
                    $(this).change(function () { updatePaletteFiltering($(this), +300 + (+currentGF2), "g1", currentGF1); });
                $(this).bind("paste", function () {
                    setTimeout(updatePaletteFiltering($(this), +300 + (+currentGF2), "g1", currentGF1), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updatePaletteFiltering($(this), +300 + (+currentGF2), "g1", currentGF1); } });
        } else if (cp_id.charAt(0) == "b") {
                    $(this).change(function () { updatePaletteFiltering($(this), +300 + (+currentBF2), "b1", currentBF1); });
                $(this).bind("paste", function () {
                    setTimeout(updatePaletteFiltering($(this), +300 + (+currentBF2), "b1", currentBF1), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updatePaletteFiltering($(this), +300 + (+currentBF2), "b1", currentBF1); } });
        } else {
                    $(this).change(function () { updatePaletteFiltering($(this), +300 + (+currentAF2), "a1", currentAF1); });
                $(this).bind("paste", function () {
                    setTimeout(updatePaletteFiltering($(this), +300 + (+currentAF2), "a1", currentAF1), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updatePaletteFiltering($(this), +300 + (+currentAF2), "a1", currentAF1); } });
        }
        });
        container.find("[id*=_filter2]").each(function () {
        var cp_id = $(this).prop('id');
        if (cp_id.charAt(0) == "r") {
                    $(this).change(function () { updatePaletteFiltering($(this), currentRF1, "r2", currentRF2); });
                $(this).bind("paste", function () {
                    setTimeout(updatePaletteFiltering($(this), currentRF1, "r2", currentRF2), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updatePaletteFiltering($(this), currentRF1, "r2", currentRF2); } });
        } else if (cp_id.charAt(0) == "g") {
                    $(this).change(function () { updatePaletteFiltering($(this), currentGF1, "g2", currentGF2); });
                $(this).bind("paste", function () {
                    setTimeout(updatePaletteFiltering($(this), currentGF1, "g2", currentGF2), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updatePaletteFiltering($(this), currentGF1, "g2", currentGF2); } });
        } else if (cp_id.charAt(0) == "b") {
                    $(this).change(function () { updatePaletteFiltering($(this), currentBF1, "b2", currentBF2); });
                $(this).bind("paste", function () {
                    setTimeout(updatePaletteFiltering($(this), currentBF1, "b2", currentBF2), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updatePaletteFiltering($(this), currentBF1, "b2", currentBF2); } });
        } else {
                    $(this).change(function () { updatePaletteFiltering($(this), currentAF1, "a2", currentAF2); });
                $(this).bind("paste", function () {
                    setTimeout(updatePaletteFiltering($(this), currentAF1, "a2", currentAF2), 1);
                });
                $(this).keydown(function (e) { if (e.keyCode == 13) { updatePaletteFiltering($(this), currentAF1, "a2", currentAF2); } });
        }
        });

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                revert();
                hide();
            });

            clearButton.attr("title", opts.clearText);
            clearButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                isEmpty = true;
                move();

                if(flat) {
                    //for the flat style, this is a change event
                    updateOriginalInput(true);
                }
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (IE && textInput.is(":focus")) {
                    textInput.trigger('change');
                }

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);
            toggleButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                opts.showPaletteOnly = !opts.showPaletteOnly;

                // To make sure the Picker area is drawn on the right, next to the
                // Palette area (and not below the palette), first move the Palette
                // to the left to make space for the picker, plus 5px extra.
                // The 'applyOptions' function puts the whole container back into place
                // and takes care of the button-text and the sp-palette-only CSS class.
                if (!opts.showPaletteOnly && !flat) {
                    container.css('left', '-=' + (pickerContainer.outerWidth(true) + 5));
                }
                applyOptions();
            });


            clearFilteredPaletteButton.text(opts.clearFilteredPaletteText);
            clearFilteredPaletteButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                clearPalette(1, true);
            });


            draggable(rSlider, function (dragX, dragY, e) {
var diff = currentR;
                currentR = (dragX / rsWidth * 255);
                isEmpty = false;
                if (e.shiftKey) {
                    currentR = Math.round(currentR * 10) / 10;
                }
                if (!opts.showAlpha) {
                    currentAlpha = 1;
            currentAP = opts.aPickerScale;
                }
if (currentRGBMode !== 0) {
    diff = currentR - diff;
    if (currentRGBMode == 1) { // linked
        currentG = (currentG + diff > 0 ? (currentG + diff < 255 ? currentG + diff : 255) : 0);
        currentB = (currentB + diff > 0 ? (currentB + diff < 255 ? currentB + diff : 255) : 0);
    } else if (currentRGBMode == 2) { // prop
        if ((+currentR) >= (+currentRC2)) { currentR = currentRC2; currentG = currentGC2; currentB = currentBC2; updateHelperLocations(); }
        else if ((+currentR) <= (+currentRC1)) { currentR = currentRC1; currentG = currentGC1; currentB = currentBC1; updateHelperLocations(); }
        else {
            diff = (+currentR) - (+currentRC1); currentG = (+currentGC1) + Math.round(diff * (currentGC2 - currentGC1) / (currentRC2 - currentRC1)); currentB = (+currentBC1) + Math.round(diff * (currentBC2 - currentBC1) / (currentRC2 - currentRC1));
        }
    }
}
updateHSVbyDrag();
                move();
            }, dragStart, dragStop);

            draggable(gSlider, function (dragX, dragY, e) {
var diff = currentG;
                currentG = (dragX / gsWidth * 255);
                isEmpty = false;
                if (e.shiftKey) {
                    currentG = Math.round(currentG * 10) / 10;
                }
                if (!opts.showAlpha) {
                    currentAlpha = 1;
            currentAP = opts.aPickerScale;
                }
if (currentRGBMode !== 0) {
    diff = currentG - diff;
    if (currentRGBMode == 1) { // linked
        currentR = (currentR + diff > 0 ? (currentR + diff < 255 ? currentR + diff : 255) : 0);
        currentB = (currentB + diff > 0 ? (currentB + diff < 255 ? currentB + diff : 255) : 0);
    } else if (currentRGBMode == 2) { // prop
        if ((+currentG) >= (+currentGC2)) { currentR = currentRC2; currentG = currentGC2; currentB = currentBC2; updateHelperLocations(); }
        else if ((+currentG) <= (+currentGC1)) { currentR = currentRC1; currentG = currentGC1; currentB = currentBC1; updateHelperLocations(); }
        else {
            diff = (+currentG) - (+currentGC1); currentR = (+currentRC1) + Math.round(diff * (currentRC2 - currentRC1) / (currentGC2 - currentGC1)); currentB = (+currentBC1) + Math.round(diff * (currentBC2 - currentBC1) / (currentGC2 - currentGC1));
        }
    }
}
updateHSVbyDrag();
                move();
            }, dragStart, dragStop);

            draggable(bSlider, function (dragX, dragY, e) {
var diff = currentB;
                currentB = (dragX / bsWidth * 255);
                isEmpty = false;
                if (e.shiftKey) {
                    currentB = Math.round(currentB * 10) / 10;
                }
                if (!opts.showAlpha) {
                    currentAlpha = 1;
            currentAP = opts.aPickerScale;
                }
if (currentRGBMode !== 0) {
    diff = currentB - diff;
    if (currentRGBMode == 1) { // linked
        currentR = (currentR + diff > 0 ? (currentR + diff < 255 ? currentR + diff : 255) : 0);
        currentG = (currentG + diff > 0 ? (currentG + diff < 255 ? currentG + diff : 255) : 0);
    } else if (currentRGBMode == 2) { // prop
        if ((+currentB) >= (+currentBC2)) { currentR = currentRC2; currentG = currentGC2; currentB = currentBC2; updateHelperLocations(); }
        else if ((+currentB) <= (+currentBC1)) { currentR = currentRC1; currentG = currentGC1; currentB = currentBC1; updateHelperLocations(); }
        else {
            diff = (+currentB) - (+currentBC1); currentR = (+currentRC1) + Math.round(diff * (currentRC2 - currentRC1) / (currentBC2 - currentBC1)); currentG = (+currentGC1) + Math.round(diff * (currentGC2 - currentGC1) / (currentBC2 - currentBC1));
        }
    }
}
updateHSVbyDrag();
                move();
            }, dragStart, dragStop);


            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                isEmpty = false;
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

        currentAP = currentAlpha * opts.aPickerScale;

                move();
            }, dragStart, dragStop);

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;

            currentAP = opts.aPickerScale;

                }

updateRGBbyDrag();
draggerHueUpdateOnBW = true;

                move();

draggerHueUpdateOnBW = false;

            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY, e) {

                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                }
                else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) {
                    currentSaturation = parseFloat(dragX / dragWidth);
                }
                if (setValue) {
                    currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                }

                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;

            currentAP = opts.aPickerScale;

                }

updateRGBbyDrag();

                move();
            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = opts.preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }


            function updateHSVbyDrag() {
                var new_hsv = new tinycolor({ r: currentR, g: currentG, b: currentB }).toHsv();
                if (currentR+currentG+currentB > 0 && currentR+currentG+currentB < 765) currentHue = (new_hsv.h % 360) / 360;
                currentSaturation = new_hsv.s;
                currentValue = new_hsv.v;
            }

            function updateRGBbyDrag() {
                var new_rgb = new tinycolor({ h: currentHue * 360, s: currentSaturation, v: currentValue }).toRgb();
                currentR = new_rgb.r;
                currentG = new_rgb.g;
                currentB = new_rgb.b;
            }


            function paletteElementClick(e) {
                var thumb_el = $(e.target).closest(".sp-thumb-el");
                if (!(thumb_el.hasClass('sp-thumb-active') || thumb_el.hasClass('sp-thumb-inactive'))) {
                    set(thumb_el.data("color"));
                    move();
                    if (!(e.data && e.data.ignore)) {
                        updateOriginalInput(true);
                        if (opts.hideAfterPaletteSelect) hide();
                    }
                }
                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".sp-thumb-el", paletteEvent, paletteElementClick);
            initialColorContainer.delegate(".sp-thumb-el:nth-child(1)", paletteEvent, { ignore: true }, paletteElementClick);
        }

        function updateSelectionPaletteFromStorage() {

            if (localStorageKey && window.localStorage) {

                // Migrate old palettes over to new format.  May want to remove this eventually.
                try {
                    var oldPalette = window.localStorage[localStorageKey].split(",#");
                    if (oldPalette.length > 1) {
                        delete window.localStorage[localStorageKey];
                        $.each(oldPalette, function(i, c) {
                             addColorToSelectionPalette(c);
                        });
                    }
                }
                catch(e) { }

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) { }
            }
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var rgb = tinycolor(color).toRgbString();
                if (!paletteLookup[rgb] && $.inArray(rgb, selectionPalette) === -1) {

                    if (paletteFilteringStatus && (selectionPalette.length >= maxSelectionSize)) {
                        var AF1 = 1, AF2 = 1;
                        if (opts.showAlpha) {
                            AF1 = Math.round(100*currentAF1/opts.aPickerScale)/100;
                            AF2 = Math.round(100*currentAF2/opts.aPickerScale)/100;
                        }
                        var lowerbound = { r: currentRF1, g: currentGF1, b: currentBF1, a: AF1 },
                            upperbound = { r: currentRF2, g: currentGF2, b: currentBF2, a: AF2 };

                        for (var i = 0; i < selectionPalette.length; ++i) {
                            var current_color = tinycolor(selectionPalette[i]);
                            if (! current_color.inRange(lowerbound, upperbound)) {
                                selectionPalette.splice(i, 1);
                                break;
                            }
                        }
                    }

                    selectionPalette.push(rgb);
                    while(selectionPalette.length > maxSelectionSize) {
                        selectionPalette.shift();
                    }
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch(e) { }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            if (opts.showPalette) {
                for (var i = 0; i < selectionPalette.length; i++) {
                    var rgb = tinycolor(selectionPalette[i]).toRgbString();

                    if (!paletteLookup[rgb]) {
                        unique.push(selectionPalette[i]);
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts);
            });

            updateSelectionPaletteFromStorage();

            if (selectionPalette) {

                var paletteFiltering = null;
                if (paletteFilteringStatus) {
                    var AF1 = 1, AF2 = 1;
                    if (opts.showAlpha) {
                        AF1 = Math.round(100*currentAF1/opts.aPickerScale)/100;
                        AF2 = Math.round(100*currentAF2/opts.aPickerScale)/100;
                    }
                    paletteFiltering = {isOn: paletteFilteringStatus, lowerbound: { r: currentRF1, g: currentGF1, b: currentBF1, a: AF1 }, upperbound: { r: currentRF2, g: currentGF2, b: currentBF2, a: AF2 }};
                }
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts, paletteFiltering));
                
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial", opts));
            }
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                reflow();
            }
            isDragging = true;
            container.addClass(draggingClass);
            shiftMovementDirection = null;
            boundElement.trigger('dragstart.spectrum', [ get() ]);
        }

        function dragStop() {
            isDragging = false;
            container.removeClass(draggingClass);
            boundElement.trigger('dragstop.spectrum', [ get() ]);
        }

        function setFromTextInput() {

            var value = textInput.val();

            if ((value === null || value === "") && allowEmpty) {
                set(null);
                updateOriginalInput(true);
            }
            else {
                var tiny = tinycolor(value);
                if (tiny.isValid()) {

            if ((tiny.getFormat() == "rgb" || tiny.getFormat() == "hex") && currentRGBMode == 2) {
            if (tiny._r > currentRC2) tiny._r = currentRC2;
            else if (tiny._r < currentRC1) tiny._r = currentRC1;
            if (tiny._g > currentGC2) tiny._g = currentGC2;
            else if (tiny._g < currentGC1) tiny._g = currentGC1;
            if (tiny._b > currentBC2) tiny._b = currentBC2;
            else if (tiny._b < currentBC1) tiny._b = currentBC1;
            }

                    set(tiny);
                    updateOriginalInput(true);
                }
                else {
                    textInput.addClass("sp-validation-error");
                }
            }
        }

function setFromPickerInput(pickerInput, old, mv) {
    if (mv === undefined || mv === null) mv = 255;
    // (I need to do this because click on pickers number input arrows doesn't immediately make contraints lose focus more about this on updateUI() )
        if ($( document.activeElement ).prop("id").indexOf("_constraint") >= 0) $(document.activeElement).blur();

        var value = pickerInput.val();
    if (value == old) return;
    if (value < 0) value = 0;
    else if (value > mv) value = mv;

    if (currentRGBMode !== 0 && $.isNumeric(value)) {
        var c_id = pickerInput.prop('id').charAt(0);
        var diff = value;
        if (c_id == 'r') {
            diff -= currentR;
            if (currentRGBMode == 1) { // fixed
                gPickerInput.val(currentG + diff > 0 ? (currentG + diff < 255 ? currentG + diff : 255) : 0);
                bPickerInput.val(currentB + diff > 0 ? (currentB + diff < 255 ? currentB + diff : 255) : 0);
            } else if (currentRGBMode == 2) { // prop
                if ((+value) >= (+currentRC2)) { value = currentRC2; gPickerInput.val(currentGC2); bPickerInput.val(currentBC2); }
                else if ((+value) <= (+currentRC1)) { value = currentRC1; gPickerInput.val(currentGC1); bPickerInput.val(currentBC1); }
                else { diff = (+value) - (+currentRC1); gPickerInput.val((+currentGC1) + Math.round(diff * (currentGC2 - currentGC1) / (currentRC2 - currentRC1))); bPickerInput.val((+currentBC1) + Math.round(diff * (currentBC2 - currentBC1) / (currentRC2 - currentRC1))); }
            }
        } else if (c_id == 'g') {
            diff -= currentG;
            if (currentRGBMode == 1) { // fixed
                rPickerInput.val(currentR + diff > 0 ? (currentR + diff < 255 ? currentR + diff : 255) : 0);
                bPickerInput.val(currentB + diff > 0 ? (currentB + diff < 255 ? currentB + diff : 255) : 0);
            } else if (currentRGBMode == 2) { // prop
                if ((+value) >= (+currentGC2)) { value = currentGC2; rPickerInput.val(currentRC2); bPickerInput.val(currentBC2); }
                else if ((+value) <= (+currentGC1)) { value = currentGC1; rPickerInput.val(currentRC1); bPickerInput.val(currentBC1); }
                else { diff = (+value) - (+currentGC1); rPickerInput.val((+currentRC1) + Math.round(diff * (currentRC2 - currentRC1) / (currentGC2 - currentGC1))); bPickerInput.val((+currentBC1) + Math.round(diff * (currentBC2 - currentBC1) / (currentGC2 - currentGC1))); }
            }
        } else if (c_id == 'b') {
            diff -= currentB;
            if (currentRGBMode == 1) { // fixed
                rPickerInput.val(currentR + diff > 0 ? (currentR + diff < 255 ? currentR + diff : 255) : 0);
                gPickerInput.val(currentG + diff > 0 ? (currentG + diff < 255 ? currentG + diff : 255) : 0);
            } else if (currentRGBMode == 2) { // prop
                if ((+value) >= (+currentBC2)) { value = currentBC2; rPickerInput.val(currentRC2); gPickerInput.val(currentGC2); }
                else if ((+value) <= (+currentBC1)) { value = currentBC1; rPickerInput.val(currentRC1); gPickerInput.val(currentGC1); }
                else { diff = (+value) - (+currentBC1); rPickerInput.val((+currentRC1) + Math.round(diff * (currentRC2 - currentRC1) / (currentBC2 - currentBC1))); gPickerInput.val((+currentGC1) + Math.round(diff * (currentGC2 - currentGC1) / (currentBC2 - currentBC1))); }
            }
        }
    }
    pickerInput.val(value);
        value = "(" + rPickerInput.val() + ", " + gPickerInput.val() + ", " + bPickerInput.val();

    if (opts.showAlpha) {
            value = "rgba" + value + ", " + Math.round(aPickerInput.val() / mv * 100)/100 + ")";
    }
    else {
            value = "rgb" + value + ")";
    }
                var tiny = tinycolor(value);
                if (tiny.isValid()) {
                    set(tiny);
                }
}

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            var event = $.Event('beforeShow.spectrum');

            if (visible) {
                reflow();
                return;
            }

            boundElement.trigger(event, [ get() ]);

            if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                return;
            }

            hideAll();
            visible = true;

            $(doc).bind("keydown.spectrum", onkeydown);
            $(doc).bind("click.spectrum", clickout);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("sp-active");
            container.removeClass("sp-hidden");

            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
            boundElement.trigger('show.spectrum', [ colorOnShow ]);
        }

        function onkeydown(e) {
            // Close on ESC
            if (e.keyCode === 27) {
                hide();
            }
        }

        function clickout(e) {

        // (I already explained why I need this on updateUI() )
            if ($( document.activeElement ).prop("id").indexOf("_constraint") >= 0) $( document.activeElement ).trigger( "change" );

            // Return on right click.
            if (e.button == 2) { return; }

            // If a drag event was happening during the mouseup, don't hide
            // on click.
            if (isDragging) { return; }

            if (clickoutFiresChange) {
                updateOriginalInput(true);
            }
            else {
                revert();
            }
            hide();
        }

        function hide() {
            // Return if hiding is unnecessary
            if (!visible || flat) { return; }
            visible = false;

            $(doc).unbind("keydown.spectrum", onkeydown);
            $(doc).unbind("click.spectrum", clickout);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("sp-active");
            container.addClass("sp-hidden");

            callbacks.hide(get());
            boundElement.trigger('hide.spectrum', [ get() ]);
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                // Update UI just in case a validation error needs
                // to be cleared.
                updateUI();
                return;
            }

            var newColor, newHsv;
            if (!color && allowEmpty) {
                isEmpty = true;
            } else {
                isEmpty = false;
                newColor = tinycolor(color);
                newHsv = newColor.toHsv();

                currentR = newColor._r;
                currentG = newColor._g;
                currentB = newColor._b;
                currentAP = newHsv.a * opts.aPickerScale;

                if (currentR+currentG+currentB > 0 && currentR+currentG+currentB < 765) currentHue = (newHsv.h % 360) / 360;
                currentSaturation = newHsv.s;
                currentValue = newHsv.v;
                currentAlpha = newHsv.a;
            }
            updateUI();

            if (newColor && newColor.isValid() && !ignoreFormatChange) {
                currentPreferredFormat = opts.preferredFormat || newColor.getFormat();
            }
        }

        function get(opts) {
            opts = opts || { };

            if (allowEmpty && isEmpty) {
                return null;
            }

            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            }, { format: opts.format || currentPreferredFormat });
        }

        function isValid() {
            return !textInput.hasClass("sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
            boundElement.trigger('move.spectrum', [ get() ]);
        }

        function updateUI() {

            textInput.removeClass("sp-validation-error");

// need to manually trigger contraints update if I moved from one contraints input to a dragger or arrows of a picker number input (because constraint input doesn't lose its focus)
            if ($( document.activeElement ).prop("id") !== undefined && ($( document.activeElement ).prop("id").indexOf("_constraint") >= 0 || $( document.activeElement ).prop("id").indexOf("_picker") >= 0 )) $(document.activeElement).blur(); //second line for picker updating when passing to rgb sliders without hitting enter

            updateHelperLocations();

            var realColor = get({ format: format }),
                displayColor = '';

if (draggerHueUpdateOnBW || !(realColor.toHex(true) == "000" || realColor.toHex(true) == "fff")) { // only update when not black|white : this should prevent square to always drop back to red even when sliding/picking from green, blue, etc. (BUT forced to ALWAYS update after Hue slider drag)

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
            dragger.css("background-color", flatColor.toHexString());

}

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1 && !(currentAlpha === 0 && format === "name")) {
                if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                    format = "rgb";
                }
            }


             //reset background info for preview element
            previewElement.removeClass("sp-clear-display");
            previewElement.css('background-color', 'transparent');

            if (!realColor && allowEmpty) {
                // Update the replaced elements background with icon indicating no color selection
                previewElement.addClass("sp-clear-display");
            }
            else {
                var realHex = realColor.toHexString(),
                    realRgb = realColor.toRgbString();

                // Update the replaced elements background color (with actual selected color)
                if (rgbaSupport || realColor.alpha === 1) {
                    previewElement.css("background-color", realRgb);
                }
                else {
                    previewElement.css("background-color", "transparent");
                    previewElement.css("filter", realColor.toFilter());
                }

                if (opts.showRGBsliders) {
                    updateRGBSlidersGradients(realHex);
                }

            if (opts.showRGBApickers || opts.showAlpha) {
                    var rgb = realColor.toRgb();

                if (opts.showRGBApickers) {
                    rPickerInput.val(rgb.r);
                    gPickerInput.val(rgb.g);
                    bPickerInput.val(rgb.b);
                }

                if (opts.showAlpha) {

                    if (opts.showRGBApickers) aPickerInput.val(Math.round(rgb.a * opts.aPickerScale));

                    rgb.a = 0;
                    var realAlpha = tinycolor(rgb).toRgbString();
                    var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                    if (IE) {
                        alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
                    }
                    else {
                        alphaSliderInner.css("background", "-webkit-" + gradient);
                        alphaSliderInner.css("background", "-moz-" + gradient);
                        alphaSliderInner.css("background", "-ms-" + gradient);
                        // Use current syntax gradient on unprefixed property.
                        alphaSliderInner.css("background",
                            "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                    }
                }
            }

                displayColor = realColor.toString(format);
            }

            // Update the text entry input as it changes happen
            if (opts.showInput) {
                textInput.val(displayColor);
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateRGBSlidersGradients(realHex) { //### IE gradient-filters ok ??
            if (realHex === undefined || realHex === null) realHex = get().toHexString();
            var g_left = "linear-gradient(left,", gradientR = " ", gradientG = " ", gradientB = " ";
            if (currentRGBMode == 2) {
            if (IE) { gradientR = gradientG = gradientB = tinycolor({ r: currentRC1, g: currentGC1, b: currentBC1 }).toFilter({ gradientType: false }, tinycolor({ r: currentRC2, g: currentGC2, b: currentBC2 })); }
            else { gradientR = gradientG = gradientB += "rgb("+currentRC1+","+currentGC1+","+currentBC1+"),rgb("+currentRC2+","+currentGC2+","+currentBC2+")"; }
            } else if (currentRGBMode == 1) {
            if (IE) {
                gradientR = tinycolor({ r: 0, g: Math.max(0, (+currentG) - (+currentR)), b: Math.max(0, (+currentB) - (+currentR)) }).toFilter({ gradientType: false }, tinycolor({ r: 255, g: Math.min(255, 255 + (+currentG) - (+currentR)), b: Math.min(255, 255 + (+currentB) - (+currentR)) }));
                gradientG = tinycolor({ r: Math.max(0, (+currentR) - (+currentG)), g: 0, b: Math.max(0, (+currentB) - (+currentG)) }).toFilter({ gradientType: false }, tinycolor({ r: Math.min(255, 255 + (+currentR) - (+currentG)), g: 255, b: Math.min(255, 255 + (+currentB) - (+currentG)) }));
                gradientB = tinycolor({ r: Math.max(0, (+currentR) - (+currentB)), g: Math.max(0, (+currentG) - (+currentB)), b: 0 }).toFilter({ gradientType: false }, tinycolor({ r: Math.min(255, 255 + (+currentR) - (+currentB)), g: Math.min(255, 255 + (+currentG) - (+currentB)), b: 255 }));
            }
            else {
                gradientR += "rgb(0,"+Math.max(0, (+currentG) - (+currentR))+","+Math.max(0, (+currentB) - (+currentR))+"),rgb(255,"+Math.min(255, 255 + (+currentG) - (+currentR))+","+Math.min(255, 255 + (+currentB) - (+currentR))+")";
                gradientG += "rgb("+Math.max(0, (+currentR) - (+currentG))+",0,"+Math.max(0, (+currentB) - (+currentG))+"),rgb("+Math.min(255, 255 + (+currentR) - (+currentG))+",255,"+Math.min(255, 255 + (+currentB) - (+currentG))+")";
                gradientB += "rgb("+Math.max(0, (+currentR) - (+currentB))+","+Math.max(0, (+currentG) - (+currentB))+",0),rgb("+Math.min(255, 255 + (+currentR) - (+currentB))+","+Math.min(255, 255 + (+currentG) - (+currentB))+",255)";
            }
            } else {
            if (IE) {
                gradientR = tinycolor(realHex.replaceAt(1, "00")).toFilter({ gradientType: false }, realHex.replaceAt(1, "ff"));
                gradientG = tinycolor(realHex.replaceAt(3, "00")).toFilter({ gradientType: false }, realHex.replaceAt(3, "ff"));
                gradientB = tinycolor(realHex.replaceAt(5, "00")).toFilter({ gradientType: false }, realHex.replaceAt(5, "ff"));
            }
            else {
                gradientR += realHex.replaceAt(1, "00") + "," + realHex.replaceAt(1, "ff");
                gradientG += realHex.replaceAt(3, "00") + "," + realHex.replaceAt(3, "ff");
                gradientB += realHex.replaceAt(5, "00") + "," + realHex.replaceAt(5, "ff");
            }
            }
                    if (IE) {
                        rSliderInner.css("filter", gradientR);
                    }
                    else {
                gradientR += ")";
                        rSliderInner.css("background", "-webkit-" + g_left + gradientR);
                        rSliderInner.css("background", "-moz-" + g_left + gradientR);
                        rSliderInner.css("background", "-ms-" + g_left + gradientR);
                        // Use current syntax gradient on unprefixed property.
                        rSliderInner.css("background", "linear-gradient(to right," + gradientR);
                    }

                    if (IE) {
                        gSliderInner.css("filter", gradientG);
                    }
                    else {
                gradientG += ")";
                        gSliderInner.css("background", "-webkit-" + g_left + gradientG);
                        gSliderInner.css("background", "-moz-" + g_left + gradientG);
                        gSliderInner.css("background", "-ms-" + g_left + gradientG);
                        // Use current syntax gradient on unprefixed property.
                        gSliderInner.css("background", "linear-gradient(to right, " + gradientG);
                    }

                    if (IE) {
                        bSliderInner.css("filter", gradientB);
                    }
                    else {
                gradientB += ")";
                        bSliderInner.css("background", "-webkit-" + g_left + gradientB);
                        bSliderInner.css("background", "-moz-" + g_left + gradientB);
                        bSliderInner.css("background", "-ms-" + g_left + gradientB);
                        // Use current syntax gradient on unprefixed property.
                        bSliderInner.css("background", "linear-gradient(to right, " + gradientB);
                    }
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            if(allowEmpty && isEmpty) {
                //if selected color is empty, hide the helpers

                rSlideHelper.hide();
                gSlideHelper.hide();
                bSlideHelper.hide();

                alphaSlideHelper.hide();
                slideHelper.hide();
                dragHelper.hide();
            }
            else {
                //make sure helpers are visible

                rSlideHelper.show();
                gSlideHelper.show();
                bSlideHelper.show();

                alphaSlideHelper.show();
                slideHelper.show();
                dragHelper.show();

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
                    "top": dragY + "px",
                    "left": dragX + "px"
                });


                var rsX = Math.round(currentR * rsWidth / 255);
                rSlideHelper.css({
                    "left": (rsX - (rSlideHelperWidth / 2)) + "px"
                });
                var gsX = Math.round(currentG * gsWidth / 255);
                gSlideHelper.css({
                    "left": (gsX - (gSlideHelperWidth / 2)) + "px"
                });
                var bsX = Math.round(currentB * bsWidth / 255);
                bSlideHelper.css({
                    "left": (bsX - (bSlideHelperWidth / 2)) + "px"
                });


                var alphaX = currentAlpha * alphaWidth;
                alphaSlideHelper.css({
                    "left": (alphaX - (alphaSlideHelperWidth / 2)) + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = (currentHue) * slideHeight;
                slideHelper.css({
                    "top": (slideY - slideHelperHeight) + "px"
                });
            }
        }


        function updateConstraintLocation(pickerInput, cHelper, sWidth, mv, cp_id) {
            var value = pickerInput.val();
        if (value < 0) value = 0;
        else if (value > 255) value = 255;

        if (value >= 0 && value <= 255) {
            if (mv < 300) { // C2, mv=C1
                if ((+value) < (+mv)) value = mv;
            } else { // C1, mv=C2
                if ((+value) > (+mv) - 300) value = (+mv) - 300;
            }
            pickerInput.val(value);
                    cHelper.css({
                        "left": (Math.round(value * sWidth / 255) - (mv < 300 ? 1 : 2)) + "px"
                    });

            switch (cp_id) {
                case "r1":
                    currentRC1 = value;
                break;
                case "g1":
                    currentGC1 = value;
                break;
                case "b1":
                    currentBC1 = value;
                break;
                case "r2":
                    currentRC2 = value;
                break;
                case "g2":
                    currentGC2 = value;
                break;
                case "b2":
                    currentBC2 = value;
                break;
            }
            if (opts.showRGBsliders) updateRGBSlidersGradients();
        }
        }

        function updatePaletteFiltering(pickerInput, mv, cp_id, old) {
            var value = pickerInput.val();
            if (value == old) return;
            if (value < 0) value = 0;
            else if (value > 255) value = 255;

            if (value >= 0 && value <= 255) {
             if (mv < 300) { // F2, mv=F1
                 if ((+value) < (+mv)) value = mv;
            } else { // F1, mv=f2
                 if ((+value) > (+mv) - 300) value = (+mv) - 300;
            }

            switch (cp_id) {
                case "r1":
                    currentRF1 = value;
                break;
                case "g1":
                    currentGF1 = value;
                break;
                case "b1":
                    currentBF1 = value;
                break;
                case "a1":
                    currentAF1 = value;
                break;
                case "r2":
                    currentRF2 = value;
                break;
                case "g2":
                    currentGF2 = value;
                break;
                case "b2":
                    currentBF2 = value;
                break;
                case "a2":
                    if ((+value) > +opts.aPickerScale) value = opts.aPickerScale;
                    currentAF2 = value;
                break;
            }
            pickerInput.val(value);
            drawPalette(); // update palette with colors filtering
        }
        }

        function clearPalette(target, exposeCurrent) { // target color(s) to remove : 0 = current only, 1 = unfiltered (may or not preserve current), 2 = all (may or not preserve current)
            if (showSelectionPalette && ((target === 0 && exposeCurrent === true) || (target == 1 && paletteFilteringStatus) || (target == 2))) {
                var color, i;
                if (! exposeCurrent || target === 0) color = get();
                switch (target) {
                    case 0: // I know exposeCurrent is always true in this case
                        i = selectionPalette.indexOf(tinycolor(color).toRgbString());
                        if (i >= 0) selectionPalette.splice(i, 1);
                    break;

                    case 1: // I know paletteFilteringStatus is always on in this case
                        var AF1 = 1, AF2 = 1;
                        if (opts.showAlpha) {
                            AF1 = Math.round(100*currentAF1/opts.aPickerScale)/100;
                            AF2 = Math.round(100*currentAF2/opts.aPickerScale)/100;
                        }
                        var lowerbound = { r: currentRF1, g: currentGF1, b: currentBF1, a: AF1 },
                            upperbound = { r: currentRF2, g: currentGF2, b: currentBF2, a: AF2 };

                        for (i = selectionPalette.length-1; i>=0; i--) {
                            var current_tiny = tinycolor(selectionPalette[i]);
                            if (! current_tiny.inRange(lowerbound, upperbound)) if (exposeCurrent || ! tinycolor.equals(color, selectionPalette[i])) selectionPalette.splice(i, 1);
                        }
                    break;

                    case 2:
                        var preserveCurrent = false;
                        var current;
                        if (! exposeCurrent) {
                            current = tinycolor(color).toRgbString();
                            if (selectionPalette.indexOf(current) >= 0) preserveCurrent = true;
                        }
                        selectionPalette = [];
                        if (preserveCurrent) selectionPalette.push(current);
                    break;
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch(e) { }
                }

                drawPalette();
            }
        }

        function updateOriginalInput(fireCallback) {
            var color = get(),
                displayColor = '',
                hasChanged = !tinycolor.equals(color, colorOnShow);

            if (color) {
                displayColor = color.toString(currentPreferredFormat);
                // Update the selection palette with the current color
                addColorToSelectionPalette(color);
            }

            if (isInput) {
                boundElement.val(displayColor);
            }

            if (fireCallback && hasChanged) {
                callbacks.change(color);
                boundElement.trigger('change', [ color ]);
            }
        }

        function reflow() {
            if (!visible) {
                return; // Calculations would be useless and wouldn't be reliable anyways
            }
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();

            rsWidth = rSlider.width();
            rSlideHelperWidth = rSlideHelper.width();
            gsWidth = gSlider.width();
            gSlideHelperWidth = gSlideHelper.width();
            bsWidth = bSlider.width();
            bSlideHelperWidth = bSlideHelper.width();

            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.css("position", "absolute");
                if (opts.offset) {
                    container.offset(opts.offset);
                } else {
                    container.offset(getOffset(container, offsetElement));
                }
            }

            updateHelperLocations();

            if (opts.showPalette) {
                drawPalette();
            }

            boundElement.trigger('reflow.spectrum');
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;

            if (optionName === "preferredFormat") {
                currentPreferredFormat = opts.preferredFormat;
            }
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("sp-disabled");
        }

        function setOffset(coord) {
            opts.offset = coord;
            reflow();
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            offset: setOffset,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
    * checkOffset - get the offset below/above and left/right element depending on screen position
    * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
    */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
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
            Math.abs(dpHeight + inputHeight - extraY) : extraY));

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
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

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
                if (IE && doc.documentMode < 9 && !e.button) {
                    return stop();
                }

                var t0 = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0];
                var pageX = t0 && t0.pageX || e.pageX;
                var pageY = t0 && t0.pageY || e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
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
                    $(doc.body).addClass("sp-dragging");

                    move(e);

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                setTimeout(function() {
                    onstop.apply(element, arguments);
                }, 0);
            }
            dragging = false;
        }

        $(element).bind("touchstart mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }

    function inputTypeColorSupport() {
        return $.fn.spectrum.inputTypeColorSupport();
    }

    /**
    * Define a jQuery plugin
    */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {
                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var options = $.extend({}, opts, $(this).data());
            var spect = spectrum(this, options);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.loadOpts = {};
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;
    $.fn.spectrum.inputTypeColorSupport = function inputTypeColorSupport() {
        if (typeof inputTypeColorSupport._cachedResult === "undefined") {
            var colorInput = $("<input type='color'/>")[0]; // if color element is supported, value will default to not null
            inputTypeColorSupport._cachedResult = colorInput.type === "color" && colorInput.value !== "";
        }
        return inputTypeColorSupport._cachedResult;
    };

    $.spectrum = { };
    $.spectrum.localization = { };
    $.spectrum.palettes = { };

    $.fn.spectrum.processNativeColorInputs = function () {
        var colorInputs = $("input[type=color]");
        if (colorInputs.length && !inputTypeColorSupport()) {
            colorInputs.spectrum({
                preferredFormat: "hex6"
            });
        }
    };

    // TinyColor v1.1.2
    // https://github.com/bgrins/TinyColor
    // Brian Grinstead, MIT License

    (function() {

    var trimLeft = /^[\s,#]+/,
        trimRight = /\s+$/,
        tinyCounter = 0,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathRandom = math.random;

    var tinycolor = function(color, opts) {

        color = (color) ? color : '';
        opts = opts || { };

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) {
           return color;
        }
        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) {
            return new tinycolor(color, opts);
        }

        var rgb = inputToRGB(color);
        this._originalInput = color,
        this._r = rgb.r,
        this._g = rgb.g,
        this._b = rgb.b,
        this._a = rgb.a,
        this._roundA = mathRound(100*this._a) / 100,
        this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) { this._r = mathRound(this._r); }
        if (this._g < 1) { this._g = mathRound(this._g); }
        if (this._b < 1) { this._b = mathRound(this._b); }

        this._ok = rgb.ok;
        this._tc_id = tinyCounter++;
    };

    tinycolor.prototype = {
        isDark: function() {
            return this.getBrightness() < 128;
        },
        isLight: function() {
            return !this.isDark();
        },
        isValid: function() {
            return this._ok;
        },
        getOriginalInput: function() {
          return this._originalInput;
        },
        getFormat: function() {
            return this._format;
        },
        getAlpha: function() {
            return this._a;
        },
        getBrightness: function() {
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },
        setAlpha: function(value) {
            this._a = boundAlpha(value);
            this._roundA = mathRound(100*this._a) / 100;
            return this;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
        },
        toHsvString: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (this._a == 1) ?
              "hsv("  + h + ", " + s + "%, " + v + "%)" :
              "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
        },
        toHslString: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (this._a == 1) ?
              "hsl("  + h + ", " + s + "%, " + l + "%)" :
              "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
        },
        toHex: function(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function(allow3Char) {
            return '#' + this.toHex(allow3Char);
        },
        toHex8: function() {
            return rgbaToHex(this._r, this._g, this._b, this._a);
        },
        toHex8String: function() {
            return '#' + this.toHex8();
        },
        toRgb: function() {
            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
        },
        toRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
              "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function() {
            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
        },
        toPercentageRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
              "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function() {
            if (this._a === 0) {
                return "transparent";
            }

            if (this._a < 1) {
                return false;
            }

            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function(secondColor) {
            var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
            var secondHex8String = hex8String;
            var gradientType = this._gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = tinycolor(secondColor);
                secondHex8String = s.toHex8String();
            }

            return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
        },
        toString: function(format) {
            var formatSet = !!format;
            format = format || this._format;

            var formattedString = false;
            var hasAlpha = this._a < 1 && this._a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === "name" && this._a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "hex8") {
                formattedString = this.toHex8String();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            return formattedString || this.toHexString();
        },

        inRange: function(color1, color2) {
            return inRange(this, color1, color2);
        },

        _applyModification: function(fn, args) {
            var color = fn.apply(null, [this].concat([].slice.call(args)));
            this._r = color._r;
            this._g = color._g;
            this._b = color._b;
            this.setAlpha(color._a);
            return this;
        },
        lighten: function() {
            return this._applyModification(lighten, arguments);
        },
        brighten: function() {
            return this._applyModification(brighten, arguments);
        },
        darken: function() {
            return this._applyModification(darken, arguments);
        },
        desaturate: function() {
            return this._applyModification(desaturate, arguments);
        },
        saturate: function() {
            return this._applyModification(saturate, arguments);
        },
        greyscale: function() {
            return this._applyModification(greyscale, arguments);
        },
        spin: function() {
            return this._applyModification(spin, arguments);
        },

        _applyCombination: function(fn, args) {
            return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function() {
            return this._applyCombination(analogous, arguments);
        },
        complement: function() {
            return this._applyCombination(complement, arguments);
        },
        monochromatic: function() {
            return this._applyCombination(monochromatic, arguments);
        },
        splitcomplement: function() {
            return this._applyCombination(splitcomplement, arguments);
        },
        triad: function() {
            return this._applyCombination(triad, arguments);
        },
        tetrad: function() {
            return this._applyCombination(tetrad, arguments);
        }
    };

    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color, opts) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    }
                    else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return tinycolor(color, opts);
    };

    // Given a string or object, convert that input to RGB
    // Possible string inputs:
    //
    //     "red"
    //     "#f00" or "f00"
    //     "#ff0000" or "ff0000"
    //     "#ff000000" or "ff000000"
    //     "rgb 255 0 0" or "rgb (255, 0, 0)"
    //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
    //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
    //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
    //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
    //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
    //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
    //
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }


    // Conversion Functions
    // --------------------

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    // `hslToRgb`
    // Converts an HSL color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

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
        return { h: h, s: s, v: v };
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
     function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHex`
    // Converts an RGB color to hex
    // Assumes r, g, and b are contained in the set [0, 255]
    // Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }
        // `rgbaToHex`
        // Converts an RGBA color plus alpha transparency to hex
        // Assumes r, g, b and a are contained in the set [0, 255]
        // Returns an 8 character hex
        function rgbaToHex(r, g, b, a) {

            var hex = [
                pad2(convertDecimalToHex(a)),
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            return hex.join("");
        }

    // `equals`
    // Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) { return false; }
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };

    function inRange(color, lowerbound_color, upperbound_color) {
        if (lowerbound_color !== undefined && lowerbound_color !== null && typeof lowerbound_color == "object" && lowerbound_color.hasOwnProperty("r") && lowerbound_color.hasOwnProperty("g") && lowerbound_color.hasOwnProperty("b") && lowerbound_color.hasOwnProperty("a"))
            if ( +lowerbound_color.r > +color._r || +lowerbound_color.g > +color._g || +lowerbound_color.b > +color._b || +lowerbound_color.a > +color._roundA) return false;
        if (upperbound_color !== undefined && upperbound_color !== null && typeof upperbound_color == "object" && upperbound_color.hasOwnProperty("r") && upperbound_color.hasOwnProperty("g") && upperbound_color.hasOwnProperty("b") && upperbound_color.hasOwnProperty("a"))
            if ( +upperbound_color.r < +color._r || +upperbound_color.g < +color._g || +upperbound_color.b < +color._b || +upperbound_color.a < +color._roundA) return false;
        return true;
    }

    tinycolor.random = function() {
        return tinycolor.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };


    // Modification Functions
    // ----------------------
    // Thanks to less.js for some of the basics here
    // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    function desaturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function saturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function greyscale(color) {
        return tinycolor(color).desaturate(100);
    }

    function lighten (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    function brighten(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var rgb = tinycolor(color).toRgb();
        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
        return tinycolor(rgb);
    }

    function darken (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
    // Values outside of this range will be wrapped into this range.
    function spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (mathRound(hsl.h) + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
    }

    // Combination Functions
    // ---------------------
    // Thanks to jQuery xColor for some of the ideas behind these
    // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    function complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    }

    function triad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function tetrad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
            tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
        ];
    }

    function analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];

        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    }

    function monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(tinycolor({ h: h, s: s, v: v}));
            v = (v + modification) % 1;
        }

        return ret;
    }

    // Utility Functions
    // ---------------------

    tinycolor.mix = function(color1, color2, amount) {
        amount = (amount === 0) ? 0 : (amount || 50);

        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();

        var p = amount / 100;
        var w = p * 2 - 1;
        var a = rgb2.a - rgb1.a;

        var w1;

        if (w * a == -1) {
            w1 = w;
        } else {
            w1 = (w + a) / (1 + w * a);
        }

        w1 = (w1 + 1) / 2;

        var w2 = 1 - w1;

        var rgba = {
            r: rgb2.r * w1 + rgb1.r * w2,
            g: rgb2.g * w1 + rgb1.g * w2,
            b: rgb2.b * w1 + rgb1.b * w2,
            a: rgb2.a * p  + rgb1.a * (1 - p)
        };

        return tinycolor(rgba);
    };


    // Readability Functions
    // ---------------------
    // <http://www.w3.org/TR/AERT#color-contrast>

    // `readability`
    // Analyze the 2 colors and returns an object with the following properties:
    //    `brightness`: difference in brightness between the two colors
    //    `color`: difference in color/hue between the two colors
    tinycolor.readability = function(color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        var rgb1 = c1.toRgb();
        var rgb2 = c2.toRgb();
        var brightnessA = c1.getBrightness();
        var brightnessB = c2.getBrightness();
        var colorDiff = (
            Math.max(rgb1.r, rgb2.r) - Math.min(rgb1.r, rgb2.r) +
            Math.max(rgb1.g, rgb2.g) - Math.min(rgb1.g, rgb2.g) +
            Math.max(rgb1.b, rgb2.b) - Math.min(rgb1.b, rgb2.b)
        );

        return {
            brightness: Math.abs(brightnessA - brightnessB),
            color: colorDiff
        };
    };

    // `readable`
    // http://www.w3.org/TR/AERT#color-contrast
    // Ensure that foreground and background color combinations provide sufficient contrast.
    // *Example*
    //    tinycolor.isReadable("#000", "#111") => false
    tinycolor.isReadable = function(color1, color2) {
        var readability = tinycolor.readability(color1, color2);
        return readability.brightness > 125 && readability.color > 500;
    };

    // `mostReadable`
    // Given a base color and a list of possible foreground or background
    // colors for that base, returns the most readable color.
    // *Example*
    //    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
    tinycolor.mostReadable = function(baseColor, colorList) {
        var bestColor = null;
        var bestScore = 0;
        var bestIsReadable = false;
        for (var i=0; i < colorList.length; i++) {

            // We normalize both around the "acceptable" breaking point,
            // but rank brightness constrast higher than hue.

            var readability = tinycolor.readability(baseColor, colorList[i]);
            var readable = readability.brightness > 125 && readability.color > 500;
            var score = 3 * (readability.brightness / 125) + (readability.color / 500);

            if ((readable && ! bestIsReadable) ||
                (readable && bestIsReadable && score > bestScore) ||
                ((! readable) && (! bestIsReadable) && score > bestScore)) {
                bestIsReadable = readable;
                bestScore = score;
                bestColor = tinycolor(colorList[i]);
            }
        }
        return bestColor;
    };


    // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    // Make it easy to access colors via `hexNames[hex]`
    var hexNames = tinycolor.hexNames = flip(names);


    // Utilities
    // ---------

    // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = { };
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

    // Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    // Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

    // Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    // Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    // Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

    // Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
    // Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return (parseIntFromHex(h) / 255);
    }

    var matchers = (function() {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hsva.exec(color))) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    window.tinycolor = tinycolor;
    })();

    $(function () {
        if ($.fn.spectrum.load) {
            $.fn.spectrum.processNativeColorInputs();
        }
    });

});
