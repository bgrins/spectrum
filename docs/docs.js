
function updateBorders(color) {
    $("#docs-content").css("border-color", color.toHexString());
}

$(function() {

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
    move: updateBorders
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

$("#openWithLink").spectrum({
    color: "#dd3333",
    change: updateBorders,
    show: function() {
       
    },
    hide: function() {
       
    }
});

$("#showPalette").spectrum({
    showPalette: true,
    palette: [
        ['black', 'white', 'blanchedalmond'], 
        ['rgb(255, 128, 0);', 'hsv 100 70 50', 'lightyellow']
    ],
    change: updateBorders
});

var textPalette = ["rgb(255, 255, 255)", "rgb(204, 204, 204)", "rgb(192, 192, 192)", "rgb(153, 153, 153)", "rgb(102, 102, 102)", "rgb(51, 51, 51)", "rgb(0, 0, 0)", "rgb(255, 204, 204)", "rgb(255, 102, 102)", "rgb(255, 0, 0)", "rgb(204, 0, 0)", "rgb(153, 0, 0)", "rgb(102, 0, 0)", "rgb(51, 0, 0)", "rgb(255, 204, 153)", "rgb(255, 153, 102)", "rgb(255, 153, 0)", "rgb(255, 102, 0)", "rgb(204, 102, 0)", "rgb(153, 51, 0)", "rgb(102, 51, 0)", "rgb(255, 255, 153)", "rgb(255, 255, 102)", "rgb(255, 204, 102)", "rgb(255, 204, 51)", "rgb(204, 153, 51)", "rgb(153, 102, 51)", "rgb(102, 51, 51)", "rgb(255, 255, 204)", "rgb(255, 255, 51)", "rgb(255, 255, 0)", "rgb(255, 204, 0)", "rgb(153, 153, 0)", "rgb(102, 102, 0)", "rgb(51, 51, 0)", "rgb(153, 255, 153)", "rgb(102, 255, 153)", "rgb(51, 255, 51)", "rgb(51, 204, 0)", "rgb(0, 153, 0)", "rgb(0, 102, 0)", "rgb(0, 51, 0)", "rgb(153, 255, 255)", "rgb(51, 255, 255)", "rgb(102, 204, 204)", "rgb(0, 204, 204)", "rgb(51, 153, 153)", "rgb(51, 102, 102)", "rgb(0, 51, 51)", "rgb(204, 255, 255)", "rgb(102, 255, 255)", "rgb(51, 204, 255)", "rgb(51, 102, 255)", "rgb(51, 51, 255)", "rgb(0, 0, 153)", "rgb(0, 0, 102)", "rgb(204, 204, 255)", "rgb(153, 153, 255)", "rgb(102, 102, 204)", "rgb(102, 51, 255)", "rgb(102, 0, 204)", "rgb(51, 51, 153)", "rgb(51, 0, 153)", "rgb(255, 204, 255)", "rgb(255, 153, 255)", "rgb(204, 102, 204)", "rgb(204, 51, 204)", "rgb(153, 51, 153)", "rgb(102, 51, 102)", "rgb(51, 0, 51)"];

$("#showPaletteOnly").spectrum({
    showPaletteOnly: true,
    maxPaletteSize: textPalette.length,
    palette: textPalette
});

$("#showInitial").spectrum({
    showInitial: true
});

$("#showInputAndInitial").spectrum({
    showInitial: true,
    showInput: true
});


$("#changeOnMove").spectrum({ 
    move: function(c) {
        var label = $("#changeOnMoveLabel");
        label.text("Move called: " + c.toHexString());
    } 
});
$("#changeOnMoveNo").spectrum({
    change: function(c) {
        var label = $("#changeOnMoveNoLabel");
        label.text("Change called: " + c.toHexString());
    }
});

$(".basic").spectrum({ change: updateBorders });
$(".basic1").spectrum({ change: updateBorders });

$("#beforeShow").spectrum({
    beforeShow: function() {
        return false;
    }
});
prettyPrint();

$('#toc').toc({
    'selectors': 'h2,h3', //elements to use as headings
    'container': '#docs', //element to find all selectors in
    'smoothScrolling': true, //enable or disable smooth scrolling on click
    'prefix': 'toc', //prefix for anchor tags and class names
    'highlightOnScroll': true, //add class to heading that is currently in focus
    'highlightOffset': 100, //offset to trigger the next headline
    'anchorName': function(i, heading, prefix) { //custom function for anchor name
        return prefix+i;
    } 
});


});