/**
 * Created by alecgorge on 4/7/15.
 */

///<reference path="../../typings/tsd.d.ts" />

import restify = require("restify");
import orm = require('orm');

import db = require('../database/Database');

interface Routable {
    registerRoutes(app: restify.Server);
}

export class ArtistRoutes implements Routable {
    registerRoutes(app: restify.Server) {
        app.get("/artists", function(req: restify.Request, res: restify.Response) {
            db.getConnection().models["Artist"].find(function (err : Error, res : orm.Instance) {

            });
        });
    }
}

