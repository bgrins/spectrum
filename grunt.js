
module.exports = function(grunt) {


  grunt.initConfig({
    lint: {
      all: ['spectrum.js']
    },

    jshint: {
      options: {
        browser: true,
        sub: true
      },
      globals: {
        jQuery: true
      }
    },

    min: {
      'build/spectrum-min.js': ['spectrum.js']
    }
  });


  grunt.registerTask('docco', 'Annotate the source.', function(options) {
    grunt.utils.spawn({
      cmd: "docco",
      args: ['-o', 'build', 'spectrum.js']
    });
  });

  grunt.registerTask('default', 'lint');
  grunt.registerTask('build', 'min docco');

};
