
module.exports = function(grunt) {

  grunt.initConfig({
    lint: {
      all: ['spectrum.js']
    },

    jshint: {
      options: {
        browser: true
      },
      globals: {
        jQuery: true
      }
    }
  });

  grunt.registerTask('default', 'lint');

};
