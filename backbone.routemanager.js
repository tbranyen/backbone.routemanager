/* backbone.routemanager.js v0.0.0
 * Copyright 2012, Tim Branyen (@tbranyen)
 * backbone.routemanager.js may be freely distributed under the MIT license.
 */
(function(window) {

"use strict";

// Alias the libraries from the global object
var Backbone = window.Backbone;
var _ = window._;
var $ = window.$;

// Cache the Backbone routing RegExp function for later matching
var routeMatch = Backbone.Router.prototype._routeToRegExp; 

// FIXME Add comment here...
var RouteManager = Backbone.Router.extend({
  // The constructor must be overridden, because this is where Backbone
  // internally binds all routes.
  constructor: function(options) {
    // Useful for nested functions
    var root = this;
    // Use for normal routes
    var routes = {};
    // Use for attached routers
    var routers = this.routers = {};
    // Router attached routes, normalized
    var normalizedRoutes = options.routes || this.routes;

    // Iterate and augment the routes hash to accept Routers
    _.each(normalizedRoutes, function(action, route) {
      var prefix, parent, router, SubRouter;

      prefix = options.prefix;

      // Prefix is optional, set to empty string if not passed
      if (!prefix) {
        prefix = route || "";
      }

      // Allow for optionally omitting trailing /.  Since base routes do not
      // trigger with a trailing / this is actually kind of important =)
      if (prefix[prefix.length-1] === "/") {
        prefix = prefix.slice(0, prefix.length-1);

      // If a prefix exists, add a trailing /
      } else if (prefix) {
        prefix += "/";
      }

      // SubRouter constructors need to be augmented to allow for filters, they
      // are also attached to a special property on the RouteManager for
      // easy accessibility and event binding.
      if (action.prototype instanceof Backbone.Router) {
        // Maintain a reference to the user-supplied constructor
        parent = action.prototype.constructor;

        // Extend the SubRouter to override the constructor function
        SubRouter = action.extend({
          constructor: function(options) {
            var ctor = Backbone.Router.prototype.constructor;

            // Make sure to prefix all routes
            _.each(this.routes, function(method, route) {
              delete this.routes[route];

              route = route ? prefix + "/" + route : prefix;
              this.routes[route] = method;
            }, this);

            return ctor.apply(this, arguments);
          }
        });

        // Initialize the Router inside the collection
        router = routers[route] = new SubRouter();
        
        // Give the router state!
        route._state = {};

        // Internal object cache for special RouteManager functionality.
        router.__manager__ = {};

        // If there is a custom constructor function provided by the user;
        // make sure to be a good samaritan.
        if (_.isFunction(parent)) {
          parent.call(router);
        }

        // Used to avoid multiple lookups for router+prefix
        router.__manager__.prefix = prefix;

        // No need to delete from this.routes, since the entire object is
        // replaced anyways.

      // If it is not a Backbone.Router, then its a normal route, assuming
      // the action and route are strings.
      } else if (_.isString(action) && _.isString(route)) {
        // Add the route callbacks to the instance, since they are
        // currently inside the options object.
        root[action] = options[action];
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
    return Backbone.Router.prototype.constructor.call(this);
  },

  navigate: function(fragment, trigger) {
    var found;
    
    // FIXME No more recursion like this if possible
    (function iterate(router) {
      found = _.filter(router.before, function(route) {
        
      });

      if (!found && router.routers && router.routers.length) {
        _.each(router.routers, function(router) {
          return iterate(router);
        });
      }

      return found;
    })(this);

    console.log(found);

    Backbone.history.navigate(fragment, trigger);
  }
},
{
  // This static method allows for global configuration of RouteManager.
  configure: function(options) { 
    var existing = Backbone.RouteManager.prototype.options;

    // Without this check the application would react strangely to a foreign
    // input.
    if (_.isObject(options)) {
      return _.extend(existing, options);
    }
  }
});

// Default configuration options; designed to be overriden.
RouteManager.prototype.options = {
  // Can be used to supply a different deferred that implements Promises/A.
  deferred: function() {
    return $.Deferred();
  }
};

Backbone.RouteManager = RouteManager;

})(this);
