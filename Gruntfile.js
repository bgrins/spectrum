
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('component.json'),

    qunit: {
      all: ['test/index.html']
    },

    jshint: {
      options: {
        browser: true,
        sub: true,

        globals: {
          jQuery: true
        }
      },
      all: ['spectrum.js']
    },


    uglify: {
      options: {
        mangle: false
      },
      dist: {
        files: {
          'build/spectrum-min.js': ['spectrum.js']
        }
      }
    }

  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  // Testing tasks
  grunt.registerTask('test', ['jshint', 'qunit']);

  // Travis CI task.
  grunt.registerTask('travis', 'test');

  // Default task.
  grunt.registerTask('default', ['test']);

  //Build Task.
  grunt.registerTask('build', ['test', 'uglify']);

};
