/* backbone.routemanager.js v0.0.0
 * Copyright 2011, Tim Branyen (@tbranyen)
 * backbone.routemanager.js may be freely distributed under the MIT license.
 */
(function(Backbone, _, $) {

// Enforce strict mode
"use strict";

// RouteManager at its core is specifically a Backbone.Router
var RouteManager = Backbone.RouteManager = Backbone.Router.extend({
  // The constructor must be overridden, because this is where Backbone
  // internally binds all routes.
  constructor: function(options) {
    // Iterate through all routes
    _.each(options.routes, function(action, route) {
      // Determine if the action is a Backbone.Router
      if (action.prototype instanceof Backbone.Router) {

        // TODO: Figure out how to deal with filters here...
        console.log("dealing with a backbone router");

      // If it is not a Backbone.Router then, this is a normal route
      } else {
        // Do something with normal route
      }
    });
  },

  // Augment navigate method to provide a singular place to trigger
  // routes irrespective of internal router.  This is crucial to
  // ensure navigation events work as expected.
  navigate: function() {

  },

  // This may need to be augmented in case you wish to late bind
  // routes.
  route: function() {

  }
},
{
  // This static method allows for global configuration of RouteManager.
  configure: function(options) { 
    var existing = Backbone.RouteManager.prototype.options;

    // Without this check the application would react strangely to a foreign
    // input.
    _.isObject(options) && _.extend(existing, options);
  }
});

// Default configuration options; designed to be overriden.
Backbone.RouteManager.prototype.options = {
  // Can be used to supply a different deferred that implements Promises/A.
  deferred: function() {
    return $.Deferred();
  }
};

}).call(this, this.Backbone, this._, this.jQuery);
