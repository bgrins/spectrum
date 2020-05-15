require.config({
  paths: {
    jquery: "../docs/jquery-2.1.0",
  },
});

QUnit.test("requirejs", function (assert) {
  var done = assert.async();

  require(["../spectrum"], function (spectrum) {
    assert.ok($.fn.spectrum, "Plugin has been loaded");

    // Just do some basic stuff with the API as a sanity check.
    var el = $("<input id='spec' />").spectrum();
    el.spectrum("set", "red");
    assert.equal(el.spectrum("get").toName(), "red", "Basic color setting");
    el.spectrum("destroy");

    done();
  });
});

// QUnit.start();
