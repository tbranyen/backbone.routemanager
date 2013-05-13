# Grunt configuration updated to latest Grunt.  That means your minimum
# version necessary to run these tasks is Grunt 0.4.
#
# Please install this locally and install `grunt-cli` globally to run.
module.exports = ->

  # Initialize the configuration.
  @initConfig

    # Lint source, node, and test code with some sane options.
    jshint:
      files: ["backbone.routemanager.js", "node/index.js"]

      # Allow certain options.
      options:
        browser: true
        boss: true
        immed: false
        eqnull: true
        globals: {}

    # Run the Mocha spec tests.
    mocha:
      browser:
        ["test/specs/*.html"]

    simplemocha:
      options:
        globals: ["assert"]
        timeout: 3000
        ignoreLeaks: false
        ui: "bdd"
        reporter: "tap"

      node: { src: "test/spec/*.js" }

  # Load external Grunt task plugins.
  @loadNpmTasks "grunt-contrib-jshint"
  # Headless Mocha browser testing.
  @loadNpmTasks "grunt-mocha"
  # Node Mocha.
  @loadNpmTasks "grunt-simple-mocha"

  # Default task.
  @registerTask "default", ["jshint"]
