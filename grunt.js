module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    meta: {
      banner: "/*!\n" + " * backbone.routemanager.js v0.1.0\n" +
        " * Copyright 2012, Tim Branyen (@tbranyen)\n" +
        " * backbone.routemanager.js may be freely distributed under" +
        "the MIT license.\n */"
    },

    lint: {
      files: ["grunt.js", "backbone.routemanager.js"]
    },

    watch: {
      files: "<config:lint.files>",
      tasks: "lint test"
    },

    jshint: {
      options: {
        boss: true,
        curly: true,
        eqeqeq: true,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        node: true
      },
      globals: {}
    },

    qunit: {
      underscore: ["test/underscore.html"],
      lodash: ["test/lodash.html"]
    }
  });

  // Default task.
  grunt.task.registerTask("default", "lint qunit:underscore qunit:lodash");

};
