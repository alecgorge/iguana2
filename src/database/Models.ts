/**
 * Created by alecgorge on 4/8/15.
 */
///<reference path="../../typings/tsd.d.ts" />

import orm = require('orm');
import Promise = require('bluebird');
import mysql = require('mysql');
var db = require('../database/Database').db;

class IguanaModel {
    public tableName : string;

    public id : number;

    public hasMany<T extends IguanaModel>(objs : T) : Promise<T[]> {
        return new Promise<T[]>(function (resolve: (result: T[]) => void, reject: (error: any) => void) {
            db.query(
                "SELECT * FROM ?? WHERE ?? = ?",
                [objs.tableName, this.tableName.toLowerCase() + "_id", this.id],
                function(err : mysql.IError, results : any[]) {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(results);
                    }
                }
            );
        });
    }

    public manyMany<T extends IguanaModel>(objs : T) : Promise<T[]> {
        return new Promise<T[]>(function (resolve: (result: T[]) => void, reject: (error: any) => void) {
            var join_table_name = [this.tableName, objs.tableName].sort().join("_").toLowerCase();
            db.query(
                "SELECT * " +
                "FROM ?? x" +
                "INNER JOIN ?? y ON x.?? = y.?? " +
                "WHERE y.?? = ?",
                [objs.tableName,
                join_table_name, ]
                [join_table_name, "ASdf", this.tableName.toLowerCase() + "_id", this.id],
                function(err : mysql.IError, results : any[]) {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(results);
                    }
                }
            );
        });
    }

    public belongsTo<T extends IguanaModel>(obj : T) : Promise<T> {
        return new Promise<T>(function (resolve:(result:T) => void, reject:(error:any) => void) {
            db.query(
                "SELECT * FROM ?? WHERE ?? = ? LIMIT 1",
                [obj.tableName, "id", this.id],
                function (err:mysql.IError, results:any[]) {
                    if (err) {
                        reject(err);
                    }
                    else if (results.length == 0) {
                        resolve(null);
                    }
                    else {
                        resolve(results[0]);
                    }
                }
            );
        });
    }

    public hasOne<T extends IguanaModel>(obj : T) : Promise<T> {
        return new Promise<T>(function (resolve:(result:T) => void, reject:(error:any) => void) {
            db.query(
                "SELECT * FROM ?? WHERE ?? = ? LIMIT 1",
                [obj.tableName, this.tableName.toLowerCase() + "_id", this.id],
                function (err:mysql.IError, results:any[]) {
                    if (err) {
                        reject(err);
                    }
                    else if (results.length == 0) {
                        resolve(null);
                    }
                    else {
                        resolve(results[0]);
                    }
                }
            );
        });
    }
}

class FeatureSet extends IguanaModel {
    eras : boolean;
    multiple_sources : boolean;
    reviews_ratings : boolean;
    tours : boolean;
    taper_notes : boolean;
    source_information : boolean;
    sets : boolean;
    venues : boolean;
    songs : boolean;
}

class Artist extends IguanaModel {
    public tableName : string = "Artist";

    public name : string;
    public identifier : string;
    public data_source : string;
    public musicbrainz_id : string;

    public feature_set_id : number;
    public features : FeatureSet;

    getYears() : Promise<Year[]> { return this.hasMany(new Year); }
    getShows() : Promise<Show[]> { return this.hasMany(new Show); }
    getEras()  : Promise<Era[]>  { return this.hasMany(new Era);  }
    getTours() : Promise<Tour[]> { return this.hasMany(new Tour); }
    getSongs() : Promise<Song[]> { return this.hasMany(new Song); }

    getFeatureSet() : Promise<FeatureSet> { return this.hasOne(new FeatureSet); }
}

class Year extends IguanaModel {
    public tableName : string = "Year";

    public year : number;
    public show_count : number;
    public recording_count : number;
    public duration : number;
    public avg_duration : number;
    public avg_rating : number;

    getArtist() : Promise<Artist> { return this.belongsTo(new Artist); }
    getEra() : Promise<Era> { return this.belongsTo(new Era); }
}

class Era extends IguanaModel {
    public tableName : string = "Era";

    getArtist() : Promise<Artist> { return this.belongsTo(new Artist); }
    getYears() : Promise<Year[]> { return this.hasMany(new Year); }
}

class Show extends IguanaModel {
    public tableName : string = "Show";

    public date : Date;
    public display_date : string;
    public rating_weighted_avg : number;
    public duration_avg : number;
    public source_count : number;

    getTour()   : Promise<Tour>     { return this.belongsTo(new Tour); }
    getVenue()  : Promise<Venue>    { return this.belongsTo(new Venue); }
}

function loadModels(db : orm.ORM, cb: () => void) {
    var int = {type: 'number', rational: false};
    var unsigned_int = {type: 'number', rational: false, unsigned: true};
    var float = {type: 'number', rational: true};

    var Artist : orm.Model = db.define("Artist", {
        name                : {type: "text", size: 100},
        identifier          : {type: "text", size: 100},
        data_source         : {type: "text", size: 30},
        musicbrainz_id      : {type: "text", size: 35}
    });

    var FeatureSet = db.define("FeatureSet", {
        eras                : 'boolean',
        multiple_source     : 'boolean',
        reviews_ratings     : 'boolean',
        tours               : 'boolean',
        taper_notes         : 'boolean',
        source_information  : 'boolean',
        sets                : 'boolean',
        venues              : 'boolean',
        songs               : 'boolean'
    });

    var Year = db.define("Year", {
        year                : int,
        show_count          : int,
        recording_count     : int,
        duration            : unsigned_int,
        avg_duration        : float,
        avg_rating          : float
    });

    var Era = db.define("Era", {
        name                : "text"
    });

    var Show = db.define("Show", {
        date                : {type: "date", time: false},
        display_date        : {type: "text", size: 10},
        source_count        : int,
        rating_weighted_avg : float,
        duration_avg        : float
    });

    var Source = db.define("Source", {
        source_id           : "text",
        description         : {type: "text", size: 10240},
        taper               : "text",
        transferrer         : "text",
        lineage             : "text",
        is_soundboard       : "boolean",
        is_remastered       : "boolean",
        rating_avg          : float,
        rating_count        : int,
        rating_weighted_avg : float
    });

    var SourceSet = db.define("SourceSet", {
        index               : int,
        name                : "text",
        is_encore           : "boolean"
    });

    var SourceTrack = db.define("SourceTrack", {
        track_position      : int,
        title               : "text",
        duration            : unsigned_int,
        slug                : "text",
        mp3_url             : "text"
    });

    var SourceReview = db.define("SourceReview", {
        review_title        : "text",
        review              : {type: "text", size: 10240},
        author              : "text",
        date                : {type: "date", time: true},
        rating              : int
    });

    var Song = db.define("Song", {
        title               : "text",
        slug                : "text",
        play_count          : int
    });

    var Set = db.define("Set", {
        index               : int,
        name                : "text",
        is_encore           : "boolean"
    });

    var Track = db.define("Track", {
        track_position      : int,
        title               : "text"
    });

    var Tour = db.define("Tour", {
        name                : "text",
        show_count          : int,
        start_date          : {type: "date", time: false},
        end_date            : {type: "date", time: false}
    });

    var Venue = db.define("Venue", {
        name                : "text",
        city                : "text",
        state               : "text",
        state_code          : {type: "text", size: 6},
        lat                 : float,
        long                : float,
        country             : "text",
        country_code        : {type: "text", size: 2},
        source_id           : "text"
    });

    /**** Artist Relations ****/
    // Artist has one FeatureSet
    Artist.hasOne("feature_set", FeatureSet, { autoFetch: true });

    // Artist has many Year
    Year.hasOne("artist", Artist, { reverse: "years" });

    // Artist has many Show
    Show.hasOne("artist", Artist, { reverse: "shows" });

    // Artist has many Era
    Era.hasOne("artist", Artist, { reverse: "eras" });

    // Artist has many Tours
    Tour.hasOne("artist", Artist, { reverse: "tours" });

    // Artist has many Songs
    Song.hasOne("artist", Artist, { reverse: "songs" });

    /**** Year Relations ****/
    // Year belongs_to Artist => in Artist

    // Year belongs_to Era
    Year.hasOne("eras", Era, { reverse: "eras" });

    // Year has_many Show
    Show.hasOne("year", Year, { reverse: "shows" });

    /**** FeatureSet Relations ****/
    // FeatureSet belongs_to Artist => in Artist

    /**** Era Relations ****/
    // Era belongs_to Artist => in Artist

    // Era has_many Year => in Year

    /**** Show Relations ****/
    // Show belongs_to Tour
    Show.hasOne("tour", Tour, { reverse: "shows" });

    // Show belongs_to Venue
    Show.hasOne("venue", Venue, { reverse: "shows" });

    // Show has_many Source
    Source.hasOne("show", Show, { reverse: "sources" });

    // Show has_many Set
    Set.hasOne("show", Show, { reverse: "sets" });

    // Show belongs_to Year => in Year

    // Show belongs_to Artist => in Artist

    // Show has_many Song
    Show.hasMany("songs", Song, {}, { reverse: "shows" });

    // Show has_many Track
    Track.hasOne("show", Show, { reverse: "tracks" });

    /**** Source Relations ****/
    // Source belongs_to Show => in Show

    // Source has_many SourceReview
    SourceReview.hasOne("source", Source, { reverse: "reviews" });

    // Source has_many SourceSet
    SourceSet.hasOne("source", Source, { reverse: "sets" });

    // Source has_many SourceTrack
    SourceTrack.hasOne("source", Source, { reverse: "tracks" });

    /**** SourceSet Relations ****/
    // SourceSet has_many SourceTrack
    SourceTrack.hasOne("set", SourceSet, { reverse: "tracks" });

    // SourceSet belongs_to Source => in Source

    /**** SourceTrack Relations ****/
    // SourceTrack belongs_to Source => in Source

    // SourceTrack belongs_to SourceSet => in SourceSet

    /**** SourceReview Relations ****/
    // SourceReview belongs_to Source => in Source

    /**** Song Relations ****/
    // Song belongs_to Artist => in Artist

    // Song has_many Show => in Show

    /**** Set Relations ****/
    // Set has_many Track
    Track.hasOne("set", Set, { reverse: "tracks" });

    // Set belongs_to Show => in Show

    /**** Track Relations ****/
    // Track belongs_to Show => in Show

    // Track belongs_to Set => in Set

    /**** Tour Relations ****/
    // Tour has_many Show => in Show

    // Tour belongs_to Artist => in Artist

    /**** Venue Relations ****/
    // Venue has_many Show => in Show

    // Venue belongs_to Artist => in Artist

    cb();
}

export = loadModels;