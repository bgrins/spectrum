
$(function() {

    var colorpickerInput = $("#full");


    function toggleButtonState() {
        var options = colorpickerInput.spectrum("option");
        $(".toggleBtn").each(function() {
            $(this).toggleClass("active", !!options[$(this).data("rule")]);
        });
    }

    $(document).on("click", ".toggleBtn", function() {
        var option = $(this).data("rule");
        var existing = colorpickerInput.spectrum("option", option);

        colorpickerInput.spectrum("option", option, !existing);
        toggleButtonState();
    });

    colorpickerInput.spectrum({
        color: "#ECC",
        flat: true,
        showInput: true,
        className: "full-spectrum",
        showInitial: true,
        showPalette: true,
        showSelectionPalette: true,
        maxPaletteSize: 10,
        preferredFormat: "hex",
        localStorageKey: "spectrum.example",
        move: function (color) {
        },
        show: function () {

        },
        beforeShow: function () {

        },
        hide: function (color) {
        },

        palette: [
            ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", /*"rgb(153, 153, 153)","rgb(183, 183, 183)",*/
            "rgb(204, 204, 204)", "rgb(217, 217, 217)", /*"rgb(239, 239, 239)", "rgb(243, 243, 243)",*/ "rgb(255, 255, 255)"],
            ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
            "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
            ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
            "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
            "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
            "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
            "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
            "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
            "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
            "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
            /*"rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)",
            "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)",*/
            "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
            "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
        ]
    });

    $("#size").change(function() {
        var size = Math.min(500, Math.max(50, $(this).val()));
        $(".sp-picker-container").width(size);

        colorpickerInput.spectrum("reflow");
    });

    $("#huesize").change(function() {
        var size = Math.min(80, Math.max(5, $(this).val()));

        $(".sp-hue").css("left", (103 - size) + "%");
        $(".sp-color").css("right", size + "%");
        $(".sp-fill").css("padding-top", (100 - size) + "%");

        colorpickerInput.spectrum("reflow");
    });

    toggleButtonState();

});



var palettes = { };


palettes.newGmail =  [["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]];

palettes.default = [
    ["#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff"],
    ["#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"],
    ["#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d9ead3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"],
    ["#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
    ["#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0"],
    ["#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79"],
    ["#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47"],
    ["#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130"]
];

palettes.snagit = [
    ["#ffffff", "#000000", "#c00000", "#f79646", "#f5f445", "#7fd13b", "#4bacc6", "#1f497d", "#8064a2", "#ff0000"],
    ["#f2f2f2", "#7f7f7f", "#f8d1d3", "#fdeada", "#fafdd7", "#e5f5d7", "#dbeef3", "#c6d9f0", "#e5e0ec", "#ffcc00"],
    ["#d7d7d7", "#595959", "#f2a3a7", "#fbd5b5", "#fbfaae", "#cbecb0", "#b7dde8", "#8db3e2", "#ccc1d9", "#ffff00"],
    ["#bebebe", "#414141", "#eb757b", "#fac08f", "#eef98e", "#b2e389", "#92cddc", "#548dd4", "#b2a2c7", "#00ff00"],
    ["#a3a3a3", "#2a2a2a", "#a3171e", "#e36c09", "#dede07", "#5ea226", "#31859b", "#17365d", "#5f497a", "#0000ff"],
    ["#7e7e7e", "#141414", "#6d0f14", "#974806", "#c0c00d", "#3f6c19", "#205867", "#0f243e", "#3f3151", "#9900ff"]
];

palettes.newton = [

    "#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"

];

palettes.aol = [

    ["#ffffff", "#fff7de", "#ffffce", "#ffffbd", "#ffffd6", "#b5ff84", "#c6efde", "#efffff", "#efe7f7", "#dea5d6"],
    ["#ded6c6", "#ffc6bd", "#ffe7b5", "#ffe7a5", "#efef7b", "#adf77b", "#5abd9c", "#a5d6f7", "#8494e7", "#ef7be7"],
    ["#cec6b5", "#e78473", "#efad52", "#f7b500", "#efef9c", "#a5ff00", "#7bd6bd", "#a5d6de", "#8c5ae7", "#de6bce"],
    ["#8c8473", "#ef0018", "#ef4210", "#f79400", "#ffff00", "#63d600", "#a5c684", "#5a63d6", "#7b52c6", "#c642ce"],
    ["#736b63", "#d60039", "#d67310", "#f7844a", "#f7de00", "#429400", "#4a944a", "#4200ff", "#9c00de", "#a500c6"],
    ["#39524a", "#b51821", "#944a08", "#a55229", "#8c8c00", "#318c00", "#429484", "#3100c6", "#523984", "#940084"],
    ["#000000", "#940008", "#840008", "#ad2929", "#637321", "#296b00", "#29006b", "#21007b", "#52007b", "#84007b"]


];

palettes.oldGmail = [
    ["#ffffff", "#cecece", "#c6c6c6", "#9c9c9c", "#636363", "#313131", "#000000"],
    ["#ffcece", "#ff6363", "#ff0000", "#ce0000", "#9c0000", "#630000", "#310000"],
    ["#ffce9c", "#ff9c63", "#ff9c00", "#ff6300", "#ce6300", "#9c3100", "#633100"],
    ["#ffff9c", "#ffff63", "#ffce63", "#ffce31", "#ce9c31", "#9c6331", "#633131"],
    ["#ffffce", "#ffff31", "#ffff00", "#ffce00", "#9c9c00", "#636300", "#313100"],
    ["#9cff9c", "#63ff9c", "#31ff31", "#31ce00", "#009c00", "#006300", "#003100"],
    ["#9cffff", "#31ffff", "#63cece", "#00cece", "#319c9c", "#316363", "#003131"],
    ["#ceffff", "#63ffff", "#31ceff", "#3163ff", "#3131ff", "#00009c", "#000063"],
    ["#ceceff", "#9c9cff", "#6363ce", "#6331ff", "#6300ce", "#31319c", "#31009c"],
    ["#ffceff", "#ff9cff", "#ce63ce", "#ce31ce", "#9c319c", "#633163", "#310031"]


];
palettes.hotmail = [
    ["#ffffff", "#000000", "#efefe7", "#184a7b", "#4a84bd", "#c6524a", "#9cbd5a", "#8463a5", "#4aadc6", "#f79442"],
    ["#f7f7f7", "#7b7b7b", "#dedec6", "#c6def7", "#dee7f7", "#f7dede", "#eff7de", "#e7e7ef", "#deeff7", "#ffefde"],
    ["#dedede", "#5a5a5a", "#c6bd94", "#8cb5e7", "#bdcee7", "#e7bdb5", "#d6e7bd", "#cec6de", "#b5deef", "#ffd6b5"],
    ["#bdbdbd", "#393939", "#948c52", "#528cd6", "#94b5d6", "#de9494", "#c6d69c", "#b5a5c6", "#94cede", "#ffc68c"],
    ["#a5a5a5", "#212121", "#4a4229", "#10315a", "#316394", "#943131", "#739439", "#5a4a7b", "#31849c", "#e76b08"],
    ["#848484", "#080808", "#181810", "#082139", "#214263", "#632121", "#4a6329", "#393152", "#215a63", "#944a00"],
    ["#c60000", "#ff0000", "#ffc600", "#ffff00", "#94d652", "#00b552", "#00b5f7", "#0073c6", "#002163", "#7331a5"],

];
palettes.yahoo = [

    ["#000000", "#111111", "#2d2d2d", "#434343", "#5b5b5b", "#737373", "#8b8b8b", "#a2a2a2", "#b9b9b9", "#d0d0d0", "#e6e6e6", "#ffffff"],
    ["#7f7f00", "#bfbf00", "#ffff00", "#ffff40", "#ffff80", "#ffffbf", "#525330", "#898a49", "#aea945", "#c3be71", "#e0dcaa", "#fcfae1"],
    ["#407f00", "#60bf00", "#80ff00", "#a0ff40", "#c0ff80", "#dfffbf", "#3b5738", "#668f5a", "#7f9757", "#8a9b55", "#b7c296", "#e6ebd5"],
    ["#007f40", "#00bf60", "#00ff80", "#40ffa0", "#80ffc0", "#bfffdf", "#033d21", "#438059", "#7fa37c", "#8dae94", "#acc6b5", "#ddebe2"],
    ["#007f7f", "#00bfbf", "#00ffff", "#40ffff", "#80ffff", "#bfffff", "#033d3d", "#347d7e", "#609a9f", "#96bdc4", "#b5d1d7", "#e2f1f4"],
    ["#00407f", "#0060bf", "#0080ff", "#40a0ff", "#80c0ff", "#bfdfff", "#1b2c48", "#385376", "#57708f", "#7792ac", "#a8bed1", "#deebf6"],
    ["#00007f", "#0000bf", "#0000ff", "#4040ff", "#8080ff", "#bfbfff", "#212143", "#373e68", "#444f75", "#585e82", "#8687a4", "#d2d1e1"],
    ["#40007f", "#6000bf", "#8000ff", "#a040ff", "#c080ff", "#dfbfff", "#302449", "#54466f", "#655a7f", "#726284", "#9e8fa9", "#dcd1df"],
    ["#7f007f", "#bf00bf", "#ff00ff", "#ff40ff", "#ff80ff", "#ffbfff", "#4a234a", "#794a72", "#936386", "#9d7292", "#c0a0b6", "#ecdae5"],
    ["#7f003f", "#bf005f", "#ff007f", "#ff409f", "#ff80bf", "#ffbfdf", "#451528", "#823857", "#a94a76", "#bc6f95", "#d8a5bb", "#f7dde9"],
    ["#800000", "#c00000", "#ff0000", "#ff4040", "#ff8080", "#ffc0c0", "#441415", "#82393c", "#aa4d4e", "#bc6e6e", "#d8a3a4", "#f8dddd"],
    ["#7f3f00", "#bf5f00", "#ff7f00", "#ff9f40", "#ffbf80", "#ffdfbf", "#482c1b", "#855a40", "#b27c51", "#c49b71", "#e1c4a8", "#fdeee0"]

];
palettes.sixteen = [
    ["#000000", "#000084", "#0000ff", "#840000"],
    ["#840084", "#008200", "#ff0000", "#008284"],
    ["#ff00ff", "#848200", "#848284", "#00ff00"],
    ["#ffa600", "#00ffff", "#c6c3c6", "#ffff00"],
    ["#ffffff"]
];

palettes.websafe = [
    ["#000", "#300", "#600", "#900", "#c00", "#f00"],
    ["#003", "#303", "#603", "#903", "#c03", "#f03"],
    ["#006", "#306", "#606", "#906", "#c06", "#f06"],
    ["#009", "#309", "#609", "#909", "#c09", "#f09"],
    ["#00c", "#30c", "#60c", "#90c", "#c0c", "#f0c"],
    ["#00f", "#30f", "#60f", "#90f", "#c0f", "#f0f"],
    ["#030", "#330", "#630", "#930", "#c30", "#f30"],
    ["#033", "#333", "#633", "#933", "#c33", "#f33"],
    ["#036", "#336", "#636", "#936", "#c36", "#f36"],
    ["#039", "#339", "#639", "#939", "#c39", "#f39"],
    ["#03c", "#33c", "#63c", "#93c", "#c3c", "#f3c"],
    ["#03f", "#33f", "#63f", "#93f", "#c3f", "#f3f"],
    ["#060", "#360", "#660", "#960", "#c60", "#f60"],
    ["#063", "#363", "#663", "#963", "#c63", "#f63"],
    ["#066", "#366", "#666", "#966", "#c66", "#f66"],
    ["#069", "#369", "#669", "#969", "#c69", "#f69"],
    ["#06c", "#36c", "#66c", "#96c", "#c6c", "#f6c"],
    ["#06f", "#36f", "#66f", "#96f", "#c6f", "#f6f"],
    ["#090", "#390", "#690", "#990", "#c90", "#f90"],
    ["#093", "#393", "#693", "#993", "#c93", "#f93"],
    ["#096", "#396", "#696", "#996", "#c96", "#f96"],
    ["#099", "#399", "#699", "#999", "#c99", "#f99"],
    ["#09c", "#39c", "#69c", "#99c", "#c9c", "#f9c"],
    ["#09f", "#39f", "#69f", "#99f", "#c9f", "#f9f"],
    ["#0c0", "#3c0", "#6c0", "#9c0", "#cc0", "#fc0"],
    ["#0c3", "#3c3", "#6c3", "#9c3", "#cc3", "#fc3"],
    ["#0c6", "#3c6", "#6c6", "#9c6", "#cc6", "#fc6"],
    ["#0c9", "#3c9", "#6c9", "#9c9", "#cc9", "#fc9"],
    ["#0cc", "#3cc", "#6cc", "#9cc", "#ccc", "#fcc"],
    ["#0cf", "#3cf", "#6cf", "#9cf", "#ccf", "#fcf"],
    ["#0f0", "#3f0", "#6f0", "#9f0", "#cf0", "#ff0"],
    ["#0f3", "#3f3", "#6f3", "#9f3", "#cf3", "#ff3"],
    ["#0f6", "#3f6", "#6f6", "#9f6", "#cf6", "#ff6"],
    ["#0f9", "#3f9", "#6f9", "#9f9", "#cf9", "#ff9"],
    ["#0fc", "#3fc", "#6fc", "#9fc", "#cfc", "#ffc"],
    ["#0ff", "#3ff", "#6ff", "#9ff", "#cff", "#fff"]
];


palettes.named = [
    ["White", "Ivory", "Snow", "LightYellow", "MintCream", "Azure", "FloralWhite", "Honeydew", "GhostWhite", "Seashell", "Cornsilk", "AliceBlue", "LemonChiffon", "LightCyan"],
    ["OldLace", "LightGoldenrodYellow", "LavenderBlush", "WhiteSmoke", "Beige", "Linen", "PapayaWhip", "BlanchedAlmond", "AntiqueWhite", "MistyRose", "Bisque", "Lavender", "Moccasin", "PaleGoldenrod"],
    ["NavajoWhite", "Yellow", "PeachPuff", "Wheat", "Khaki", "Gainsboro", "PaleTurquoise", "Pink", "Aquamarine", "LightGray", "PowderBlue", "PaleGreen", "GreenYellow", "LightPink"],
    ["LightBlue", "Gold", "Thistle", "LightGreen", "LightSteelBlue", "Silver", "LightSkyBlue", "BurlyWood", "SkyBlue", "Chartreuse", "Plum", "LawnGreen", "Tan", "LightSalmon"],
    ["SandyBrown", "Cyan", "Aqua", "DarkKhaki", "Violet", "Turquoise", "Orange", "YellowGreen", "DarkSalmon", "MediumAquamarine", "DarkSeaGreen", "DarkGray", "MediumTurquoise", "Goldenrod"],
    ["MediumSpringGreen", "SpringGreen", "Salmon", "LightCoral", "Coral", "DarkOrange", "HotPink", "RosyBrown", "Orchid", "Lime", "PaleVioletRed", "Peru", "DarkTurquoise", "CornflowerBlue"],
    ["Tomato", "DeepSkyBlue", "LimeGreen", "CadetBlue", "MediumSeaGreen", "DarkGoldenrod", "MediumPurple", "LightSeaGreen", "LightSlateGray", "MediumOrchid", "Gray", "Chocolate", "IndianRed", "SlateGray"],
    ["MediumSlateBlue", "DodgerBlue", "OliveDrab", "SteelBlue", "OrangeRed", "Olive", "SlateBlue", "RoyalBlue", "Magenta", "Fuchsia", "SeaGreen", "DimGray", "DeepPink", "Sienna"],
    ["DarkOrchid", "DarkCyan", "ForestGreen", "DarkOliveGreen", "BlueViolet", "Teal", "MediumVioletRed", "Crimson", "SaddleBrown", "Brown", "FireBrick", "Red", "Green", "DarkSlateBlue"],
    ["DarkSlateGray", "DarkViolet", "DarkGreen", "DarkMagenta", "Purple", "DarkRed", "Maroon", "Indigo", "MidnightBlue", "Blue", "MediumBlue", "DarkBlue", "Navy", "Black"]
];



$(function() {
  for (var i in palettes) {
    $("<h3 />").text(i).appendTo("#palettes");
    $("<input />").appendTo("#palettes").spectrum({
      flat: true,
      showInput: true,
      className: i,
      preferredFormat: "rgb",
      showPalette: true,
      showPaletteOnly: true,
      palette: palettes[i]
    });
  }
});

$(function() {
    $("#langdemo").spectrum({
      flat: false,
      showInput: true,
    });
});