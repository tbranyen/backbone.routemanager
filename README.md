backbone.routemanager
=====================

Created by Tim Branyen [@tbranyen](http://twitter.com/tbranyen)

Provides missing features to the Backbone.Router.

Depends on Underscore, Backbone and jQuery.  You can swap out the 
jQuery dependency completely with a custom configuration.

## Tutorials and Screencasts ##

## Download & Include ##

Development is fully commented source, Production is minified and stripped of
all comments except for license/credits.

* [Development](https://raw.github.com/tbranyen/backbone.routemanager/master/backbone.routemanager.js)
* [Production](https://raw.github.com/tbranyen/backbone.routemanager/master/dist/backbone.routemanager.min.js)

Include in your application *after* jQuery, Underscore, and Backbone have been included.

``` html
<script src="/js/jquery.js"></script>
<script src="/js/underscore.js"></script>
<script src="/js/backbone.js"></script>

<script src="/js/backbone.routemanager.js"></script>
```

## Usage ##

### Defining a RouteManager ###

A route manager is your **MasterRouter**, you will be able to define any number
of **SubRouters**, but you will always reference the manager in your navigates.

*Assuming you have an app namespace*

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

So far we haven't seen anything special that we couldn't do already with a
normal `Backbone.Router`.  One of the major benefits of RouteManager is that
you can define SubRouters, or Routers that can be defined independently of
the RouteManager inside modules, other files, etc. and are tied back into the
RouteManager under a prefix.

For example:

``` javascript
var SubRouter = Backbone.RouteManager.Router.extend({
  routes: {
    "": "index"
  },

  index: function() {
    window.alert("SubRouter navigated successfully");
  }
});

app.router = new Backbone.RouteManager({
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
```

You don't have to use the RouteManager.Router either, you can simply use a
normal Backbone.Router definition, but you will need to override the
`constructor`.  The RouterManager.Router is a convenience to this task.

``` javascript
var SubRouter = Backbone.Router.extend({
  constructor: function(route) {
    return route(this);
  },

  routes: {
    "": "index"
  },

  index: function() {
    window.alert("SubRouter navigated successfully");
  }
});
```
