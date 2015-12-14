global.jQuery = global.$ = require('jquery');
require('../spectrum');

test("plugin works in commonjs environment", function() {
  ok(true, "Test  loaded");
  ok (jQuery.fn.spectrum, "Plugin has been loaded");

  // Just do some basic stuff with the API as a sanity check.
  var el = $("<input id='spec' />").spectrum();
  el.spectrum("set", "red");
  equal(el.spectrum("get").toName(), "red", "Basic color setting");
  el.spectrum("destroy");
});