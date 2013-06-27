// Spectrum Colorpicker Tests
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT


module("Initialization");

test( "jQuery Plugin Can Be Created", function() {
  var el = $("<input id='spec' />").spectrum();

  ok( el.attr("id") === "spec", "Element returned from plugin" );

  el.spectrum("set", "red");
  equal ( el.spectrum("get").toName(), "red", "Basic color setting");

  el.spectrum("destroy");
});

test( "Events Fire", function() {
  var el = $("<input id='spec' />").spectrum();
  var count = 0;
  expect(4);

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

test( "Local Storage Is Limited ", function() {

  var el = $("<input id='spec' value='red' />").spectrum({
    localStorageKey: "spectrum.tests",
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

  el.spectrum("destroy");

});

module("Options");

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