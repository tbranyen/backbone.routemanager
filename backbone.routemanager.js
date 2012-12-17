/*!
 * backbone.routemanager.js v0.2.0-wip
 * Copyright 2012, Tim Branyen (@tbranyen)
 * backbone.routemanager.js may be freely distributed under the MIT license.
 */
(function(window) {

"use strict";

// Localize global dependency references.
var Backbone = window.Backbone;
var _ = window._;
var $ = window.$;

var RouteManager = Backbone.Router.extend({
  // The constructor must be overridden, because this is where Backbone
  // internally binds all routes.
  constructor: function(options) {
    // Options are passed in if using the constructor invocation syntax, this
    // ensures that if the definition syntax is used that options are pulled
    // from the instance.
    options = options || this;

    // Useful for nested functions.
    var root = this;
    // Use for normal routes.
    var routes = {};
    // Use for attached routers.
    var routers = this.routers = {};
    // Router attached routes, normalized.
    var normalizedRoutes = options.routes;

    // Iterate and augment the routes hash to accept Routers.
    _.each(normalizedRoutes, function(action, route) {
      var parent, router, SubRouter, originalRoute;
      var prefix = options.prefix;

      // Prefix is optional, set to empty string if not passed.
      if (!prefix) {
        prefix = route || "";
      }

      // Allow for optionally omitting trailing /.  Since base routes do not
      // trigger with a trailing / this is actually kind of important =).
      if (prefix[prefix.length-1] === "/") {
        prefix = prefix.slice(0, prefix.length-1);
      }

      // SubRouter constructors need to be augmented to allow for filters, they
      // are also attached to a special property on the RouteManager for
      // easy accessibility and event binding.
      if (action.prototype instanceof Backbone.Router) {
        // Maintain a reference to the user-supplied constructor.
        parent = action.prototype.constructor;

        // Extend the SubRouter to override the constructor function.
        SubRouter = action.extend({
          constructor: function(options) {
            var ctor = Backbone.Router.prototype.constructor;

            // Make sure to prefix all routes.
            _.each(this.routes, function(method, route) {
              delete this.routes[route];

              route = route ? prefix + "/" + route : prefix;

              // Replace the route with the override.
              this.routes[route] = method;
              this[method] = RouteManager.handleRoute.call(this, this[method],
                route);
            }, this);

            return ctor.apply(this, arguments);
          },

          // Overrideable options.
          options: Backbone.RouteManager.prototype.options
        });

        // Initialize the Router inside the collection.
        router = routers[route] = new SubRouter();
        
        // Give the router state!
        route._state = {};

        // Internal object cache for special RouteManager functionality.
        router.__manager__ = {
          // Used to avoid multiple lookups for router+prefix.
          prefix: prefix,
          // Necessary to know the top level Router.
          root: root
        };

        // If there is a custom constructor function provided by the user;
        // make sure to be a good samaritan.
        if (_.isFunction(parent)) {
          parent.call(router);
        }

        // No need to delete from this.routes, since the entire object is
        // replaced anyways.

      // If it is not a Backbone.Router, then its a normal route, assuming
      // the action and route are strings.
      } else if (_.isString(action) && _.isString(route)) {
        // Reset this here, since we don't want duplicate routes
        prefix = options.prefix ? options.prefix : "";

        // Add the route callbacks to the instance, since they are
        // currently inside the options object.
        root[action] = RouteManager.handleRoute.call(root, options[action],
          route);

        // Remove once the swap has occured.  Only do this if the options is
        // not the current context.
        if (options !== root) {
          delete options[action];
        }
        
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

  __manager__: { prefix: "" }
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
  },

  // Wraps a route and provides the before/after filters and params object.
  handleRoute: function(original, route) {
    var fragment, routeName;
    var router = this;
    var options = router.options;

    // Detect the identifiers out of the route.
    var identifiers = _.map(route.match(/:(\w+)|\*(\w+)/g), function(arg) {
      return arg.slice(1);
    });

    // Replace the route function with the wrapped version.
    return function() {
      var args = arguments;

      // Its possible this function's context will be set to pull the wrong
      // router, ensure the correct property is selected.
      var router = this;

      // Set the fragment, as detected by Backbone.
      fragment = Backbone.history.fragment;

      // Params are a named object.
      this.params = {};

      // Map the arguments to the names inside the params object.
      _.each(identifiers, function(arg, i) {
        this.params[arg] = args[i];
      }, this);

      // Navigate the original route and then call the after callbacks.
      if (_.isFunction(original)) {
        original.apply(this, args);
      }
    };
  }
});

// Expose RouteManager onto Backbone.
Backbone.RouteManager = RouteManager;

})(this);
