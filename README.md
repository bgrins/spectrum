# Spectrum
## The No Hassle Colorpicker

I wanted a colorpicker that didn't require images, and that had an API that made sense to me as a developer who has worked with color in a number of applications.  I had used existing plugins (which I was quite grateful for), but decided that I would make a smaller, simpler one.

I started using canvas, then switched to CSS gradients, since it turned out to be easier to manage, and worked better across browsers.

See demo and docs: http://bgrins.github.com/spectrum/

Thanks to the following places:

* http://ansciath.tumblr.com/post/7347495869/css-aspect-ratio: Aspect ratio using CSS only 
* https://github.com/DavidDurman/FlexiColorPicker for saturation/value gradient constants
* http://upload.wikimedia.org/wikipedia/commons/a/ad/HueScale.svg: For hue gradient contants

The tool I use for measuring JavaScript size: http://closure-compiler.appspot.com/home

    // ==ClosureCompiler==
    // @compilation_level SIMPLE_OPTIMIZATIONS
    // @output_file_name default.js
    // @code_url https://raw.github.com/bgrins/spectrum/master/spectrum.js
    // ==/ClosureCompiler==
    
Here is the JavaScript size

    Original Size:    24.48KB (7.31KB gzipped)
    Compiled Size:      12.03KB (4.97KB gzipped)
