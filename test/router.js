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

      before: {
        "sub/sync": ["syncFilter"]
      },

      syncFilter: function() {
        return "lol";
      },

      test: function() {
        harness.data = {
          route: "sub/",
          context: this,
          args: arguments
        };
      },

      sync: function() {
        harness.data = {
          route: "sub/sync",
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
    try {
      Backbone.history.start({ silent: true });
    } catch (ex) {}
  },

  teardown: function() {
    var handler = this;

    handler.router.navigate("", false);
  }
});

// Ensure the basic navigation still works like normal routers
test("basic navigation", function() {
  var harness = this;

  console.log("in basic");

  // Trigger the manager route
  harness.router.navigate("", true);
  equal(harness.data.route, "/", "Manager route triggered");

  // Trigger the sub route
  harness.router.navigate("sub", true);
  equal(harness.data.route, "sub/", "Sub route triggered");
});

// Ensure before filters work on sub routers
test("sub router before filters", function() {
  var harness = this;

  console.log("in filters");

  // Test synchronous filters
  harness.router.navigate("sub/sync", true);
  equal(harness.data.route, "sub/sync", "Sync triggered");
});
