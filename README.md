backbone.routemanager v0.2.0-wip
================================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen)

Provides missing features to the Backbone.Router.

Depends on Underscore, Backbone and jQuery.  You can swap out the jQuery
dependency completely with a custom configuration.

## Download & Include ##

Development is fully commented source, Production is minified and stripped of
all comments except for license/credits.

* [Development](https://raw.github.com/tbranyen/backbone.routemanager/master/backbone.routemanager.js)

Include in your application *after* jQuery, Underscore, and Backbone have been included.

``` html
<script src="/js/jquery.js"></script>
<script src="/js/underscore.js"></script>
<script src="/js/backbone.js"></script>

<script src="/js/backbone.routemanager.js"></script>
```

## Usage ##

### Defining a RouteManager ###

A route manager is your **App Router**, you will be able to define any number
of **Nested Routers**.

*Assuming you have an app namespace*

``` javascript
// A basic route manager, works just like a Backbone.Router (cause it is one)
var AppRouter = Backbone.RouteManager.extend({
  routes: {
    "": "index"
  },

  index: function() {
    window.alert("Navigated successfully");
  }
});

// Create a new instance of the app router
app.router = new AppRouter();

// Trigger the index route
app.router.navigate("", true);
```

#### Alternative method of defining a RouteManager ####

If you don't wish to extend `Backbone.RouteManager`, you can simply make a new
instance of the constructor and assign that to save a step.

``` javascript
// A basic route manager, works just like a Backbone.Router (cause it is one)
app.router = new Backbone.RouteManager({
  routes: {
    "": "index"
  },

  index: function() {
    window.alert("Navigated successfully");
  }
});

// Trigger the index route
app.router.navigate("", true);
```

### Named params object ###

All route callbacks get access to a special object on the Router called
`params` which maps directly to the variables and splats defined in the route.

``` javascript
// A basic route manager, works just like a Backbone.Router (cause it is one)
var AppRouter = new Backbone.RouteManager({
  routes: {
    ":id/*path": "index"
  },

  index: function(id, path) {
    // You can use the arbitrarily named args you define... or you can use the
    // params object on the router.
    window.alert(id == this.params.id);
    window.alert(path == this.params.path);
  }
});

// Create a new instance of the app router
app.router = new AppRouter();

// Trigger the index route
app.router.navigate("5/hi", true);
```

This is useful for a number of reasons including a special significance for
`before/after` filters that are defined later on.

### Nested Routers ###

So far we haven't seen anything special that we couldn't do already with a
normal `Backbone.Router`.  One of the major benefits of RouteManager is that
you can define nested Routers.  These are defined in the same way as normal
routes, except you pass a `Backbone.Router` class instead.

Nested Routers are just normal `Backbone.Router`'s.

For example:

``` javascript
var SubRouter = Backbone.Router.extend({
  routes: {
    "": "index",
    "test": "test"
  },

  index: function() {
    window.alert("SubRouter navigated successfully");
  },

  test: function() {
    window.alert("sub/test triggered correctly");
  }
});

var AppRouter = Backbone.RouteManager.extend({
  routes: {
    // Define a root level route
    "": "index",

    // Define a sub route
    "sub/": SubRouter
  },

  index: function() {
    window.alert("MasterRouter navigated successfully");
  }
});

// Create a new instance of the app router
app.router = new AppRouter();

// Trigger the test route under sub
app.router.navigate("sub/test", true);
```

### Before/After filters ###

The real meat of RouteManager, besides the nested Routers, is the ability to
define functions to be run before and after a route has fired.  This has huge
benefits for keeping your Router DRY and flexible.

To define a before and after filter, simply create respectively named objects
on your Router along with a key/val set matching routes and callbacks.

The `this` context inside the filter functions is different from the route
callback.  `this` is a special object that can put the function in async/defer
mode (which is discussed later).  It has a reference to the router that can be
accessed with `this.router` if you wish to store properties or access it.

``` javascript
Backbone.Router.extend({
  before: {
    "": ["auth", "layout"]
  },

  after: {
    "": ["render"]
  }

  routes: {
    "": "index"
  },

  // Before callbacks
  auth: function() {}
  layout: function() {}

  // Route callbacks
  index: function() {}

  // After callbacks
  render: function() {}
});
```

### Params => arguments mapping ###

Your filter functions may need to be callable from outside of the RouteManager
filter environment.  Therefore no automatic mapping is possible, but there is a
very simple boolean logic assignment that you can make that ensures your
functions are correctly callable.

``` javascript
Backbone.Router.extend({
  before: {
    "user/:id": ["getUser"]
  },

  routes: {
    "": "index"
  },

  // Before callbacks
  getUser: function(id) {
    id = id || this.params.id;

    // id maps to this.params.id or whatever value is passed in
    console.log(id);
  }

  // Route callbacks
  index: function() {}
});
```

Because of this check you can now do something like this:

``` javascript
// Since you are calling this function on its own, the id will be mapped to
// whatever value you'd like, without needing `this.params`.
router.getUser(5);
```

There are three different types of functions that can be put inside the filters
array: Synchronous, Asynchronous, and Promise/Deferreds.  These can be mixed
and matched together to create a logical and performant flow to your route.

Filters run sequentially and will always block the next function until they are
complete.  This means if you have `["a","b","c"]` as your array of callbacks,
`a` will have to complete before `b` is executed.  The only exception to this
is when a Promise/Deferred is encountered and added to the list to resolve.

If you wish to stop the chain at any point (subsequently stopping the route
callback from triggering as well), you can do this in a number of ways
depending on the type of filter.  Each way is discussed in the respective
section.

### Synchronous filters ###

These are the most basic filter and require nothing special to use.  Just
create normal functions that should be executed before a route.

``` javascript
Backbone.Router.extend({
  before: {
    "": ["sync"]
  },

  sync: function() {
    console.log("this runs before index");
  },

  routes: {
    "": "index"
  }
});
```

To signify an error in your synchronous function to cause remaining functions
to not be called, simply return false in your function.

``` javascript
  sync: function() {
    console.log("not going to run any more filter functions");

    return false;
  },
```

### Asynchronous filters ###

When your code is affected by a non-blocking call (think XHR, setTimeout, etc),
the above synchronous definition cannot work, as there would be no way to tell
RouteManager when the function is done.

To put the function into *asynchronous mode* simply assign a done callback with
`var done = this.async()` and call `done()` when you are finished in the
function.

``` javascript
Backbone.Router.extend({
  before: {
    "": ["sync", "async"]
  },

  ...,

  async: function() {
    var done = this.async();

    window.setTimeout(function() {
      console.log("this runs after sync and before index");

      // Progress to the next 
      done();
    }, 1000);
  },

  routes: {
    "": "index"
  }
});
```

To signify an error in your asynchronous function to cause remaining functions
to not be called, simply call `done` with false.

``` javascript
  async: function() {
    var done = this.async();

    window.setTimeout(function() {
      console.log("this runs after sync and never calls index");

      // Do not progress to the next
      done(false);
    }, 1000);
  },
```

### Deferred/Promise filters ###

There may be times that you will work with asynchronous code that can be
run in parallel.  The deferred filter mode was designed for this use case.  
When RouteManager encounters a deferred filter it puts it into a bucket and
continues on to the next function, it will continue grouping all deferreds
until it hits a non-deferred in which it will wait till they resolve and then
execute.

To put a filter function into the deferred mode, simply assign `this.defer` to
a variable and call `resolve` or `reject` when its finished.

``` javascript
Backbone.Router.extend({
  before: {
    "": ["sync", "async", "defer"]
  },

  ...,

  defer: function() {
    var deferred = this.defer();

    window.setTimeout(function() {
      console.log("this runs after sync, async, and before index");

      // Progress to the next 
      deferred.resolve();
    }, 1000);
  },

  routes: {
    "": "index"
  }
});
```

It may be useful to leverage an existing deferred instead of creating a new
one.  This is particularly useful when calling `fetch` on models and
collections.  Simply pass the deferred to `defer` and it will be used
internally.

``` javascript
defer: function() {
  this.defer(collection.fetch());
}
```

To signify an error in your deferred function to cause remaining functions
to not be called, simply call `reject` on the deferred.

``` javascript
  defer: function() {
    var deferred = this.defer();

    window.setTimeout(function() {
      console.log("this runs after sync, async, and stops index");

      // Do not progress to the next 
      deferred.reject();
    }, 1000);
  },
```

## Configuration ##

Overriding RouteManager options has been designed to work just like
`Backbone.sync`.  You can override at a global level using
`RouteManager.configure` or you can specify when instantiating a
`RouteManager` instance.

### Global level ###

Lets say you wanted to use underscore.deferred for the Promise lib instead of
jQuery.

``` javascript
// Override all RouteManagers to use underscore.deferred
Backbone.RouteManager.configure({
  deferred: function() {
    return new _.Deferred();
  },

  when: function(promises) {
    return _.when.apply(null, promises);
  }
});
```

### Instance level ###

In this specific router, use underscore.deferred for the Promise lib instead of
jQuery.

``` javascript
app.router = new Backbone.RouteManager({
  routes: {
    "": "index"
  },

  options: {
    deferred: function() {
      return new _.Deferred();
    },

    when: function(promises) {
      return _.when.apply(null, promises);
    }
  }
});
```

### Defaults ###

* __Deferred__:
Uses jQuery deferreds for internal operation, this may be overridden to use
a different Promises/A compliant deferred.

``` javascript
deferred: function() {
  return $.Deferred();
}
```

* __When__:
This function will trigger callbacks based on the success/failure of one or
more deferred objects.

``` javascript
when: function(promises) {
  return $.when.apply(null, promises);
}
```

## Release History ##
