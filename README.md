# Spectrum
## The No Hassle Colorpicker

See the demo and docs: http://bgrins.github.com/spectrum/.

I wanted a colorpicker that didn't require images, and that had an API that made sense to me as a developer who has worked with color in a number of applications.  I had tried a number of existing plugins, but decided to try and make a smaller, simpler one.

I started using canvas, then switched to CSS gradients, since it turned out to be easier to manage, and provided better cross browser support.

Spectrum is registered as a jQuery plugin on the jQuery plugin repository here: http://plugins.jquery.com/spectrum/

[![Build Status](https://secure.travis-ci.org/bgrins/spectrum.png?branch=master)](http://travis-ci.org/bgrins/spectrum)


## To Build Locally

If you'd like to download and use the plugin, head over to http://bgrins.github.io/spectrum/ and click the 'Download Zip' button.

If you'd like to run the development version, spectrum uses Grunt to automate the testing, linting, and building.  Head over to http://gruntjs.com/getting-started for more information.  First, clone the repository, then run:

    npm install -g grunt-cli
    npm install
    grunt build
