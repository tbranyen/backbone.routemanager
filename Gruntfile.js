module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      banner: "/*!\n" + " * <%= pkg.name %> v0.1.0\n" +
        " * Copyright <%= grunt.template.today('yyyy') %>, <%= pkg.author %>\n" +
        " * <%= pkg.name %> may be freely distributed under " +
        "the MIT license.\n */\n"
    },

    watch: {
      files: "<%= jshint.all %>",
      tasks: ["jshint", "test"]
    },

    uglify: {
      options: {
        banner: "<%= meta.banner %>"
      },
      compress: {
        files: {
          "backbone.routemanager.min.js": ["backbone.routemanager.js"]
        }
      }
    },

    jshint: {
      all: ["backbone.routemanager.js"],
      options: {
          reporter: require("jshint-stylish"),
          jshintrc: true
      },
    },

    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/test/index.html'
          ]
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          base: '.'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.task.registerTask("default", ["jshint", "connect", "qunit", "uglify"]);

  // Standard aliases
  grunt.task.registerTask("lint", ["jshint"]);
  grunt.task.registerTask("test", ["connect", "qunit"]);

};
