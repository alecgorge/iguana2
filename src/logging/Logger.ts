/**
 * Created by alecgorge on 4/7/15.
 */
///<reference path="../../typings/tsd.d.ts" />

import bunyan = require("bunyan");

var logger = bunyan.createLogger({name: "iguana2"});

export function defaultLogger():bunyan.Logger {
    return logger;
}
