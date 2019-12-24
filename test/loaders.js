
require.config({
    paths: {
        jquery: '../docs/jquery-2.1.0'
    }
});

asyncTest ("requirejs", function() {
  require([
    "../src/spectrum"
  ], function(spectrum) {
    ok ($.fn.spectrum, "Plugin has been loaded");

    // Just do some basic stuff with the API as a sanity check.
    var el = $("<input id='spec' />").spectrum();
    el.spectrum("set", "red");
    equal(el.spectrum("get").toName(), "red", "Basic color setting");
    el.spectrum("destroy");

    QUnit.start();
  });
});
