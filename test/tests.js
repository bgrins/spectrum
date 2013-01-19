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