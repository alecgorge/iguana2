/**
 * Created by alecgorge on 4/7/15.
 */
///<reference path="../typings/tsd.d.ts" />

import restify = require("restify");
import namespace = require("restify-namespace");

import Routes = require("./routes/Routes");
import Logger = require("./logging/Logger");
import Database = require('./database/Database');

export class APIServer {
    run() {
        var server = restify.createServer();
        var log = Logger.defaultLogger();
        var port = process.env.PORT || 8080;
        var db = Database.getConnection();

        // Middleware
        server.use(restify.CORS());

        // Routes
        namespace(server, "/api/v1", function () {
            (new Routes.ArtistRoutes()).registerRoutes(server);
        });

        // Go
        server.listen(port, function () {
            log.info("Server started on port " + port);
        });
    }
}

var s = new APIServer();
s.run();
