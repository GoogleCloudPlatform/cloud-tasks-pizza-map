// Copyright 2019 Google LLC
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Methods for interacting with the Google Maps API
 * All methods require the environment variable `KEY`.
 */
const KEY = process.env.KEY;
const maps = require('@google/maps').createClient({
  key: KEY,
  Promise,
});
const firestore = require('./firestore');

if (!KEY) {
  throw new Error('Missing `KEY` environment variable for Google Maps.');
}

/**
 * Gets a photo given a photo reference hash.
 * @see https://developers.google.com/places/web-service/photos
 */
async function getPhoto(photoreference) {
  const photo = await maps.placesPhoto({
    photoreference,
    maxheight: 1600,
    maxwidth: 1600,
  }).asPromise();
  return photo;
}

/**
 * Returns a Google Maps Places API result for the best pizza near a location/place.
 * @param {string} placesQuery The place query.
 * @returns {object} The Google Maps Places API result.
 */
const getPlace = async (placesQuery) => {
  // Get the lat,lng for the query
  const geocoding = await maps.geocode({
    address: placesQuery,
  }).asPromise();
  if (!geocoding.json.results) throw new Error('No results');
  const {lat, lng} = geocoding.json.results[0].geometry.location;

  // Find the place
  // @see https://developers.google.com/places/web-service/search
  var places = await maps.placesNearby({
    radius: 5000, // meters
    keyword: 'pizza',
    type: 'restaurant',
    location: [lat, lng],
  }).asPromise();
  if (places.json.results.length === 0) return; // no results found
  const place = places.json.results[0];
  return place;
}

// Gets Map data for a single id from the Firestore database.
module.exports.get = async (req, res) => {
  const placeId = req.query.id;
  if (!placeId) return res.send({error: 'No ?id='});
  const place = await firestore.getLocation(placeId);
  res.send(place);
};

// Returns a list of map names in the Firestore database.
module.exports.listnames = async (req, res) => {
  const locations = await firestore.getLocations();
  res.send(locations);
};

// Adds a specific map to the Firestore database.
module.exports.add = async (req, res) => {
  // Only handle valid requests
  const id = req.query.id;
  if (!id) return res.send({error: 'No ?id='});

  // Get the place
  const place = await getPlace(id);
  if (!place) return res.send({error: 'No results found.'}); // no results found.
  const placeData = {
    id,
    place,
    url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
  };
  await firestore.storeLocation(id, placeData);
  res.send(placeData);
};
