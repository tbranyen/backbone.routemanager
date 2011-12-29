module("views", {
  setup: function() {
    var harness = this;
    harness.data = {};

    // Set up a test router
    harness.SubRouter = Backbone.RouteManager.Router.extend({
      before: {
        "sync": ["sync"]
      },

      routes: {
        "": "test",
        "sync": "sync"
      },

      test: function() {
        harness.data = {
          route: "sub/",
          context: this,
          args: arguments
        };
      }
    });

    // Set up the router
    harness.router = new Backbone.RouteManager({
      routes: {
        "sub/": harness.SubRouter,

        "": "index"
      },

      index: function() {
        harness.data = {
          route: "/",
          context: this,
          args: arguments
        };
      }
    });

    // Do not trigger the initial route
    Backbone.history.start({ silent: true });
  },

  teardown: function() {
    var handler = this;

    handler.router.navigate("", false);
  }
});

asyncTest("basic navigation", function() {
  var harness = this;

  // Trigger the manager route
  harness.router.navigate("", true);
  equal(harness.data.route, "/", "Manager route triggered");

  // Trigger the sub route
  harness.router.navigate("sub", true);
  equal(harness.data.route, "sub/", "Sub route triggered");

  start();
});

asyncTest("sub router : before filters", function() {
  var harness = this;

  // Trigger the sub route
  harness.router.navigate("sub/sync", true);
  equal(harness.data.route, "sub/sync", "Sync triggered");

  start();
});
