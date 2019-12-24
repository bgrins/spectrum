function updateBorders(color) {
    // do nothing
}

$(function() {

$('pre').each(function() { hljs.highlightBlock(this) });

$('#toc').toc({
    'selectors': 'h1,h2:not(.subtitle),h3', //elements to use as headings
    'container': '.main-container', //element to find all selectors in
    'smoothScrolling': true, //enable or disable smooth scrolling on click
    'prefix': 'toc', //prefix for anchor tags and class names
    'highlightOnScroll': true, //add class to heading that is currently in focus
    'highlightOffset': 100, //offset to trigger the next headline
    'anchorName': function(i, heading, prefix) { //custom function for anchor name
        return heading.id || prefix+i;
    }
});

// ----- CONFIGURATOR -----
$('.configurator-renderer input').spectrum();
var colorpickerInput = $("#color-picker");

initConfigurator();
updateColorPickerAndJavascriptCode();

$('.configurator-container').find('input[type=radio], input[type=checkbox]').click(function() {
    updateColorPickerAndJavascriptCode();
});

function initConfigurator() {
    $('.configurator-container input[type=checkbox]').each(function() {
        var value = colorpickerInput.spectrum('option', $(this).data("rule"));
        $(this).prop('checked', value);
    });
    var type = colorpickerInput.spectrum('option', 'type');
    $('.configurator-container input[name=type]').val([type]);
}

function updateColorPickerAndJavascriptCode() {
    colorpickerInput.off();
    colorpickerInput.change(function() {
        document.documentElement.style.setProperty('--primary-color',  $(this).val());
    });
    var options = {
        type: $('.configurator-container input[name=type]:checked').val()
    };
    $('.configurator-container input[type=checkbox]').each(function() {
        var optionName = $(this).data("rule");
        var value = $(this).is('[type=checkbox]') ? $(this).is(':checked') : $(this).val();
        options[optionName] = value;
    })

    var javascriptCode = "$('#color-picker').spectrum({";
    var optionsCount = 0;
    for(var i in options) {
        if (options[i] != $.fn.spectrum.defaults[i]) {
            optionsCount++;
            javascriptCode += "\n  " + i + ': "' + options[i] + '",';
        }
    }
    if (optionsCount > 0) {
        javascriptCode = javascriptCode.slice(0, -1); // remove last ",\n"
        javascriptCode += '\n';
    }
    javascriptCode += "});";
    $('pre#sp-options').html(javascriptCode);
    hljs.highlightBlock($('pre#sp-options')[0]);

    colorpickerInput.spectrum(options);
}
// ----- END CONFIGURATOR -----

$("#hideButtons").spectrum({
    showButtons: false,
    change: updateBorders
});


var isDisabled = true;
$("#toggle-disabled").click(function() {
    if (isDisabled) {
        $("#disabled").spectrum("enable");
    }
    else {
        $("#disabled").spectrum("disable");
    }
    isDisabled = !isDisabled;
    return false;
});

$("input:disabled").spectrum({

});
$("#disabled").spectrum({
    disabled: true
});

$("#pick1").spectrum({
    flat: true,
    change: function(color) {
        var hsv = color.toHsv();
        var rgb = color.toRgbString();
        var hex = color.toHexString();
        //console.log("callback",color.toHslString(), color.toHsl().h, color.toHsl().s, color.toHsl().l)
        $("#docs-content").css({
            'background-color': color.toRgbString()
        }).toggleClass("dark", hsv.v < .5);
        $("#switch-current-rgb").text(rgb);
        $("#switch-current-hex").text(hex);
    },
    show: function() {

    },
    hide: function() {

    },
    showInput: true,
    showPalette: true,
    palette: ['white', '#306', '#c5c88d', '#ac5c5c', '#344660']
});

$("#collapsed").spectrum({
    color: "#dd3333",
    change: updateBorders,
    show: function() {

    },
    hide: function() {

    }
});

$("#flat").spectrum({
    flat: true,
    showInput: true,
    move: updateBorders
});

$("#flatClearable").spectrum({
    flat: true,
    move: updateBorders,
    change: updateBorders,
    allowEmpty:true,
    showInput: true
});

$("#showInput").spectrum({
    color: "#dd33dd",
    showInput: true,
    change: updateBorders,
    show: function() {

    },
    hide: function() {

    }
});

$("#showAlpha").spectrum({
    color: "rgba(255, 128, 0, .5)",
    showAlpha: true,
    change: updateBorders
});

$("#showAlphaWithInput").spectrum({
    color: "rgba(255, 128, 0, .5)",
    showAlpha: true,
    showInput: true,
    showPalette: true,
    palette: [
        ["rgba(255, 128, 0, .9)", "rgba(255, 128, 0, .5)"],
        ["red", "green", "blue"],
        ["hsla(25, 50, 75, .5)", "rgba(100, .5, .5, .8)"]
    ],
    change: updateBorders
});

$("#showAlphaWithInputAndEmpty").spectrum({
    color: "rgba(255, 128, 0, .5)",
    allowEmpty:true,
    showAlpha: true,
    showInput: true,
    showPalette: true,
    palette: [
        ["rgba(255, 128, 0, .9)", "rgba(255, 128, 0, .5)"],
        ["red", "green", "blue"],
        ["hsla(25, 50, 75, .5)", "rgba(100, .5, .5, .8)"]
    ],
    change: updateBorders
});

$("#showInputWithClear").spectrum({
    allowEmpty:true,
    color: "",
    showInput: true,
    change: updateBorders,
    show: function() {

    },
    hide: function() {

    }
});

$("#openWithLink").spectrum({
    color: "#dd3333",
    change: updateBorders,
    show: function() {

    },
    hide: function() {

    }
});

$("#className").spectrum({
    className: 'awesome'
});

$("#replacerClassName").spectrum({
    replacerClassName: 'awesome'
});

$("#containerClassName").spectrum({
    containerClassName: 'awesome'
});

$("#showPalette").spectrum({
    showPalette: true,
    palette: [
        ['black', 'white', 'blanchedalmond'],
        ['rgb(255, 128, 0);', 'hsv 100 70 50', 'lightyellow']
    ],
    hide: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Hidden: " + c.toHexString());
    },
    change: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Change called: " + c.toHexString());
    },
    move: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Move called: " + c.toHexString());
    }
});

var textPalette = ["rgb(255, 255, 255)", "rgb(204, 204, 204)", "rgb(192, 192, 192)", "rgb(153, 153, 153)", "rgb(102, 102, 102)", "rgb(51, 51, 51)", "rgb(0, 0, 0)", "rgb(255, 204, 204)", "rgb(255, 102, 102)", "rgb(255, 0, 0)", "rgb(204, 0, 0)", "rgb(153, 0, 0)", "rgb(102, 0, 0)", "rgb(51, 0, 0)", "rgb(255, 204, 153)", "rgb(255, 153, 102)", "rgb(255, 153, 0)", "rgb(255, 102, 0)", "rgb(204, 102, 0)", "rgb(153, 51, 0)", "rgb(102, 51, 0)", "rgb(255, 255, 153)", "rgb(255, 255, 102)", "rgb(255, 204, 102)", "rgb(255, 204, 51)", "rgb(204, 153, 51)", "rgb(153, 102, 51)", "rgb(102, 51, 51)", "rgb(255, 255, 204)", "rgb(255, 255, 51)", "rgb(255, 255, 0)", "rgb(255, 204, 0)", "rgb(153, 153, 0)", "rgb(102, 102, 0)", "rgb(51, 51, 0)", "rgb(153, 255, 153)", "rgb(102, 255, 153)", "rgb(51, 255, 51)", "rgb(51, 204, 0)", "rgb(0, 153, 0)", "rgb(0, 102, 0)", "rgb(0, 51, 0)", "rgb(153, 255, 255)", "rgb(51, 255, 255)", "rgb(102, 204, 204)", "rgb(0, 204, 204)", "rgb(51, 153, 153)", "rgb(51, 102, 102)", "rgb(0, 51, 51)", "rgb(204, 255, 255)", "rgb(102, 255, 255)", "rgb(51, 204, 255)", "rgb(51, 102, 255)", "rgb(51, 51, 255)", "rgb(0, 0, 153)", "rgb(0, 0, 102)", "rgb(204, 204, 255)", "rgb(153, 153, 255)", "rgb(102, 102, 204)", "rgb(102, 51, 255)", "rgb(102, 0, 204)", "rgb(51, 51, 153)", "rgb(51, 0, 153)", "rgb(255, 204, 255)", "rgb(255, 153, 255)", "rgb(204, 102, 204)", "rgb(204, 51, 204)", "rgb(153, 51, 153)", "rgb(102, 51, 102)", "rgb(51, 0, 51)"];

$("#showPaletteOnly").spectrum({
    color: 'blanchedalmond',
    showPaletteOnly: true,
    showPalette:true,
    palette: [
        ['black', 'white', 'blanchedalmond',
        'rgb(255, 128, 0);', 'hsv 100 70 50'],
        ['red', 'yellow', 'green', 'blue', 'violet']
    ],
    change: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Change called: " + c.toHexString());
    },
    move: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Move called: " + c.toHexString());
    }
});

$("#hideAfterPaletteSelect").spectrum({
    showPaletteOnly: true,
    showPalette:true,
    hideAfterPaletteSelect:true,
    color: 'blanchedalmond',
    palette: [
        ['black', 'white', 'blanchedalmond',
        'rgb(255, 128, 0);', 'hsv 100 70 50'],
        ['red', 'yellow', 'green', 'blue', 'violet']
    ],
    change: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Change called: " + c.toHexString());
    },
    move: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Move called: " + c.toHexString());
    }
});

$("#togglePaletteOnly").spectrum({
    color: 'blanchedalmond',
    showPaletteOnly: true,
    togglePaletteOnly: true,
    showPalette:true,
    palette: [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
    ]
});

$("#clickoutFiresChange").spectrum({
    change: updateBorders
});

$("#clickoutDoesntFireChange").spectrum({
    change: updateBorders,
    clickoutFiresChange: false
});

$("#showInitial").spectrum({
    showInitial: true
});

$("#showInputAndInitial").spectrum({
    showInitial: true,
    showInput: true
});

$("#showInputInitialClear").spectrum({
    allowEmpty:true,
    showInitial: true,
    showInput: true
});

$("#changeOnMove").spectrum({
    move: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Move called: " + c.toHexString());
    }
});
$("#changeOnMoveNo").spectrum({
    showInput: true,
    change: function(c) {
        var label = $("[data-label-for=" + this.id + "]");
        label.text("Change called: " + c.toHexString());
    }
});

function prettyTime() {
    var date = new Date();

    return date.toLocaleTimeString();
}

$("#eventshow").spectrum({
    show: function(c) {
        var label = $("#eventshowLabel");
        label.text("show called at " + prettyTime() + " (color is " + c.toHexString() + ")");
    }
});

$("#eventhide").spectrum({
    hide: function(c) {
        var label = $("#eventhideLabel");
        label.text("hide called at " + prettyTime() + " (color is " + c.toHexString() + ")");
    }
});

$("#eventdragstart").spectrum({
    showAlpha: true
}).on("dragstart.spectrum", function(e, c) {
    var label = $("#eventdragstartLabel");
    label.text("dragstart called at " + prettyTime() + " (color is " + c.toHexString() + ")");
});

$("#eventdragstop").spectrum({
    showAlpha: true
}).on("dragstop.spectrum", function(e, c) {
    var label = $("#eventdragstopLabel");
    label.text("dragstop called at " + prettyTime() + " (color is " + c.toHexString() + ")");
});


$(".basic").spectrum({ change: updateBorders });
$(".override").spectrum({
    color: "yellow",
    change: updateBorders
});

$(".startEmpty").spectrum({
    allowEmpty:true,
    change: updateBorders});

$("#beforeShow").spectrum({
    beforeShow: function() {
        return false;
    }
});


$("#custom").spectrum({
    color: "#f00"
});

$("#buttonText").spectrum({
    locale: 'fr',
    chooseText: "OK!"
});


$("#showSelectionPalette").spectrum({
    showPalette: true,
    showSelectionPalette: true, // true by default
    palette: [ ]
});
$("#showSelectionPaletteStorage").spectrum({
    showPalette: true,
    localStorageKey: "spectrum.homepage", // Any picker with the same string will share selection
    showSelectionPalette: true,
    palette: [ ]
});
$("#showSelectionPaletteStorage2").spectrum({
    showPalette: true,
    localStorageKey: "spectrum.homepage", // Any picker with the same string will share selection
    showSelectionPalette: true,
    palette: [ ]
});

$("#selectionPalette").spectrum({
    showPalette: true,
    palette: [ ],
    showSelectionPalette: true, // true by default
    selectionPalette: ["red", "green", "blue"]
});

$("#maxSelectionSize").spectrum({
    showPalette: true,
    palette: [ ],
    showSelectionPalette: true, // true by default
    selectionPalette: ["red", "green", "blue"],
    maxSelectionSize: 2
});

$("#preferredHex").spectrum({
    preferredFormat: "hex",
    showInput: true,
    showPalette: true,
    palette: [["red", "rgba(0, 255, 0, .5)", "rgb(0, 0, 255)"]]
});
$("#preferredHex3").spectrum({
    preferredFormat: "hex3",
    showInput: true,
    showPalette: true,
    palette: [["red", "rgba(0, 255, 0, .5)", "rgb(0, 0, 255)"]]
});
$("#preferredHsl").spectrum({
    preferredFormat: "hsl",
    showInput: true,
    showPalette: true,
    palette: [["red", "rgba(0, 255, 0, .5)", "rgb(0, 0, 255)"]]
});
$("#preferredRgb").spectrum({
    preferredFormat: "rgb",
    showInput: true,
    showPalette: true,
    palette: [["red", "rgba(0, 255, 0, .5)", "rgb(0, 0, 255)"]]
});
$("#preferredName").spectrum({
    preferredFormat: "name",
    showInput: true,
    showPalette: true,
    palette: [["red", "rgba(0, 255, 0, .5)", "rgb(0, 0, 255)"]]
});
$("#preferredNone").spectrum({
    showInput: true,
    showPalette: true,
    palette: [["red", "rgba(0, 255, 0, .5)", "rgb(0, 0, 255)"]]
});

$("#triggerSet").spectrum({
    change: updateBorders
});

// Show the original input to demonstrate the value changing when calling `set`
$("#triggerSet").show();

$("#btnEnterAColor").click(function() {
    $("#triggerSet").spectrum("set", $("#enterAColor").val());
});

$("#toggle").spectrum();
$("#btn-toggle").click(function() {
    $("#toggle").spectrum("toggle");
    return false;
});

});
