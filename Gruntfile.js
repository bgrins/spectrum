
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    qunit: {
      all: ['test/index.html', 'test/loaders.html']
    },

    jshint: {
      options: {
        sub: true,
        strict: true,
        newcap: false,
        globals: {
          jQuery: true
        }
      },

      with_overrides: {
        options: {
          strict: false
        },
        files: {
          src: ['i18n/*.js', 'test/tests.js']
        }
      },

      all: ['src/spectrum.js']
    },

    concat: {
      js: {
        src: ['src/spectrum.js', 'src/i18n/*.js'],
        dest: 'dist/spectrum.js',
      },
      css: {
        src: ['src/spectrum.css'],
        dest: 'dist/spectrum.css',
      },
    },

    uglify: {
      options: {
      },
      dist: {
        files: {
          'dist/spectrum.min.js': ['dist/spectrum.js']
        }
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          src: ['dist/spectrum.css'],
          dest: 'dist',
          ext: '.min.css'
        }]
      }
    }

  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Testing tasks
  grunt.registerTask('test', ['jshint', 'qunit']);

  // Travis CI task.
  grunt.registerTask('travis', 'test');

  // Default task.
  grunt.registerTask('default', ['test']);

  //Build Task.
  grunt.registerTask('build', ['test', 'concat', 'uglify', 'cssmin']);

};
