/**
 * Created by alecgorge on 4/8/15.
 */
///<reference path="../../typings/tsd.d.ts" />

import mysql = require('mysql2');
import Promise = require('bluebird');

var log = require('../logging/Logger').defaultLogger();
var c : mysql.IConnection = null;

if(!process.env.DATABASE_URL) {
    log.error("process.env.DATABASE_URL doesn't exist!");
}
else {
    var dsn:string = process.env.DATABASE_URL;

    c = mysql.createConnection(dsn);
    c.connect(function (err) {
        if (err) {
            log.error("Error connecting to %s: %s", dsn, err);
        }
        else {
            log.info("DB connected!");
        }
    });

    //c.config.namedPlaceholders = true;
}

export var db = c;