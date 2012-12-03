Assignment.Router = Backbone.Router.extend({
  // Define and match routes to the state machine.
  routes: {
    // Default route to assignments.
    "": "assignments",

    // Remaining mapped.
    "assignments": "assignments",
    "assignments/migration": "assignments.migration",
    "assignemnts/migration/:id": "assignments.migration.detail"
  },

  // Define the state tree.
  assignments: {
    enter: function() {
      // Top level, create a new Page model.
      this.page = new Page.Model({
        title: "Assignments",

        // The model will automatically attach it to the `app.layout`.
        view: new Assignment.Views.Layout()
      });

      // Default to migrations, triggering the callback is fine.  The state
      // will be detected and only partially updated.
      this.navigate("assignments/migration", true);
    },

    migration: {
      enter: function() {
        var page = this.page;

        // Add a sub-page into the breadcrumbs.
        page.breadcrumbs.add({ subtitle: "Assignments" });

        // Get the current `Page` view and render the migration content.
        page.get("view").setView(".content": new Assignment.Views.Migration({
          model: new Assignment.Model()
        }));
      },

      detail: {
        enter: function(id) {
          var page = this.page;

          // Add a third depth level into the breadcrumbs.
          page.breadcrumbs.add({ subtitle: "Viewing assignment: " + id });

          // Get access to the `Assignment.Model`, update it's `id`, and fetch
          // the latest contents.
          page.get("view").getView(".content").model.set({ id: id }).fetch();
        }
      }
    }
  }
});
