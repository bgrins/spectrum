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
});

module("Defaults");

test( "Default Color Is Set By Input Value", function() {

  var red = $("<input id='spec' value='red' />").spectrum();
  equal ( red.spectrum("get").toName(), "red", "Basic color setting");

  var noColor = $("<input id='spec' value='not a color' />").spectrum();
  equal ( noColor.spectrum("get").toHex(), "000", "Defaults to black with an invalid color");

  var noValue = $("<input id='spec' />").spectrum();
  equal ( noValue.spectrum("get").toHex(), "000", "Defaults to black with no value set");

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
  ok (!el.spectrum("container").is(":visible"), "Spectrum is no longer visible after toggle");

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

});