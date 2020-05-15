
require(["../spectrum", "./qunit"], function (spectrum, QUnit) {
  QUnit.module("Initialization");
  QUnit.test("Custom offset", function (assert) {
    assert.ok($.fn.spectrum, "Plugin has been loaded");

    // Just do some basic stuff with the API as a sanity check.
    var el = $("<input id='spec' />").spectrum();
    el.spectrum("set", "red");
    assert.equal(el.spectrum("get").toName(), "red", "Basic color setting");
    el.spectrum("destroy");
  });

  QUnit.start();
});
