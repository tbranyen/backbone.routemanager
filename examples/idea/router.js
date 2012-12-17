var Router = Backbone.RouteManager.extend({
  // Map the default route to the sub router.
  routes: {
    "": new Assignment.Router()
  }
});
