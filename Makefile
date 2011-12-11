BASE = .

all:
	uglifyjs $(BASE)/backbone.routemanager.js > $(BASE)/dist/backbone.routemanager.min.js
