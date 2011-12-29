/* backbone.routemanager.js v0.0.0
 * Copyright 2011, Tim Branyen (@tbranyen)
 * backbone.routemanager.js may be freely distributed under the MIT license.
 */

/* JavaScript Sync/Async forEach - v0.1.2 - 11/17/2011
 * http://github.com/cowboy/javascript-sync-async-foreach
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
(function(Backbone, _, $) {

// Enforce strict mode
"use strict";

// @cowboy's forEach implementation to iterate synchronously or
// asynchronously.
function forEach(arr, eachFn, doneFn) {
  var i = -1;
  // Resolve array length to a valid (ToUint32) number.
  var len = arr.length >>> 0;

  // This IIFE is called once now, and then again, by name, for each loop
  // iteration.
  (function next(result) {
    // This flag will be set to true if `this.async` is called inside the
    // eachFn` callback.
    var async;
    // Was false returned from the `eachFn` callback or passed to the
    // `this.async` done function?
    var abort = result === false;

    // Increment counter variable and skip any indices that don't exist. This
    // allows sparse arrays to be iterated.
    do { ++i; } while (!(i in arr) && i !== len);

    // Exit if result passed to `this.async` done function or returned from
    // the `eachFn` callback was false, or when done iterating.
    if (abort || i === len) {
      // If a `doneFn` callback was specified, invoke that now. Pass in a
      // boolean value representing "not aborted" state along with the array.
      if (doneFn) {
        doneFn(!abort, arr);
      }
      return;
    }

    // Invoke the `eachFn` callback, setting `this` inside the callback to a
    // custom object that contains one method, and passing in the array item,
    // index, and the array.
    result = eachFn.call({
      // If `this.async` is called inside the `eachFn` callback, set the async
      // flag and return a function that can be used to continue iterating.
      async: function() {
        async = true;
        return next;
      }
    }, arr[i], i, arr);

    // If the async flag wasn't set, continue by calling `next` synchronously,
    // passing in the result of the `eachFn` callback.
    if (!async) {
      next(result);
    }
  }());
}

// RouteManager at its core is specifically a Backbone.Router
var RouteManager = Backbone.RouteManager = Backbone.Router.extend({
  // The constructor must be overridden, because this is where Backbone
  // internally binds all routes.
  constructor: function(options) {
    var prefix, SubRouter;
    // Useful for nested functions
    var manager = this;
    // Use for normal routes
    var routes = {};
    // Use for attached routers
    var routers = this.routers = {};

    // Ensure all instance methods are bound to this manager.
    _.bindAll(this);

    // Iterate through all routes
    _.each(options.routes, function(action, route) {
      // Wrap the SubRouter's constructor function
      function ctor(router) {
        var routes = {};

        // Every route needs to be prefixed
        _.each(router.routes, function(callback, path) {
          if (path) {
            return routes[prefix + "/" + path] = callback;
          }

          // If the path is "" just set to prefix, this is to comply
          // with how Backbone expects base paths to look gallery vs gallery/
          routes[prefix] = callback;
        });

        // Must override with prefixed routes
        router.routes = routes;

        // Required to have Backbone set up routes
        return Backbone.Router.prototype.constructor.apply(router, arguments);
      }

      // Prefix is optional, set to empty string if not passed
      prefix = route || "";

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
        SubRouter = action;

        // Initialize the Router inside the collection
        routers[route] = new SubRouter(ctor);

        // Used to avoid multiple lookups for router+prefix
        routers[route]._prefix = prefix;

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
    var router, prefix, before, after, stop;
    var manager = this;
    var options = this.options;
    var routeExp = manager._routeToRegExp(route);

    // Determine if the route exists in an attached router
    router = _.detect(manager.routers, function(router, prefix) {
      // TODO Understand if the slice is still necessary
      //if (route.indexOf(prefix.substring(0, prefix.length-1)) == 0) {
      if (route.indexOf(prefix) == 0) {
        return true;
      }
    });

    console.log(router);

    // TODO Ensure filters can be called here...
    // If no router was defined, trigger on the manager
    if (!router) {
      Backbone.Router.prototype.navigate.apply(manager, arguments);

      // TODO Figure out when to call this (on existing pages)
      return Backbone.history.loadUrl();
    }

    // Prefix shortening
    prefix = router._prefix;

    // Detect any filters to run before the route navigate
    before = _.detect(router.before, function(filters, route) {
      if (routeExp.exec(route)) {
        return true; 
      }
    });

    // TODO Decide if events are necessary
    // Trigger a before route event
    //this.trigger("before", route, router);

    // Returns an object that provides asynchronous or
    // deferrable capabilities.
    function async(done) {
      var handler = options.deferred();

      // Used to handle asynchronous filters
      handler.async = function() {
        handler._isAsync = true;

        return done;
      };

      // Used to handle deferred filters
      handler.defer = function() {
        handler._isDefer = true;

        var deferred = options.deferred();

        // Add to the list of deferreds
        async._bucket.push(deferred);

        return deferred;
      };

      return handler;
    }

    // Attach an array reference to contain all the deferreds
    async._bucket = [];

    // Handle all before handlers
    before && forEach(before, function(callback, index, array) {
      var handler, result;
      // Put the loop into async mode
      var done = this.async();

      // Stop executing callbacks if any value was returned falsly
      if (stop) {
        return done();
      }

      // Normalize the callback function, its either a direct reference, on
      // the router or the manager.
      if (!_.isFunction(callback)) {
        callback = router[callback] || manager[callback];
      }

      // Assign a new async/defer handler
      handler = async(function() {
        done.apply(this, arguments);
      });

      // Trigger the filter, passing the handler as context and the router and
      // manager as arguments.
      result = callback.call(handler, router, manager);

      // If not a deferred, check if there are any and execute them first
      if (!handler.isDefer && async._bucket.length) {
        $.when.apply(null, async._bucket).always(function() {
          // Reset the bucket
          async._bucket.splice(0, async._bucket.length);

          // If not async, go to the next one
          if (!handler._isAsync) {
            done(result);
          }
        });

        return;
      }
      
      // Add to deferred queue and continue
      if (handler.isDefer) {
        handler._bucket.push(result);

      // Is not async or deferred
      } else {
        // Skip to next function
        done(result);
      }
    },
    
    // Actually navigate
    function() {
      console.log(router, route, trigger);
      router.navigate(route, trigger);

      // I think it's useful to have a global "route" event.  So we'll trigger
      // one.
      manager.trigger("route", route, router);
    });
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
  },

  Router: Backbone.Router.extend({
    // This gets passed a custom
    constructor: function(route) {
      return route(this);
    }
  })
});

// Default configuration options; designed to be overriden.
Backbone.RouteManager.prototype.options = {
  // Can be used to supply a different deferred that implements Promises/A.
  deferred: function() {
    return $.Deferred();
  }
};

}).call(this, this.Backbone, this._, this.jQuery);
