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
features | has_one **FeatureSet** | what kind of functionality can we expect the `data_source` to provide. This is mostly to guide the UI so it can be written in a general way

Relation Name | Type | Comments
:---------- | :--- | :-------
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
setlistfm | boolean | Does the artist have normalized data for songs, venues, etc (basically, is setlist.fm data reliable). If this is `false` "sets" will be constructed with all the tracks for the show in one set
multiple_sources | boolean | To clean up the UI. Everything will still be stored as if it can support multiple sources. Some artists, such as Phish, won't ever have multiple sources for a show. This will allow queries and UI paths to short-circuit.
reviews_ratings | boolean
tours | boolean

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


### Set

Column Name | Type | Comments
:---------- | :--- | :-------
index | int | Used for ordering the sets properly
name | string

Relation Name | Type | Comments
:---------- | :--- | :-------
tracks | has_many **Track**
show | belongs_to **Show** | Sets are unique to a given show

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


## Functionality required to stream

Feature | archive.net | panicstreams.com | phish.in | setlists.net | 
:------ | :---------- | :--------------- | :------- | 
MP3 URL | 