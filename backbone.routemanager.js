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
    var SubRouter;
    // Useful for nested functions...
    var manager = this;
    // Use for normal routes
    var routes = {};
    // Use for attached routers
    var routers = this.routers = {};

    // Ensure all instance methods are bound to this manager.
    _.bindAll(this);

    // Iterate through all routes
    _.each(options.routes, function(action, route) {
      // Prefix is optional, set to empty string if not passed
      var prefix = route || "";

      // Allow for optionally omitting trailing /.  Since base routes do not
      // trigger with a trailing / this is actually kind of important =)
      if (prefix[prefix.length-1] == "/") {
        prefix = prefix.slice(0, prefix.length-1);

      // If a prefix exists, add a trailing /
      } else if (prefix) {
        prefix += "/";
      }

      // When dealing with a Backbone.Router instance, the action is referred
      // to as SubRouter.  Do not get confused here; it is the exact same
      // reference as action is.  The variable name has only changed for
      // more consistent readability since its a constructor.

      // SubRouter constructors need to be augmented to allow for filters, they
      // are also attached to a special property on the RouteManager for
      // easy accessibility and event binding.
      if (action.prototype instanceof Backbone.Router) {
        // Definitely need to augment the SubRouter, BEFORE initializing it.
        // FIXME: This is very, very wrong.  Extending does not yield
        // the correct behavior.
        SubRouter = action.extend({
          constructor: function() {
            // FIXME: ALL THIS CODE IS REDUNDANT
            var routes = {};

            // Every route needs to be prefixed
            _.each(this.routes, function(callback, path) {
              if (path) {
                return routes[prefix + "/" + path] = callback;
              }

              // If the path is "" just set to prefix, this is to comply
              // with how Backbone expects base paths to look gallery vs gallery/
              routes[prefix] = callback;
            });

            // Must override with prefixed routes
            this.routes = routes;

            // Required to have Backbone set up routes
            return Backbone.Router.prototype.constructor.call(this);
          }
        });

        // Initialize the Router inside the collection
        routers[route] = new SubRouter();

        // No need to delete from this.routes, since the entire object is
        // replaced anyways.

      // If it is not a Backbone.Router, then its a normal route, assuming
      // the action and route are strings.
      } else if (_.isString(action) && _.isString(route)) {
        // Add the route callbacks to the instance, since they are
        // currently inside the options object.
        manager[action] = options[action];
        // Remove once the swap has occured.
        delete options[action];
        
        // Add route to collection of "normal" routes, ensure prefixing.
        if (route) {
          return routes[prefix + route] = action;
        }

        // If the path is "" just set to prefix, this is to comply
        // with how Backbone expects base paths to look gallery vs gallery/.
        routes[prefix] = action;
      }
    });

    // Add the manager routes.
    this.routes = routes;

    // Fall back on Backbone.js to set up the manager routes.
    Backbone.Router.prototype.constructor.call(this);
  },

  // Augment navigate method to provide a singular place to trigger
  // routes irrespective of internal router.  This is crucial to
  // ensure navigation events work as expected.
  navigate: function(route, trigger) {
    // TODO: CLEAN UP DIS FUNCTION, this found non-sense is annoying
    var found;
    var manager = this;

    // Determine if the route exists in an attached router
    found = _.detect(this.routers, function(router, prefix) {
      if (route.indexOf(prefix) == 0) {
        router.navigate(route, trigger);

        return router;
      }
    });

    // If nothing was found
    if (!found) {
      found = manager;
      Backbone.Router.prototype.navigate.apply(this, arguments);
    }

    // I think it's useful to have a global "route" event.  So we'll trigger
    // one.
    this.trigger("route", route, found);
  },

  // This may need to be augmented in case you wish to late bind
  // routes.
  route: function() {
    return Backbone.Router.prototype.route.apply(this, arguments);
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
