var fs = require("fs");

// Common dependencies to get RouteManager running.
var Backbone = require("backbone");
var _ = require("underscore");

// Using express instead of Backbone.Router internals, because this works in
// Node with the same-ish API.
var express = require("express");

// Since jQuery is not being used and RouteManager depends on a Promise
// implementation close to jQuery, we use `underscore.deferred` here which
// matches jQuery's Deferred API exactly.
var def = require("underscore.deferred");

// Get Backbone and _ into the global scope.
_.defaults(global, { Backbone: Backbone, _: _ });

// Include the RouteManager source, without eval.
require("../backbone.routemanager");

// Configure RouteManager with some very useful defaults for Node.js
// environments.  This allows the end user to simply consume instead of
// fighting with the desirable configuration.
//Backbone.Router.configure({
//});

module.exports = Backbone.Router;
