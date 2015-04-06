# iguana2 roadmap

A complete rewrite of [iguana](https://github.com/alecgorge/iguana) to be more abstracted and support a variety of sources. It also sets up data to be better prepared for future additions of users and statistic generation.

The primary technical goal to provide an abstraction over media sources such as [archive.org](http://archive.org), [panicstream.com](http://panicstream.com) and [phish.in](http://phish.in) and integrate metadata sources such as [setlist.fm](http://setlist.fm) or [phish.net](http://phish.net) to provide extended metadata or reviews. This is complicated by the fact that a media source may provide reliable metadata as well.

The ultimate functional goal of iguana2 is to allow me to unify the networking and playback codebases for PhishOD, Listen to the Dead and the upcoming Relisten app without losing any of the extra features [PhishOD](http://phishod.alecgorge.com) has because of much better data [phish.in](http://phish.in) and [phish.net](http://phish.net) provide.

## Definitions

Data types: boolean, date, datetime, int, float, varchar, text

All data structures have a unique, autoincrementing id and a created_at and updated_at field.

#### Data Collection Techniques

* `Phish`
  1. Import media and some metadata from [phish.in](http://phish.in)
  2. Import more metadata from [phish.net](http://phish.net)
  
* `ArchiveSetlistFm`
  1. Import setlist metadata from [setlist.fm](http://setlist.fm)
  2. Import media from [archive.org](http://archive.org) by matching the data in each source to the show metadata imported from `setlist.fm`. Show, venue and song data comes from setlist.fm, source data and track names come from archive.org but the setlist should be visible in the UI. **Report when a match is not found, with enough information to import that single item later after the algorithm has been tweaked**.
  
* `JustArchive` (when setlist.fm doesn't have good information for an artist, basically iguana 1.0)
	1. Import media and build setlist information based on [archive.org](http://archive.org). Only attempt to reuse venues when they belong specifically to that artist (setlist.fm venues are shared across artists).
	
* `WidespreadPanic`
	1. Import setlist data just like `ArchiveSetlistfm`.
	2. Import media from [panicstream.com](http://panicstream.com).

### Artist

Column Name | Type | Comments
:---------- | :--- | :-------
name | string
identifier | string | potentially used by the `data_source` to look up data appropriately
data_source | string | an identifier refering to one of the different data collection techniques (Phish, ArchiveSetlist, JustArchive, etc)
musicbrainz_id | string | A useful identifier for integrating with a variety of services

Relation Name | Type | Comments
:---------- | :--- | :-------
features | has_one **FeatureSet** | what kind of functionality can we expect the `data_source` to provide. This is mostly to guide the UI so it can be written in a general way
years | has_many **Year**
shows | has_many **Show**

### Year

Cached summerization data about each year of an artist.

Column Name | Type | Comments
:---------- | :--- | :-------
year | int 
show_count | int | **NOT** the number of recordings
recording_count | int
duration | The sum of the duration of each show in the year (use the longest source per show)
avg_duration | float | The average duration of each show in the year (use the longest source per show)
avg_rating | float | The average of all the average ratings for each show in the year

Relation Name | Type | Comments
:---------- | :--- | :-------
artist | belongs_to **Artist**

### FeatureSet

Column Name | Type | Comments
:---------- | :--- | :-------
eras | boolean | Does the artist have eras (Phish 1.0, Phish 2.0, Phish 3.0)
multiple_sources | boolean | To clean up the UI. Everything will still be stored as if it can support multiple sources. Some artists, such as Phish, won't ever have multiple sources for a show. This will allow queries and UI paths to short-circuit.
reviews_ratings | boolean
tours | boolean
taper_notes | boolean | Is the raw txt file from the source available?
source_information | boolean | Broken down information (taper, transferrer, etc) instead of big taper notes
sets | boolean
venues | boolean
songs | boolean

Relation Name | Type | Comments
:---------- | :--- | :-------
artist | belongs_to **Artist**

### Era

Logical grouping of several years

Column Name | Type | Comments
:---------- | :--- | :-------
name | string

Relation Name | Type | Comments
:---------- | :--- | :-------
artist | belongs_to **Artist**
years | has_many **Year**

### Show

Column Name | Type | Comments
:---------- | :--- | :-------
date | date | See `display_date`.
display_date | string | Sometimes the date is unknown (1970-XX-XX so this column is used for display and the first of the month or year is used for sorting)
year | int
rating_weighted_avg | float
duration_avg | float

Relation Name | Type | Comments
:---------- | :--- | :-------
tour | belongs_to **Tour**
venue | belongs_to **Venue**
sources | has_many **Source**
sets | has_many **Set**

### Source

Column Name | Type | Comments
:---------- | :--- | :-------
source_id | string | Something to identify the this information in the data source
description | string
taper_notes | string | For sources that don't have detailed info, this will be the whole txt file. For others it is just a bit informtation
source | string
taper | string
transferer | string
lineage | string
is_soundboard | boolean
is_remastered | boolean
rating_avg | float
rating_count | int
rating_weighted_avg | float

Relation Name | Type | Comments
:---------- | :--- | :-------
show | belongs_to **Show**
reviews | has_many **SourceReview**
sets | has_many **SourceSet**
tracks | has_many **SourceTrack**

### SourceSet

Column Name | Type | Comments
:---------- | :--- | :-------
index | int | Used for ordering the sets properly
name | string
is_encore | boolean

Relation Name | Type | Comments
:---------- | :--- | :-------
tracks | has_many **SourceTrack**
show | belongs_to **SourceShow** | SourceSets are unique to a given Source

### SourceTrack

Column Name | Type | Comments
:---------- | :--- | :-------
track_position | int
title | string
duration | int
slug | string
mp3_url | string

Relation Name | Type | Comments
:---------- | :--- | :-------
source | belongs_to **Source**
set | belongs_to **SourceSet**

### SourceReview

Column Name | Type | Comments
:---------- | :--- | :-------
review_title | string
review | string
author | string
date | date
rating | int

Relation Name | Type | Comments
:---------- | :--- | :-------
source | belongs_to **Source**

### Song

Column Name | Type | Comments
:---------- | :--- | :-------
title | string
slug | string
play_count | int | Counted from `Track` not `SourceTrack`.

Relation Name | Type | Comments
:---------- | :--- | :-------
artist | belongs_to **Source**

### Set

**Note:** may not provide useful information for all artists.

Column Name | Type | Comments
:---------- | :--- | :-------
index | int | Used for ordering the sets properly
name | string
is_encore | boolean

Relation Name | Type | Comments
:---------- | :--- | :-------
tracks | has_many **Track**
show | belongs_to **Show** | Sets are unique to a given show

### Track

Column Name | Type | Comments
:---------- | :--- | :-------
track_position | int
title | string

Relation Name | Type | Comments
:---------- | :--- | :-------
show | belongs_to **Show**
set | belongs_to **Set**
song | belongs_to **Song**

### Tour

Tours **do not** overlap and can therefore be sorted by `start_date`.

Column Name | Type | Comments
:---------- | :--- | :-------
name | string
show_count | int | Perhaps this shouldn't be stored and simply calculated and returned?
start_date | date 
end_date | date

Relation Name | Type | Comments
:---------- | :--- | :-------
show | has_many **Show**
artist | belongs_to **Artist**

### Venue

Column Name | Type | Comments
:---------- | :--- | :-------
name | string
city | string
state | string
state_code | string
lat | float
long | float
country | string
country_code | string
source_id | string

Relation Name | Type | Comments
:---------- | :--- | :-------
show | has_many **Show**
artist | belongs_to **Artist** | this is only needed for artists not on setlist.fm. otherwise, venues **can** be shared.

## Functionality required to stream

Legend: **P**: partial (not the best data but it can be done). **✓**: complete.

Feature 		| archive.net | panicstreams.com | phish.in | phish.net | setlist.fm | manual entry | calculated |
:------ 		| :---------: | :--------------: | :------: | :-------: | :--------: | :----------: | :--------: |
Artist			| | | | | | ✓ |
Year			| | | | | | | ✓
FeatureSet		| | | | | | ✓ |
Era				| | | ✓ | | |
Show			| P | P | ✓ | ✓ | ✓ | | P (rating)
Source			| ✓ | ✓ | ✓ | P (rating)
SourceSet		| P | P | ✓
SourceTrack		| ✓ | ✓ | ✓
SourceReview	| ✓ |   |   | ✓ |
Song			| | | ✓ | | ✓ |
Set				| P | P | ✓ | ✓ | ✓
Track			| P | P | ✓ | ✓ | ✓
Tour			| | | ✓ | ✓ | P
Venue			| P | P | ✓ | ✓ | ✓

## Indexing Approach

```
module DataImport {
	export class Indexer {
		artist: Artist;
		constructor(artist: Artist);
		rebuildYears() : Promise;
	}
}
```

### Phish

1. Pull tour list from `http://phish.in/api/v1/tours.json?per_page=2000`
	1. Add any tour to `Tour` whose `name` doesn't exist in `Tour.name`
2. Pull song list from `http://phish.in/api/v1/songs.json?per_page=2000`
	1. Add any song to `Song` whose `title` doesn't exist in `Song.title`
	2. Build an in memory map between phish.in's `id` and iguana2's `Song.id` (to be used when inserting shows)
3. Pull venue list from `http://phish.in/api/v1/venues.json?per_page=2000`
	1. Add any song to `Venue` whose `id` doesn't exist in `Venue.source_id`
	2. Build an in memory map between phish.in's `id` and iguana2's `Venue.id`
4. Pull show list from `http://phish.in/api/v1/shows.json?per_page=2000`
	1. Filter the show list to only contain shows whose `id` value doesn't exist in `Source.source_identifier`. This way we only pull new shows.
	2. Pull full show data for each remaining show
		1. Pull data from `http://phish.in/api/v1/show-on-date/#{date | YYYY-MM-DD}.json`
	3. Import more metadata from [phish.net](http://phish.net)
5. Build years
6. Pull era list from `http://phish.in/api/v1/eras.json`
	9. Drop all `Era`s associated with `Phish` and re-add all eras from the JSON
  
### ArchiveSetlistFm

  1. Import setlist metadata from [setlist.fm](http://setlist.fm)
  2. Import media from [archive.org](http://archive.org) by matching the data in each source to the show metadata imported from `setlist.fm`. Show, venue and song data comes from setlist.fm, source data and track names come from archive.org but the setlist should be visible in the UI. **Report when a match is not found, with enough information to import that single item later after the algorithm has been tweaked**.
  
### JustArchive

When setlist.fm doesn't have good information for an artist, basically iguana 1.0.

1. Import media and build setlist information based on [archive.org](http://archive.org). Only attempt to reuse venues when they belong specifically to that artist (setlist.fm venues are shared across artists).
	
### WidespreadPanic

1. Import setlist data just like `ArchiveSetlistfm`.
2. Import media from [panicstream.com](http://panicstream.com).