// Spectrum Colorpicker Tests
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT


module("Initialization");

test( "jQuery Plugin Can Be Created", function() {
  var el = $("<input id='spec' />").spectrum();

  ok(el.attr("id") === "spec", "Element returned from plugin" );

  el.spectrum("set", "red");
  equal(el.spectrum("get").toName(), "red", "Basic color setting");

  equal(el.spectrum("option", "showInput"), false, "Undefined option is false.");

  el.spectrum({showInput: true});

  equal(el.spectrum("option", "showInput"), true, "Double initialized spectrum is destroyed before recreating.");

  el.spectrum("destroy");

  equal(el.spectrum("container"), el, "After destroying spectrum, string function returns input.");

});

test( "Per-element Options Are Read From Data Attributes", function() {
  var el = $("<input id='spec' data-show-alpha='true' />").spectrum();

  equal ( el.spectrum("option", "showAlpha"), true, "Took showAlpha value from data attribute");

  el.spectrum("destroy");

  var changeDefault = $("<input id='spec' data-show-alpha='false' />").spectrum({
    showAlpha: true
  });

  equal ( changeDefault.spectrum("option", "showAlpha"), false, "Took showAlpha value from data attribute");

  changeDefault.spectrum("destroy");

  var noData = $("<input id='spec' />").spectrum({
    showAlpha: true
  });

  equal ( noData.spectrum("option", "showAlpha"), true, "Kept showAlpha without data attribute");

  noData.spectrum("destroy");
});

test( "Events Fire", function() {
  var el = $("<input id='spec' />").spectrum();
  var count = 0;
  expect(5);

  el.on("beforeShow.spectrum", function(e) {

    // Cancel the event the first time
    if (count === 0) {
      ok(true, "Cancel beforeShow");
      count++;
      return false;
    }

    ok (count === 1, "Allow beforeShow");
    count++;
  });


  el.on("show.spectrum", function(e) {
    ok(count === 2, "Show");
    count++;
  });

  el.on("hide.spectrum", function(e) {
    ok(count === 3, "Hide");

    count++;
  });

  el.on("move.spectrum", function(e) {

  });

  el.on("change", function(e, color) {
    ok(false, "Change should not fire from `set` call");
  });

  el.spectrum("show");
  el.spectrum("show");
  el.spectrum("hide");

  el.spectrum("set", "red");

  el.spectrum("destroy");

  var el2 = $("<input />").spectrum({
    showInput: true
  });
  el2.on("change.spectrum", function(e, color) {
    ok(true, "Change should fire input changing");
  });
  el2.spectrum("container").find(".sp-input").val("blue").trigger("change");
  el2.spectrum("destroy");
});

module("Defaults");

test( "Default Color Is Set By Input Value", function() {

  var red = $("<input id='spec' value='red' />").spectrum();
  equal ( red.spectrum("get").toName(), "red", "Basic color setting");

  var noColor = $("<input id='spec' value='not a color' />").spectrum();
  equal ( noColor.spectrum("get").toHex(), "000000", "Defaults to black with an invalid color");

  var noValue = $("<input id='spec' />").spectrum();
  equal ( noValue.spectrum("get").toHex(), "000000", "Defaults to black with no value set");

  var noValueHex3 = $("<input id='spec' />").spectrum({
    preferredFormat: "hex3"
  });
  equal ( noValueHex3.spectrum("get").toHex(true), "000", "Defaults to 3 char hex with no value set");
  equal ( noValueHex3.spectrum("get").toString(), "#000", "Defaults to 3 char hex with no value set");


  red.spectrum("destroy");
  noColor.spectrum("destroy");
  noValue.spectrum("destroy");
  noValueHex3.spectrum("destroy");
});

module("Palettes");

test( "Palette Events Fire In Correct Order ", function() {
  expect(2);
  var el = $("<input id='spec' value='red' />").spectrum({
    showPalette: true,
    palette: [
      ["red", "green", "blue"]
    ],
    move: function() {

    },
  });

  var count = 0;
  el.on("move.spectrum", function(e) {
    ok(count === 0, "move fires before change");
    count++;
  });

  el.on("change.spectrum", function(e) {
    ok(count === 1, "change fires after move");
  });

  el.spectrum("container").find(".sp-thumb-el:last-child").click();
  el.spectrum("destroy");
});

test( "Local Storage Is Limited ", function() {

  var el = $("<input id='spec' value='red' />").spectrum({
    localStorageKey: "spectrum.tests",
    palette: [["#ff0", "#0ff"]],
    maxSelectionSize: 3
  });

  el.spectrum("set", "#f00");
  el.spectrum("set", "#e00");
  el.spectrum("set", "#d00");
  el.spectrum("set", "#c00");
  el.spectrum("set", "#b00");
  el.spectrum("set", "#a00");

  equal (
    localStorage["spectrum.tests"],
    "rgb(204, 0, 0);rgb(187, 0, 0);rgb(170, 0, 0)",
    "Local storage array has been limited"
  );

  el.spectrum("set", "#ff0");
  el.spectrum("set", "#0ff");

  equal (
    localStorage["spectrum.tests"],
    "rgb(204, 0, 0);rgb(187, 0, 0);rgb(170, 0, 0)",
    "Local storage array did not get changed by selecting palette items"
  );
  el.spectrum("destroy");

});

module("Options");

test ("replacerClassName", function() {
  var el = $("<input />").appendTo("body").spectrum({
    replacerClassName: "test"
  });
  ok (el.next(".sp-replacer").hasClass("test"), "Replacer class has been applied");
  el.spectrum("destroy").remove();
});

test ("containerClassName", function() {
  var el = $("<input />").appendTo("body").spectrum({
    containerClassName: "test"
  });
  ok (el.spectrum("container").hasClass("test"), "Container class has been applied");
  el.spectrum("destroy").remove();
});

test( "Options Can Be Set and Gotten Programmatically", function() {

  var spec = $("<input id='spec' />").spectrum({
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
    palette: [['red'], ['green']]
  });

  var allOptions = spec.spectrum("option");
  equal ( allOptions.flat, true, "Fetching all options provides accurate value");

  var singleOption = spec.spectrum("option", "className");
  equal ( singleOption, "full-spectrum", "Fetching a single option returns that value");

  spec.spectrum("option", "className", "changed");
  singleOption = spec.spectrum("option", "className");
  equal ( singleOption, "changed", "Changing an option then fetching it is updated");


  var numPaletteElements = spec.spectrum("container").find(".sp-palette-row:not(.sp-palette-row-selection) .sp-thumb-el").length;
  equal (numPaletteElements, 2, "Two palette elements to start");
  spec.spectrum("option", "palette", [['red'], ['green'], ['blue']]);
  var optPalette = spec.spectrum("option", "palette");
  deepEqual (optPalette, [['red'], ['green'], ['blue']], "Changing an option then fetching it is updated");
  var numPaletteElements = spec.spectrum("container").find(".sp-palette-row:not(.sp-palette-row-selection) .sp-thumb-el").length;
  equal (numPaletteElements, 3, "Three palette elements after updating");

  var appendToDefault = $("<input />").spectrum({

  });

  var container= $("<div id='c' />").appendTo("body");
  var appendToOther = $("<input />").spectrum({
    appendTo: container
  });

  var appendToParent = $("<input />").appendTo("#c").spectrum({
    appendTo: "parent"
  });


  var appendToOtherFlat = $("<input />").spectrum({
    appendTo: container,
    flat: true
  });

  equal ( appendToDefault.spectrum("container").parent()[0], document.body, "Appended to body by default");

  equal ( appendToOther.spectrum("container").parent()[0], container[0], "Can be appended to another element");

  equal ( appendToOtherFlat.spectrum("container").parent()[0], $(appendToOtherFlat).parent()[0], "Flat CANNOT be appended to another element, will be same as input");

  equal ( appendToParent.spectrum("container").parent()[0], container[0], "Passing 'parent' to appendTo works as expected");


  // Issue #70 - https://github.com/bgrins/spectrum/issues/70
  equal (spec.spectrum("option", "showPalette"), true, "showPalette is true by default");
  spec.spectrum("option", "showPalette", false);

  equal (spec.spectrum("option", "showPalette"), false, "showPalette is false after setting showPalette");
  spec.spectrum("option", "showPaletteOnly", true);

  equal (spec.spectrum("option", "showPaletteOnly"), true, "showPaletteOnly is true after setting showPaletteOnly");
  equal (spec.spectrum("option", "showPalette"), true, "showPalette is true after setting showPaletteOnly");

  spec.spectrum("destroy");
  appendToDefault.spectrum("destroy");
  appendToOther.spectrum("destroy");
  appendToOtherFlat.spectrum("destroy");
  appendToParent.spectrum("destroy").remove();
  delete window.localStorage["spectrum.example"];
});

test ("Show Input works as expected", function() {
  var el = $("<input />").spectrum({
    showInput: true,
    color: "red"
  });
  var input = el.spectrum("container").find(".sp-input");

  equal(input.val(), "red", "Input is set to color by default");
  input.val("").trigger("change");

  ok(input.hasClass("sp-validation-error"), "Input has validation error class after being emptied.");

  input.val("red").trigger("change");

  ok(!input.hasClass("sp-validation-error"), "Input does not have validation error class after being reset to original color.");

  equal (el.spectrum("get").toHexString(), "#ff0000", "Color is still red");
  el.spectrum("destroy");
});


test ("Tooltip is formatted based on preferred format", function() {
  var el = $("<input />").spectrum({
    showInput: true,
    color: "rgba(255, 255, 255, .5)",
    showPalette: true,
    palette: [["red", "rgba(255, 255, 255, .5)", "rgb(0, 0, 255)"]]
  });

  function getTitlesString() {
    return el.spectrum("container").find(".sp-thumb-el").map(function() {
      return this.getAttribute("title");
    }).toArray().join(" ");
  }

  equal (getTitlesString(), "rgb(255, 0, 0) rgba(255, 255, 255, 0.5) rgb(0, 0, 255)", "Titles use rgb format by default");

  el.spectrum("option", "preferredFormat", "hex");
  equal (getTitlesString(), "#ff0000 #ffffff #0000ff", "Titles are updated to hex");

  el.spectrum("option", "preferredFormat", "hex6");
  equal (getTitlesString(), "#ff0000 #ffffff #0000ff", "Titles are updated to hex6");

  el.spectrum("option", "preferredFormat", "hex3");
  equal (getTitlesString(), "#f00 #fff #00f", "Titles are updated to hex3");

  el.spectrum("option", "preferredFormat", "name");
  equal (getTitlesString(), "red white blue", "Titles are updated to name");

  el.spectrum("option", "preferredFormat", "hsv");
  equal (getTitlesString(), "hsv(0, 100%, 100%) hsva(0, 0%, 100%, 0.5) hsv(240, 100%, 100%)", "Titles are updated to hsv");

  el.spectrum("option", "preferredFormat", "hsl");
  equal (getTitlesString(), "hsl(0, 100%, 50%) hsla(0, 0%, 100%, 0.5) hsl(240, 100%, 50%)", "Titles are updated to hsl");

  el.spectrum("option", "preferredFormat", "rgb");
  equal (getTitlesString(), "rgb(255, 0, 0) rgba(255, 255, 255, 0.5) rgb(0, 0, 255)", "Titles are updated to rgb");

  el.spectrum("destroy");
});

module("Methods");

test( "Methods work as described", function() {
  var el = $("<input id='spec' />").spectrum();

  // Method - show
  el.spectrum("show");
  ok (el.spectrum("container").is(":visible"), "Spectrum is visible");

  // Method - hide
  el.spectrum("hide");
  ok (el.spectrum("container").not(":visible"), "Spectrum is no longer visible");

  // Method - toggle
  el.spectrum("toggle");
  ok (el.spectrum("container").is(":visible"), "Spectrum is visible after toggle");

  el.spectrum("toggle");
  ok (el.spectrum("container").not(":visible"), "Spectrum is no longer visible after toggle");

  // Method - set / get
  el.spectrum("set", "orange");
  var color = el.spectrum("get", "color");

  ok (color.toHexString() == "#ffa500", "Color has been set and gotten as hex");
  ok (color.toName() == "orange", "Color has been set and gotten as name");
  ok (color.toHsvString() == "hsv(39, 100%, 100%)", "Color has been set and gotten as hsv");
  ok (color.toRgbString() == "rgb(255, 165, 0)", "Color has been set and gotten as rgb");
  ok (color.toHslString() == "hsl(39, 100%, 50%)", "Color has been set and gotten as hsl");

  // Method - container
  ok (el.spectrum("container").hasClass("sp-container"), "Container can be retrieved");

  // Method - disable
  el.spectrum("disable");
  ok (el.is(":disabled") , "Can be disabled");

  el.spectrum("show");
  ok (el.not(":visible") , "Cannot show when disabled");

  // Method - enable
  el.spectrum("enable");
  ok (!el.is(":disabled") , "Can be enabled");

  // Method - reflow
  el.spectrum("reflow");

  // Method - throw exception when not existing
  raises(function() {
    el.spectrum("no method");
  }, "Expecting exception to be thrown when calling with no method");

  // Method - destroy
  el.spectrum("destroy");

  equal (el.spectrum("container"), el , "No usage after being destroyed");
  equal (el.spectrum("get"), el , "No usage after being destroyed");

  el.spectrum("destroy");
});

// https://github.com/bgrins/spectrum/issues/97
test( "Change events fire as described" , function() {

  expect(0);
  var input = $("<input />");

  input.on("change", function() {
    ok(false, "Change should not be fired inside of input change");
  });

  input.spectrum({
    color: "red",
    change: function() {
      ok (false, "Change should not be fired inside of spectrum callback");
    }
  });

  input.spectrum("set", "orange");

});

test("The selectedPalette should be updated in each spectrum instance, when storageKeys are identical.", function () {

  delete window.localStorage["spectrum.tests"];

  var colorToChoose = "rgb(0, 244, 0)";
  var firstEl = $("<input id='firstEl' value='red' />").spectrum({
    showPalette: true,
    localStorageKey: "spectrum.tests"
  });
    var secondEl = $("<input id='secondEl' value='blue' />").spectrum({
    showPalette: true,
    localStorageKey: "spectrum.tests"
  });

  firstEl.spectrum("set", colorToChoose);

  secondEl.spectrum("toggle");

  var selectedColor = secondEl.spectrum("container").find('span[data-color="' + colorToChoose + '"]');
  ok(selectedColor.length > 0, "Selected color is also shown in the others instance's palette.");

  delete window.localStorage["spectrum.tests"];

  firstEl.spectrum("destroy");
  secondEl.spectrum("destroy");
});

test("The selectedPalette should not be updated in spectrum instances that have different storageKeys.", function () {

  delete window.localStorage["spectrum.test_1"];
  delete window.localStorage["spectrum.test_2"];

  var colorToChoose = "rgb(0, 244, 0)";
  var firstEl = $("<input id='firstEl' value='red' />").spectrum({
    showPalette: true,
    localStorageKey: "spectrum.test_1"
  });
    var secondEl = $("<input id='secondEl' value='blue' />").spectrum({
    showPalette: true,
    localStorageKey: "spectrum.test_2"
  });

  firstEl.spectrum("set", colorToChoose);

  secondEl.spectrum("toggle");

  var selectedColor = secondEl.spectrum("container").find('span[data-color="' + colorToChoose + '"]');
  ok(selectedColor.length === 0, "Selected color should not be available in instances with other storageKey.");

  firstEl.spectrum("destroy");
  secondEl.spectrum("destroy");

  delete window.localStorage["spectrum.test_1"];
  delete window.localStorage["spectrum.test_2"];
});
