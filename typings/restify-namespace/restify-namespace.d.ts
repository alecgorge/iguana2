// Type definitions for restify-namespace - simple route namespacing
// Project: https://github.com/mpareja/node-restify-namespace
// Definitions by: Alec Gorge <https://github.com/alecgorge>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../restify/restify.d.ts" />

declare module "restify-namespace" {
    import restify = require('restify');

    function namespace(app: restify.Server, prefix: string, callback: () => any);

    export = namespace;
}
