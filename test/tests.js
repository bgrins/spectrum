// Spectrum Colorpicker Tests
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

// Pretend like the color inputs aren't supported for initial load.
$.fn.spectrum.inputTypeColorSupport = function () {
  return false;
};

QUnit.module("Initialization");

QUnit.test("jQuery Plugin Can Be Created", function (assert) {
  var el = $("<input id='spec' />").spectrum();

  assert.ok(el.attr("id") === "spec", "Element returned from plugin");

  el.spectrum("set", "red");
  assert.equal(el.spectrum("get").toName(), "red", "Basic color setting");

  assert.equal(
    el.spectrum("option", "showInput"),
    false,
    "Undefined option is false."
  );

  el.spectrum({ showInput: true });

  assert.equal(
    el.spectrum("option", "showInput"),
    true,
    "Double initialized spectrum is destroyed before recreating."
  );

  el.spectrum("destroy");

  assert.equal(
    el.spectrum("container"),
    el,
    "After destroying spectrum, string function returns input."
  );
});

QUnit.test("Polyfill", function (assert) {
  var el = $("#type-color-on-page");
  assert.ok(
    el.spectrum("get").toHex,
    "The input[type=color] has been initialized on load"
  );
  el.spectrum("destroy");

  // Pretend like the color inputs are supported.
  $.fn.spectrum.inputTypeColorSupport = function () {
    return true;
  };

  el = $("<input type='color' value='red' />").spectrum({
    allowEmpty: true,
  });
  el.spectrum("set", null);
  assert.ok(el.spectrum("get"), "input[type] color does not allow null values");
  el.spectrum("destroy");
});

QUnit.test("Per-element Options Are Read From Data Attributes", function (
  assert
) {
  var el = $("<input id='spec' data-show-alpha='true' />").spectrum();

  assert.equal(
    el.spectrum("option", "showAlpha"),
    true,
    "Took showAlpha value from data attribute"
  );

  el.spectrum("destroy");

  var changeDefault = $("<input id='spec' data-show-alpha='false' />").spectrum(
    {
      showAlpha: true,
    }
  );

  assert.equal(
    changeDefault.spectrum("option", "showAlpha"),
    true,
    "Took showAlpha value from options arg"
  );

  changeDefault.spectrum("destroy");

  var noData = $("<input id='spec' />").spectrum({
    showAlpha: true,
  });

  assert.equal(
    noData.spectrum("option", "showAlpha"),
    true,
    "Kept showAlpha without data attribute"
  );

  noData.spectrum("destroy");
});

QUnit.test("Events Fire", function (assert) {
  assert.expect(4);
  var count = 0;
  var el = $("<input id='spec' />").spectrum();

  el.on("beforeShow.spectrum", function (e) {
    // Cancel the event the first time
    if (count === 0) {
      assert.ok(true, "Cancel beforeShow");
      count++;
      return false;
    }

    assert.equal(count, 1, "Allow beforeShow");
    count++;
  });

  el.on("show.spectrum", function (e) {
    assert.equal(count, 2, "Show");
    count++;
  });

  el.on("hide.spectrum", function (e) {
    assert.equal(count, 3, "Hide");
    count++;
  });

  el.on("move.spectrum", function (e) {
    assert.ok(false, "Change should not fire from `move` call");
  });

  el.on("change", function (e, color) {
    assert.ok(false, "Change should not fire from `set` call");
  });

  el.spectrum("show");
  el.spectrum("show");
  el.spectrum("hide");

  el.spectrum("set", "red");
  el.spectrum("destroy");
});

QUnit.test("Events Fire (text input change)", function (assert) {
  assert.expect(3);
  var count = 0;
  var el = $("<input id='spec' />").spectrum({
    showInput: true,
  });
  el.on("move.spectrum", function (e, color) {
    assert.equal(count, 0, "Move fires when input changes");
    count++;
  });

  el.on("change.spectrum", function (e, color) {
    assert.equal(
      count,
      2,
      "Change should not fire when input changes, only when chosen"
    );
    count++;
  });

  el.spectrum("container").find(".sp-input").val("blue").trigger("change");
  count++;
  el.spectrum("container").find(".sp-choose").click();
  el.spectrum("destroy");

  assert.equal(count, 3, "All events fired");
});

QUnit.test("Escape hides the colorpicker", function (assert) {
  assert.expect(1);
  var el = $("<input id='spec' />").spectrum();
  el.on("hide.spectrum", function (e) {
    assert.ok(true, "Hide event should fire");
  });

  // Simulate an escape before showing -- should do nothing
  var e = jQuery.Event("keydown");
  e.keyCode = 27;
  $(document).trigger(e);

  el.spectrum("show");

  // Simulate an escape after showing -- should call the hide handler
  $(document).trigger(e);

  el.spectrum("destroy");
});

QUnit.test("Dragging", function (assert) {
  var el = $("<input id='spec' />").spectrum();
  var hueSlider = el.spectrum("container").find(".sp-hue");

  assert.ok(hueSlider.length, "There is a hue slider");

  hueSlider.trigger("mousedown");

  assert.ok($("body").hasClass("sp-dragging"), "The body has dragging class");

  hueSlider.trigger("mouseup");

  assert.ok(
    !$("body").hasClass("sp-dragging"),
    "The body does not have a dragging class"
  );

  el.spectrum("destroy");
});

QUnit.module("Defaults");

QUnit.test("Default Color Is Set By Input Value", function (assert) {
  var red = $("<input id='spec' value='red' />").spectrum();
  assert.equal(red.spectrum("get").toName(), "red", "Basic color setting");

  var noColor = $("<input id='spec' value='not a color' />").spectrum();
  assert.equal(
    noColor.spectrum("get").toHex(),
    "000000",
    "Defaults to black with an invalid color"
  );

  var noValue = $("<input id='spec' />").spectrum();
  assert.equal(
    noValue.spectrum("get").toHex(),
    "000000",
    "Defaults to black with no value set"
  );

  var noValueHex3 = $("<input id='spec' />").spectrum({
    preferredFormat: "hex3",
  });
  assert.equal(
    noValueHex3.spectrum("get").toHex(true),
    "000",
    "Defaults to 3 char hex with no value set"
  );
  assert.equal(
    noValueHex3.spectrum("get").toString(),
    "#000",
    "Defaults to 3 char hex with no value set"
  );

  red.spectrum("destroy");
  noColor.spectrum("destroy");
  noValue.spectrum("destroy");
  noValueHex3.spectrum("destroy");
});

QUnit.module("Palettes");

QUnit.test("Palette Events Fire In Correct Order ", function (assert) {
  assert.expect(4);
  var el = $("<input id='spec' value='red' />").spectrum({
    showPalette: true,
    palette: [["red", "green", "blue"]],
    move: function () {},
  });

  var count = 0;
  el.on("move.spectrum", function (e) {
    assert.equal(count, 0, "move fires before change");
    count++;
  });

  el.on("change.spectrum", function (e) {
    assert.equal(count, 1, "change fires after move");
    count++;
  });

  el.spectrum("container").find(".sp-thumb-el:last-child").click();
  assert.equal(count, 1, "Change event hasn't fired after palette click");

  el.spectrum("container").find(".sp-choose").click();
  assert.equal(count, 2, "Change event has fired after choose button click");

  el.spectrum("destroy");
});

QUnit.test("Palette click events work", function (assert) {
  assert.expect(7);

  var moveCount = 0;
  var moves = ["blue", "green", "red"];
  var changeCount = 0;

  var el = $("<input id='spec' value='orange' />")
    .spectrum({
      showPalette: true,
      preferredFormat: "name",
      palette: [["red", "green", "blue"]],
      show: function (c) {
        assert.equal(c.toName(), "orange", "correct shown color");
      },
      move: function (c) {
        assert.equal(
          c.toName(),
          moves[moveCount],
          "Move # " + moveCount + " is correct"
        );
        moveCount++;
      },
      change: function (c) {
        assert.equal(changeCount, 0, "Only one change happens");
        assert.equal(c.toName(), "red");
        changeCount++;
      },
    })
    .spectrum("show");

  el.spectrum("container").find(".sp-thumb-el:nth-child(3)").click();
  el.spectrum("container")
    .find(".sp-thumb-el:nth-child(2) .sp-thumb-inner")
    .click();
  el.spectrum("container")
    .find(".sp-thumb-el:nth-child(1) .sp-thumb-inner")
    .click();
  el.spectrum("container").find(".sp-choose").click();

  assert.equal(el.val(), "red", "Element's value is set");
  el.spectrum("destroy");
});

QUnit.test("Palette doesn't changes don't stick if cancelled", function (
  assert
) {
  assert.expect(4);

  var moveCount = 0;
  var moves = ["blue", "green", "red", "orange"];
  var changeCount = 0;

  var el = $("<input id='spec' value='orange' />")
    .spectrum({
      showPalette: true,
      preferredFormat: "name",
      palette: [["red", "green", "blue"]],
      move: function (c) {
        assert.equal(
          c.toName(),
          moves[moveCount],
          "Move # " + moveCount + " is correct"
        );
        moveCount++;
      },
      change: function (c) {
        assert.ok(false, "No change fires");
      },
    })
    .spectrum("show");

  el.spectrum("container").find(".sp-thumb-el:nth-child(3)").click();
  el.spectrum("container").find(".sp-thumb-el:nth-child(2)").click();
  el.spectrum("container").find(".sp-thumb-el:nth-child(1)").click();
  el.spectrum("container").find(".sp-cancel").click();

  assert.equal(el.val(), "orange", "Element's value is the same");
  el.spectrum("destroy");
});

QUnit.test(
  "hideAfterPaletteSelect: Palette stays open after color select when false",
  function (assert) {
    var el = $("<input id='spec' value='orange' />").spectrum({
      showPalette: true,
      hideAfterPaletteSelect: false,
      palette: [["red", "green", "blue"]],
    });

    el.spectrum("show");
    el.spectrum("container").find(".sp-thumb-el:nth-child(1)").click();

    assert.ok(
      !el.spectrum("container").hasClass("sp-hidden"),
      "palette is still visible after color selection"
    );
    el.spectrum("destroy");
  }
);

QUnit.test(
  "hideAfterPaletteSelect: Palette closes after color select when true",
  function (assert) {
    assert.expect(2);
    var el = $("<input id='spec' value='orange' />").spectrum({
      showPalette: true,
      hideAfterPaletteSelect: true,
      change: function (c) {
        assert.equal(c.toName(), "red", "change fires");
      },
      palette: [["red", "green", "blue"]],
    });

    el.spectrum("show");
    el.spectrum("container").find(".sp-thumb-el:nth-child(1)").click();

    assert.ok(
      el.spectrum("container").hasClass("sp-hidden"),
      "palette is still hidden after color selection"
    );
    el.spectrum("destroy");
  }
);

QUnit.test("Local Storage Is Limited ", function (assert) {
  var el = $("<input id='spec' value='red' />").spectrum({
    localStorageKey: "spectrum.tests",
    palette: [["#ff0", "#0ff"]],
    maxSelectionSize: 3,
  });

  el.spectrum("set", "#f00");
  el.spectrum("set", "#e00");
  el.spectrum("set", "#d00");
  el.spectrum("set", "#c00");
  el.spectrum("set", "#b00");
  el.spectrum("set", "#a00");

  assert.equal(
    localStorage["spectrum.tests"],
    "rgb(204, 0, 0);rgb(187, 0, 0);rgb(170, 0, 0)",
    "Local storage array has been limited"
  );

  el.spectrum("set", "#ff0");
  el.spectrum("set", "#0ff");

  assert.equal(
    localStorage["spectrum.tests"],
    "rgb(204, 0, 0);rgb(187, 0, 0);rgb(170, 0, 0)",
    "Local storage array did not get changed by selecting palette items"
  );
  el.spectrum("destroy");
});

QUnit.module("Options");

QUnit.test("allowEmpty", function (assert) {
  var el = $("<input value='red' />").spectrum({
    allowEmpty: true,
  });
  el.spectrum("set", null);
  assert.ok(
    !el.spectrum("get"),
    "input[type] color does not allow null values"
  );
  el.spectrum("destroy");

  el = $("<input value='red' />").spectrum();
  el.spectrum("set", null);
  assert.ok(el.spectrum("get"), "input[type] color does not allow null values");
  el.spectrum("destroy");
});

QUnit.test("clickoutFiresChange", function (assert) {
  var el = $("<input value='red' />").spectrum({
    clickoutFiresChange: false,
  });
  el.spectrum("show");
  assert.equal(el.spectrum("get").toName(), "red", "Color is initialized");
  el.spectrum("set", "orange");
  assert.equal(el.spectrum("get").toName(), "orange", "Color is set");
  $(document).click();
  assert.equal(
    el.spectrum("get").toName(),
    "red",
    "Color is reverted after clicking 'cancel'"
  );
  el.spectrum("destroy");

  // Try again with default behavior (clickoutFiresChange = true)
  el = $("<input value='red' />").spectrum();
  el.spectrum("show");
  assert.equal(el.spectrum("get").toName(), "red", "Color is initialized");
  el.spectrum("set", "orange");
  assert.equal(el.spectrum("get").toName(), "orange", "Color is set");
  $(document).click();
  assert.equal(
    el.spectrum("get").toName(),
    "orange",
    "Color is changed after clicking out"
  );
  el.spectrum("destroy");
});

QUnit.test("replacerClassName", function (assert) {
  var el = $("<input />").appendTo("body").spectrum({
    replacerClassName: "test",
  });
  assert.ok(
    el.next(".sp-replacer").hasClass("test"),
    "Replacer class has been applied"
  );
  el.spectrum("destroy").remove();
});

QUnit.test("containerClassName", function (assert) {
  var el = $("<input />").appendTo("body").spectrum({
    containerClassName: "test",
  });
  assert.ok(
    el.spectrum("container").hasClass("test"),
    "Container class has been applied"
  );
  el.spectrum("destroy").remove();
});

QUnit.test("Options Can Be Set and Gotten Programmatically", function (assert) {
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
    palette: [["red"], ["green"]],
  });

  var allOptions = spec.spectrum("option");
  assert.equal(
    allOptions.flat,
    true,
    "Fetching all options provides accurate value"
  );

  var singleOption = spec.spectrum("option", "className");
  assert.equal(
    singleOption,
    "full-spectrum",
    "Fetching a single option returns that value"
  );

  spec.spectrum("option", "className", "changed");
  singleOption = spec.spectrum("option", "className");
  assert.equal(
    singleOption,
    "changed",
    "Changing an option then fetching it is updated"
  );

  var numPaletteElements = spec
    .spectrum("container")
    .find(".sp-palette-row:not(.sp-palette-row-selection) .sp-thumb-el").length;
  assert.equal(numPaletteElements, 2, "Two palette elements to start");
  spec.spectrum("option", "palette", [["red"], ["green"], ["blue"]]);
  var optPalette = spec.spectrum("option", "palette");
  assert.deepEqual(
    optPalette,
    [["red"], ["green"], ["blue"]],
    "Changing an option then fetching it is updated"
  );
  numPaletteElements = spec
    .spectrum("container")
    .find(".sp-palette-row:not(.sp-palette-row-selection) .sp-thumb-el").length;
  assert.equal(numPaletteElements, 3, "Three palette elements after updating");

  var appendToDefault = $("<input />").spectrum({});

  var container = $("<div id='c' />").appendTo("body");
  var appendToOther = $("<input />").spectrum({
    appendTo: container,
  });

  var appendToParent = $("<input />").appendTo("#c").spectrum({
    appendTo: "parent",
  });

  var appendToOtherFlat = $("<input />").spectrum({
    appendTo: container,
    flat: true,
  });

  assert.equal(
    appendToDefault.spectrum("container").parent()[0],
    document.body,
    "Appended to body by default"
  );

  assert.equal(
    appendToOther.spectrum("container").parent()[0],
    container[0],
    "Can be appended to another element"
  );

  assert.equal(
    appendToOtherFlat.spectrum("container").parent()[0],
    $(appendToOtherFlat).parent()[0],
    "Flat CANNOT be appended to another element, will be same as input"
  );

  assert.equal(
    appendToParent.spectrum("container").parent()[0],
    container[0],
    "Passing 'parent' to appendTo works as expected"
  );

  // Issue #70 - https://github.com/bgrins/spectrum/issues/70
  assert.equal(
    spec.spectrum("option", "showPalette"),
    true,
    "showPalette is true by default"
  );
  spec.spectrum("option", "showPalette", false);

  assert.equal(
    spec.spectrum("option", "showPalette"),
    false,
    "showPalette is false after setting showPalette"
  );
  spec.spectrum("option", "showPaletteOnly", true);

  assert.equal(
    spec.spectrum("option", "showPaletteOnly"),
    true,
    "showPaletteOnly is true after setting showPaletteOnly"
  );
  assert.equal(
    spec.spectrum("option", "showPalette"),
    true,
    "showPalette is true after setting showPaletteOnly"
  );

  spec.spectrum("destroy");
  appendToDefault.spectrum("destroy");
  appendToOther.spectrum("destroy");
  appendToOtherFlat.spectrum("destroy");
  appendToParent.spectrum("destroy").remove();
  delete window.localStorage["spectrum.example"];
  container.remove();
});

QUnit.test("Show Input works as expected", function (assert) {
  var el = $("<input />").spectrum({
    showInput: true,
    color: "red",
  });
  var input = el.spectrum("container").find(".sp-input");

  assert.equal(input.val(), "red", "Input is set to color by default");
  input.val("").trigger("change");

  assert.ok(
    input.hasClass("sp-validation-error"),
    "Input has validation error class after being emptied."
  );

  input.val("red").trigger("change");

  assert.ok(
    !input.hasClass("sp-validation-error"),
    "Input does not have validation error class after being reset to original color."
  );

  assert.equal(
    el.spectrum("get").toHexString(),
    "#ff0000",
    "Color is still red"
  );
  el.spectrum("destroy");
});

QUnit.test("Toggle Picker Area button works as expected", function (assert) {
  var div = $(
      "<div style='position:absolute; right:0; height:20px; width:150px'>"
    )
      .appendTo("body")
      .show(),
    el = $("<input />").appendTo(div);
  el.spectrum({
    showInput: true,
    showPaletteOnly: true,
    togglePaletteOnly: true,
    color: "red",
  });

  var spectrum = el.spectrum("container").show(),
    toggle = spectrum.find(".sp-palette-toggle"),
    picker = spectrum.find(".sp-picker-container"),
    palette = spectrum.find(".sp-palette-container");

  // Open the Colorpicker
  el.spectrum("show");
  assert.equal(
    picker.is(":hidden"),
    true,
    "The picker area is hidden by default."
  );
  assert.ok(
    spectrum.hasClass("sp-palette-only"),
    "The 'palette-only' class is enabled."
  );

  // Click the Picker area Toggle button to show the Picker
  toggle.click();

  assert.equal(
    picker.is(":hidden"),
    false,
    "After toggling, the picker area is visible."
  );
  assert.ok(
    !spectrum.hasClass("sp-palette-only"),
    "The 'palette-only' class is disabled."
  );
  assert.equal(
    Math.round(picker.offset().top),
    Math.round(palette.offset().top),
    "The picker area is next to the palette."
  );

  // Click the toggle again to hide the picker
  toggle.trigger("click");

  assert.equal(
    picker.is(":hidden"),
    true,
    "After toggling again, the picker area is hidden."
  );
  assert.ok(
    spectrum.hasClass("sp-palette-only"),
    "And the 'palette-only' class is enabled."
  );

  // Cleanup
  el.spectrum("hide");
  el.spectrum("destroy");
  el.remove();
  div.remove();
});

QUnit.test("Tooltip is formatted based on preferred format", function (assert) {
  var el = $("<input />").spectrum({
    showInput: true,
    color: "red",
    showPalette: true,
    palette: [["red", "rgba(255, 255, 255, .5)", "rgb(0, 0, 255)"]],
  });
  el.spectrum("show");

  function getTitlesString() {
    return el
      .spectrum("container")
      .find(".sp-thumb-el")
      .map(function () {
        return this.getAttribute("title");
      })
      .toArray()
      .join(" ");
  }

  assert.equal(
    getTitlesString(),
    "rgb(255, 0, 0) rgba(255, 255, 255, 0.5) rgb(0, 0, 255)",
    "Titles use rgb format by default"
  );

  el.spectrum("option", "preferredFormat", "hex");
  assert.equal(
    getTitlesString(),
    "#ff0000 #ffffff #0000ff",
    "Titles are updated to hex"
  );
  assert.equal(
    el.spectrum("get").toString(),
    "#ff0000",
    "Value's format is updated"
  );

  el.spectrum("option", "preferredFormat", "hex6");
  assert.equal(
    getTitlesString(),
    "#ff0000 #ffffff #0000ff",
    "Titles are updated to hex6"
  );
  assert.equal(
    el.spectrum("get").toString(),
    "#ff0000",
    "Value's format is updated"
  );

  el.spectrum("option", "preferredFormat", "hex3");
  assert.equal(
    getTitlesString(),
    "#f00 #fff #00f",
    "Titles are updated to hex3"
  );
  assert.equal(
    el.spectrum("get").toString(),
    "#f00",
    "Value's format is updated"
  );

  el.spectrum("option", "preferredFormat", "name");
  assert.equal(
    getTitlesString(),
    "red #ffffff blue",
    "Titles are updated to name"
  );
  assert.equal(
    el.spectrum("get").toString(),
    "red",
    "Value's format is updated"
  );

  el.spectrum("option", "preferredFormat", "hsv");
  assert.equal(
    getTitlesString(),
    "hsv(0, 100%, 100%) hsva(0, 0%, 100%, 0.5) hsv(240, 100%, 100%)",
    "Titles are updated to hsv"
  );
  assert.equal(
    el.spectrum("get").toString(),
    "hsv(0, 100%, 100%)",
    "Value's format is updated"
  );

  el.spectrum("option", "preferredFormat", "hsl");
  assert.equal(
    getTitlesString(),
    "hsl(0, 100%, 50%) hsla(0, 0%, 100%, 0.5) hsl(240, 100%, 50%)",
    "Titles are updated to hsl"
  );
  assert.equal(
    el.spectrum("get").toString(),
    "hsl(0, 100%, 50%)",
    "Value's format is updated"
  );

  el.spectrum("option", "preferredFormat", "rgb");
  assert.equal(
    getTitlesString(),
    "rgb(255, 0, 0) rgba(255, 255, 255, 0.5) rgb(0, 0, 255)",
    "Titles are updated to rgb"
  );
  assert.equal(
    el.spectrum("get").toString(),
    "rgb(255, 0, 0)",
    "Value's format is updated"
  );

  el.spectrum("destroy");
});

QUnit.module("Methods");

QUnit.test("Methods work as described", function (assert) {
  var el = $("<input id='spec' />").spectrum();

  // Method - show
  el.spectrum("show");
  assert.ok(el.spectrum("container").is(":visible"), "Spectrum is visible");

  // Method - hide
  el.spectrum("hide");
  assert.ok(
    el.spectrum("container").not(":visible"),
    "Spectrum is no longer visible"
  );

  // Method - toggle
  el.spectrum("toggle");
  assert.ok(
    el.spectrum("container").is(":visible"),
    "Spectrum is visible after toggle"
  );

  el.spectrum("toggle");
  assert.ok(
    el.spectrum("container").not(":visible"),
    "Spectrum is no longer visible after toggle"
  );

  // Method - set / get
  el.spectrum("set", "orange");
  var color = el.spectrum("get", "color");

  assert.ok(
    color.toHexString() == "#ffa500",
    "Color has been set and gotten as hex"
  );
  assert.ok(
    color.toName() == "orange",
    "Color has been set and gotten as name"
  );
  assert.ok(
    color.toHsvString() == "hsv(39, 100%, 100%)",
    "Color has been set and gotten as hsv"
  );
  assert.ok(
    color.toRgbString() == "rgb(255, 165, 0)",
    "Color has been set and gotten as rgb"
  );
  assert.ok(
    color.toHslString() == "hsl(39, 100%, 50%)",
    "Color has been set and gotten as hsl"
  );
  assert.ok(
    (function () {
      var i, argb, a;
      for (i = 0; i < 16; i++) {
        argb = "0" + i.toString(16) + "000000";
        a = Math.round(
          el.spectrum("set", argb).spectrum("get").getAlpha() * 255
        );
        if (a != i) {
          return false;
        }
      }
      return true;
    })(),
    "Set and get has preserved alpha resolution"
  );

  // Method - container
  assert.ok(
    el.spectrum("container").hasClass("sp-container"),
    "Container can be retrieved"
  );

  // Method - disable
  el.spectrum("disable");
  assert.ok(el.is(":disabled"), "Can be disabled");

  el.spectrum("show");
  assert.ok(el.not(":visible"), "Cannot show when disabled");

  // Method - enable
  el.spectrum("enable");
  assert.ok(!el.is(":disabled"), "Can be enabled");

  // Method - reflow
  el.spectrum("reflow");

  // Method - throw exception when not existing
  assert.throws(function () {
    el.spectrum("no method");
  }, "Expecting exception to be thrown when calling with no method");

  // Method - destroy
  el.spectrum("destroy");

  assert.equal(el.spectrum("container"), el, "No usage after being destroyed");
  assert.equal(el.spectrum("get"), el, "No usage after being destroyed");

  el.spectrum("destroy");
});

// https://github.com/bgrins/spectrum/issues/97
QUnit.test("Change events fire as described", function (assert) {
  assert.expect(0);
  var input = $("<input />");

  input.on("change", function () {
    assert.ok(false, "Change should not be fired inside of input change");
  });

  input.spectrum({
    color: "red",
    change: function () {
      assert.ok(
        false,
        "Change should not be fired inside of spectrum callback"
      );
    },
  });

  input.spectrum("set", "orange");
});

QUnit.test(
  "The selectedPalette should be updated in each spectrum instance, when storageKeys are identical.",
  function (assert) {
    delete window.localStorage["spectrum.tests"];

    var colorToChoose = "rgb(0, 244, 0)";
    var firstEl = $("<input id='firstEl' value='red' />").spectrum({
      showPalette: true,
      localStorageKey: "spectrum.tests",
    });
    var secondEl = $("<input id='secondEl' value='blue' />").spectrum({
      showPalette: true,
      localStorageKey: "spectrum.tests",
    });

    firstEl.spectrum("set", colorToChoose);

    secondEl.spectrum("toggle");

    var selectedColor = secondEl
      .spectrum("container")
      .find('span[data-color="' + colorToChoose + '"]');
    assert.ok(
      selectedColor.length > 0,
      "Selected color is also shown in the others instance's palette."
    );

    delete window.localStorage["spectrum.tests"];

    firstEl.spectrum("destroy");
    secondEl.spectrum("destroy");
  }
);

QUnit.test(
  "The selectedPalette should not be updated in spectrum instances that have different storageKeys.",
  function (assert) {
    delete window.localStorage["spectrum.test_1"];
    delete window.localStorage["spectrum.test_2"];

    var colorToChoose = "rgb(0, 244, 0)";
    var firstEl = $("<input id='firstEl' value='red' />").spectrum({
      showPalette: true,
      localStorageKey: "spectrum.test_1",
    });
    var secondEl = $("<input id='secondEl' value='blue' />").spectrum({
      showPalette: true,
      localStorageKey: "spectrum.test_2",
    });

    firstEl.spectrum("set", colorToChoose);

    secondEl.spectrum("toggle");

    var selectedColor = secondEl
      .spectrum("container")
      .find('span[data-color="' + colorToChoose + '"]');
    assert.ok(
      selectedColor.length === 0,
      "Selected color should not be available in instances with other storageKey."
    );

    firstEl.spectrum("destroy");
    secondEl.spectrum("destroy");

    delete window.localStorage["spectrum.test_1"];
    delete window.localStorage["spectrum.test_2"];
  }
);

QUnit.test("Cancelling reverts color", function (assert) {
  var el = $("<input value='red' />").spectrum();
  el.spectrum("show");
  assert.equal(el.spectrum("get").toName(), "red", "Color is initialized");
  el.spectrum("set", "orange");
  assert.equal(el.spectrum("get").toName(), "orange", "Color is set");
  el.spectrum("container").find(".sp-cancel").click();
  assert.equal(
    el.spectrum("get").toName(),
    "red",
    "Color is reverted after clicking 'cancel'"
  );
  el.spectrum("destroy");
});

QUnit.test("Choosing updates the color", function (assert) {
  var el = $("<input value='red' />").spectrum();
  el.spectrum("show");
  assert.equal(el.spectrum("get").toName(), "red", "Color is initialized");
  el.spectrum("set", "orange");
  assert.equal(el.spectrum("get").toName(), "orange", "Color is set");
  el.spectrum("container").find(".sp-choose").click();
  assert.equal(
    el.spectrum("get").toName(),
    "orange",
    "Color is kept after clicking 'choose'"
  );
  el.spectrum("destroy");
});

QUnit.test("Custom offset", function (assert) {
  var el = $("<input value='red' />").spectrum();
  el.spectrum("show");
  assert.deepEqual(el.spectrum("container").offset(), { top: 0, left: 0 });
  el.spectrum("hide");
  el.spectrum("offset", { top: 10, left: 10 });
  el.spectrum("show");
  assert.deepEqual(el.spectrum("container").offset(), { top: 10, left: 10 });
  el.spectrum("hide");
  el.spectrum("offset", null);
  el.spectrum("show");
  assert.deepEqual(el.spectrum("container").offset(), { top: 0, left: 0 });
  el.spectrum("hide");
  el.spectrum("destroy");

  var el2 = $("<input value='red' />").spectrum({
    offset: { top: 100, left: 100 },
  });
  el2.spectrum("show");
  assert.deepEqual(el2.spectrum("container").offset(), { top: 100, left: 100 });
  el2.spectrum("hide");
});
