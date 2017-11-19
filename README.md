# Spectrum++
The No Hassle jQuery Colorpicker by Brian Grinstead
 with some improvement and enhancements.

Original project repository: [https://github.com/bgrins/spectrum](https://github.com/bgrins/spectrum)

### So... What's new?

Added followings new options/features:

* `showRGBsliders: boolean (true or false)`

When set to `true` it adds sliders for RGB that work in a similar way to the Alpha slider and, just like this one, they also show colors preview hints (through color gradients).

* `showRGBApickers: boolean (true or false)`

When set to `true` it adds pickers for RGB + Alpha to let you input them manually and severalty.

* `aPickerScale: int (100 or 255)`

Lets you choose the measurement scale for the Alpha pickers (also the palette filtering one I'll introduce below). The `int` parameter can be set either to 100 (default) or 255. Invalid values will be taken as 255.

* `showRGBmodes: boolean (true or false)`

When set to `true` the "_RGB modes_" sub-panel will be added... It means you'll be able to choose the mode incrementing/decrementing one RGB value will affect the other two. You can choose between:
 1. "**normal**" (default) stands for usual behavior (in which changing one RGB value won't affect the other two);
 2. "**linked**" incrementing/decrementing one RGB value will increment/decrement the other two by the same amount (the difference between initial value and incremented/decremented one);
 3. "**proportional with constraints**" similarly to linked, increment/decrement on one RGB value affects other two but difference is proportionally calculated relying on constraints you can choose (with specific RGB constraints pickers) to limit min and max RGB values tolerance range.

IMPORTANT NOTE: constraints do their job only when RGB increments or decrements are made through RGB sliders and/or pickers, not on changes made through Hue/Saturation controllers (and, obviously, not even when choosing colors by directly typing on Spectrum's specific input text box).

* `maxPaletteRowElements: int (1...10)`

Lets you choose the number of colors per row on selection palette.
The `int` parameter must be an integer number between 1 and 10 (respectively the MINimum and the MAXimum number of per row allowed colors. Invalid values or values less than 1 will make Spectrum fall back to usual (default) behavior, values greater than 10 will be taken as 10 and no more than that.

I think this should also address as a possible solution to this:
[https://github.com/bgrins/spectrum/issues/337](https://github.com/bgrins/spectrum/issues/337)

* `paletteRGBAfiltering: boolean (true or false)`

When set to `true` the "_palette filtering_" sub-panel will show up and let you filter selection palette colors upon RGBA min/max bounds you can input through dedicated pickers. It is important to say that, when filter is on, you won't be allowed to select colors on selection palette that are "out of range". Furthermore, once max allowed selection palette size limit is reach (`maxSelectionSize`), the filter on option will also preserve the "in range" colors to stay on palette yielding the earliest "out of range" one to be replaced when adding a new color to selection palette (if there aren't "out of range" colors things will work as usual). Lastly, a button for removing the unfiltered selection palette colors all at once is also provided.

TWO SIDE NOTES ON THIS FEATURE:
1. To make filtering possible I added to the `tinycolor` class the new `inRange(lowerbound_color, upperbound_color)` function which takes 2 RGBA colors (objects having `r`, `g`, `b` and `a` properties set properly) as lower and upper bounds and check if the tinycolor is "inside the range". Values for RGB properties must be set to integer number in the [0...255] range and the value for Alpha property must be a float between 0 and 1. If lower-bound isn't a valid color black with zero alpha `{r: 0, g: 0, b: 0, a: 0}` will be taken as lower-bound color, if upper-bound isn't a valid color white with full alpha `{r: 255, g: 255, b: 255, a: 1}` will be taken as upper-bound color.
2. Clear button uses the `clearPalette(target, exposeCurrent)` function which, when 
`target` parameter is set to `1`, deals with unfiltered selection palette colors but, if needed, could also be used for removing only currently selected color (`target` parameter set to `0`) or to empty entire selection palette (`target` parameter set to `2`). The `exposeCurrent` can be set to true|false; when set to `true` it doesn't preserve the current color from being eventually removed from selection palette (which is mandatory when `target` is set to `0`) otherwise, when set to `false`, the currently selected color on palette will remain on palette even in the case it is "out of range" (the case you activated the filtering feature just after selecting a "non-in-range" color).

### Good... Anything else?

Yes! :D. Besides the new features I fixed a "bug" which consists in the fact that, when typing on text box input or dragging Hue/Saturation controllers from "non-red" color to black or white, the "Hue color square" always got reset to red. This become more evident once I introduced the RGB sliders/pickers so I decided to do something and now the "Hue color square" doesn't always get reset to red when selecting black or white as color.

P.S. last advice for color neophytes (I'm one of you tbh! :)):
dragging on "Hue color square" horizontally affects the "L" on color's HSL (Hue, Saturation, Light), while vertical dragging affects the "V" on color's HSV (Hue, Saturation, Value).

### Known issues?

My CSS layout abilities are definitely not the "pro" ones, I mostly go the "trial and error" way until I get things look acceptable... (I highly suspect the additional CSS rules set could be better/optimized).

Also I didn't test this on IE < 11 versions (tbh I'm not even interested doing it really...)

### OK... Now let's see it!

**FULL EXAMPLE** (showing all the described new features) ___[here](my_testcase.html)___
