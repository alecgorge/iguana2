# iguana2 roadmap

A complete rewrite of [iguana](https://github.com/alecgorge/iguana) to be more abstracted and support a variety of sources. It also sets up data to be better prepared for future additions of users and statistic generation.

The primary technical goal to provide an abstraction over media sources such as [archive.org](http://archive.org), [panicstream.com](http://panicstream.com) and [phish.in](http://phish.in) and integrate metadata sources such as [setlist.fm](http://setlist.fm) or [phish.net](http://phish.net) to provide extended metadata or reviews. This is complicated by the fact that a media source may provide reliable metadata as well.

The ultimate functional goal of iguana2 is to allow me to unify and rewrite (in Swift!) the networking and playback codebases for PhishOD and Relisten app without losing any of the extra features [PhishOD](http://phishod.alecgorge.com) has because of much better data [phish.in](http://phish.in) and [phish.net](http://phish.net) provide.

## Core Tenets

1. Music is #1. Never hide a show because we don't have metadata.
2. Make sure to credit the tapers and hosts of content &mdash; nothing is possible without them.
3. Utilize secondary, metadata-only sources to provide more ways to access the music. Don't try to match music sources to metadata sources. This will fail.

## Definitions

Data types are all Postgres notation and implications.

All data structures have a unique, autoincrementing `id` and a `created_at` and `updated_at` field.

#### Data Collection Techniques

* `Phish`
  1. Import media and some metadata from [phish.in](http://phish.in)
  2. Import more metadata from [phish.net](http://phish.net)
  
* `ArchiveSetlistFm`
  1. Import media from [archive.org](http://archive.org)
  2. Import setlist metadata from [setlist.fm](http://setlist.fm)
  
* `JustArchive` (when setlist.fm doesn't have good information for an artist, basically iguana 1.0)
	1. Import media and build setlist information based on [archive.org](http://archive.org). Only attempt to reuse venues when they belong specifically to that artist (setlist.fm venues are shared across artists).
	
* `WidespreadPanic`
	1. Import media from [panicstream.com](http://panicstream.com).
	1. Import setlist data just like `ArchiveSetlistfm`.

### artists

Column Name | Type | Comments
:---------- | :--- | :-------
name | text
upstream\_identifier | text | potentially used by the `data_source` to look up data appropriately
data\_source | text | an identifier referring to one of the different data collection techniques (Phish, ArchiveSetlist, JustArchive, etc)
musicbrainz_id | text | A useful identifier for integrating with a variety of services

### years

Cached summarization data about each year of an artist.

Column Name | Type | Comments
:---------- | :--- | :-------
artist_id | integer
year | text | String because it is possible that the year might not be known
show_count | integer | **NOT** the number of recordings
recording_count | integer
duration | integer  | The sum of the duration (in seconds) of each show in the year (use the longest source per show)
avg_duration | real | The average duration of each show in the year (use the longest source per show)
avg_rating | real | The average of all the average ratings for each show in the year

### features

Column Name | Type | Comments
:---------- | :--- | :-------
artist_id | integer
descriptions | boolean | Sometimes there are just a taper notes file
eras | boolean | Does the artist have eras (Phish 1.0, Phish 2.0, Phish 3.0)
multiple_sources | boolean | To clean up the UI. Everything will still be stored as if it can support multiple sources. Some artists, such as Phish, won't ever have multiple sources for a show. This will allow queries and UI paths to short-circuit.
reviews | boolean
ratings | boolean
tours | boolean
taper_notes | boolean | Is the raw txt file from the source available?
source_information | boolean | Broken down information (taper, transferrer, etc) instead of big taper notes
sets | boolean | For track listings. Obviously every band has sets when playing live.
per\_show\_venues | boolean | We know for sure what the venue is.
per\_source\_venues | boolean | No authority for venues, every source has to list it
venue\_coords | boolean | Lat and long for venues. Could be calculated if location information is specific enough
songs | boolean
years | boolean | Default true. What artist wouldn't??
track_names | boolean | For very raw sources where we only have filenames
track_md5s | boolean
review_titles | boolean
jam_charts | boolean
setlist\_data\_incomplete | boolean | Sometimes setlist.fm isn't up to date/doesn't go all the way back. We should provide info that songs/tours/etc are incomplete

### eras

Logical grouping of several years

Column Name | Type | Comments
:---------- | :--- | :-------
artist_id | integer
order | integer
name | string

### shows

Column Name | Type | Comments
:---------- | :--- | :-------
year_id | integer
artist_id | integer
tour_id | nullable integer
venue_id | nullable integer
era_id | nullable integer
date | date | See `display_date`.
avg\_rating\_weighted | real | calculated based on # of reviews and the rating itself
avg\_duration | real
display_date | varchar(32) | Sometimes the date is unknown (1970-XX-XX so this column is used for display and the first of the month or year is used for sorting). This is something that is unique on (artist_id + display_date) and should be used to 

### sources

Column Name | Type | Comments
:---------- | :--- | :-------
show_id | integer
upstream_identifier | string | Something to identify the this information in the data source **unqiue**
is_soundboard | boolean
is_remastered | boolean
avg_rating | integer
num_reviews | integer
has_jamcharts | boolean
description | text
taper_notes | text | For sources that don't have detailed info, this will be the whole txt file. For others it is just a bit information
source | text
taper | text
transferer | text
lineage | text

### source_sets

Column Name | Type | Comments
:---------- | :--- | :-------
source_id | integer
index | integer | Used for ordering the sets properly
is_encore | boolean
name | text

### source_tracks

Column Name | Type | Comments
:---------- | :--- | :-------
source_id | integer
set_id | integer
track_position | integer
duration | integer
title | text
slug | text
mp3_url | text
md5 | nullable text

### source_reviews

Column Name | Type | Comments
:---------- | :--- | :-------
source_id | integer
authored_at | timestamp with timezone
rating | integer | On a scale of one to 10
title | text
review | text
author | text

### setlist_shows

Column Name | Type | Comments
:---------- | :--- | :-------
artist_id | integer
venue_id | integer
tour_id | integer
upstream_identifier | text
date | date

### setlist_songs

Column Name | Type | Comments
:---------- | :--- | :-------
artist_id | integer
upstream_identifier | text | unique among artist\_id + upstream\_identifier
title | text
slug | text

### setlist\_song\_plays

Column Name | Type | Comments
:---------- | :--- | :-------
played\_setlist\_song\_id | integer
played\_setlist\_show\_id | integer

### tours

Tours **do not** overlap and can therefore be sorted by `start_date`.

Column Name | Type | Comments
:---------- | :--- | :-------
artist_id | integer
name | string
start_date | nullable date 
end_date | nullable date

### venues

Column Name | Type | Comments
:---------- | :--- | :-------
artist_id | nullable integer | Only needed for source specific venues
name | text
location | text | Could be City; State; City, State; City, Country
lat | nullable real
long | nullable real
upstream_identifier | text

## Indexing Approach

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
	2. Pull full show data for each remaining show `http://phish.in/api/v1/show-on-date/#{date | YYYY-MM-DD}.json`
		1. Pull data from 
	3. Import more metadata from [phish.net](http://phish.net)
5. Build years
6. Pull era list from `http://phish.in/api/v1/eras.json`
	9. Drop all `Era`s associated with `Phish` and re-add all eras from the JSON
  
### ArchiveSetlistFm

  1. Import setlist metadata from `http://api.setlist.fm/rest/0.1/artist/${musicbrainz_id}/setlists.json?p=${page}`
	  1. If the setlist id isn't in the database as upstream\_identifier import the setlist\_show
	  2. **setlist\_shows** If the lastUpdated is newer than the updated\_at remove the setlist\_show and the all entries in setlist\_song\_plays. Set updated\_at to lastUpdated
	  3. **venues**, **tours** Create or if lastUpdated > updated\_at update properties and set updated_at to lastUpdated
	  4. **setlist\_songs** if the song's id exists in the upstream identifier then add a record to the join table, otherwise add the song and then the join table record

  2. List identifiers from `http://archive.org/advancedsearch.php?q=collection%3A${upstream_identifier}&fl%5B%5D=date&fl%5B%5D=identifier&fl%5B%5D=year&fl%5B%5D=updatedate&sort%5B%5D=year+asc&sort%5B%5D=&sort%5B%5D=&rows=9999999&page=1&output=json&save=yes`
  	1. **sources** If the identifier isn't in the database, import the show
	2. **sources**, **source_sets**, **source_tracks** If the last updatedate is newer than the updated\_at, drop the source, the set and all associated tracks and re-add it
	3. **reviews** Check+add any new reviews
	4. *Note:* Adding means making 1 new source, 1 new set and n new tracks. Use setlist_show's venue id to pick the correct venue

  3. **shows** If there are sources without a corresponding shows row add them
  4. Update all years for the artist
	1. Set year\_id for shows for the appropriate year 
  
### JustArchive

When setlist.fm doesn't have good information for an artist, basically iguana 1.0.

1. See step 1 above, but also do a artist specific venue check as well
	
### WidespreadPanic

1. Import setlist data just like `ArchiveSetlistfm`.
2. Import media from [panicstream.com](http://panicstream.com).
