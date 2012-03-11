module("routes", {
  setup: function() {
    var harness = this;
    harness.data = {};

    // Set up a test router
    harness.SubRouter = Backbone.Router.extend({
      before: {
        "sync": ["beforeSync"],
        "sync/:id": ["handleID"],
        "sync/:id/:name": ["handleName"]
      },

      beforeSync: function() {
        this.beforeSync = true;
      },

      handleID: function(id) {
        harness.data = {
          route: "sub/sync/:id",
          context: this,
          args: arguments
        };
      },

      handleName: function(name) {
        harness.data = {
          route: "sub/sync/:id/:name",
          context: this,
          args: arguments
        };
      },

      routes: {
        "": "test",
        "sync": "sync",
        "sync/:id": "sync",
        "sync/:id/:name": "sync"
      },

      test: function() {
        harness.data = {
          route: "sub",
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

        "": "index",
        "params/:id/*path": "params"
      },

      index: function() {
        harness.data = {
          route: "",
          context: this,
          args: arguments
        };
      },

      params: function() {
        harness.data = {
          route: "params",
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
  equal(harness.data.route, "", "Manager route triggered");

  // Trigger the sub route
  harness.router.navigate("sub", true);
  equal(harness.data.route, "sub", "Sub route triggered");
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
test("filters", function() {
  expect(2);

  var harness = this;

  Backbone.history.start();

  // Test synchronous filters
  harness.router.navigate("sub/sync", true);
  equal(harness.data.route, "sub/sync", "Sync triggered");
  ok(harness.data.context.beforeSync, "Triggered with correct context");
});

// Test params object
test("params", function() {
  expect(4);

  var harness = this;

  Backbone.history.start();

  // Test synchronous filters
  harness.router.navigate("params/5/lol/hi", true);
  equal(harness.data.route, "params", "Params triggered");
  equal(typeof harness.data.context.params, "object", "Params is an object");

  equal(harness.data.context.params.id, "5",
    "Param var contains the right value");

  equal(harness.data.context.params.path, "lol/hi",
    "Params splat contains the right value");
});

// Auto params mapping
test("mapping", function() {
  expect(2);

  var harness = this;

  Backbone.history.start();

  // Ensure mapping by name works
  harness.router.navigate("sub/sync/lol", true);
  equal(harness.data.route, "sub/sync", "Params triggered");
  equal(harness.data.args[0], "lol", "id mapped correctly");
});
