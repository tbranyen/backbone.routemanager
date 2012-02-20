module("routes", {
  setup: function() {
    var harness = this;
    harness.data = {};

    // Set up a test router
    harness.SubRouter = Backbone.Router.extend({
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
  },

  teardown: function() {
    var handler = this;

    handler.router.navigate("", false);
    Backbone.history.stop();
  }
});

// Ensure the basic navigation still works like normal routers
test("navigation", function() {
  expect(2);

  var harness = this;

  // Trigger the manager route
  Backbone.history.start();
  equal(harness.data.route, "/", "Manager route triggered");

  // Trigger the sub route
  harness.router.navigate("sub", true);
  equal(harness.data.route, "sub/", "Sub route triggered");
});

test("events", function() {
  expect(2);

  var harness = this;

  // Trigger the manager route
  harness.router.on("route:index", function() {
    ok(true, "Route manager event triggered");
  });

  Backbone.history.start();

  // Trigger the sub route
  harness.router.routers["sub/"].on("route:test", function() {
    ok(true, "SubRouter event triggered");
  });

  harness.router.navigate("sub", true);
});

// Ensure before filters work on sub routers
//test("filters", function() {
//  var harness = this;
//
//  // Test synchronous filters
//  harness.router.navigate("sub/sync", true);
//  equal(harness.data.route, "sub/sync", "Sync triggered");
//});
