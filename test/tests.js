// Spectrum Colorpicker Tests
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

test( "jQuery Plugin Can Be Created", function() {
  var el = $("<input id='spec' />").spectrum();
  ok( el.attr("id") === "spec", "Element returned from plugin" );

  el.spectrum("set", "red");
  equal ( el.spectrum("get").toName(), "red", "Basic color setting");
});

test( "Default Color Is Set By Input Value", function() {

  var red = $("<input id='spec' value='red' />").spectrum();
  equal ( red.spectrum("get").toName(), "red", "Basic color setting");

  var noColor = $("<input id='spec' value='not a color' />").spectrum();
  equal ( noColor.spectrum("get").toHex(), "000", "Defaults to black with an invalid color");

  var noValue = $("<input id='spec' />").spectrum();
  equal ( noValue.spectrum("get").toHex(), "000", "Defaults to black with no value set");

});

test( "Options Can Be Set and Gotten Programmatically ", function() {

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