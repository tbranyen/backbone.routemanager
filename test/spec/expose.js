if (typeof assert === "undefined") {
  assert = require("../vendor/chai").assert;
}

describe("Expose", function() {
  describe("Backbone.Router", function() {
    it("should be equal", function() {
      assert.equal("yes", "no");
    });
  });
});
