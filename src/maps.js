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
const fetch = require('node-fetch');
const maps = require('@google/maps').createClient({
  key: KEY,
  Promise,
});
const firestore = require('./firestore');

if (!KEY) {
  throw new Error('Missing `KEY` environment variable for Google Maps.');
}

/**
 * Gets a static map of a location.
 * @example https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=2800x1900&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyDh7gKmvLzFA0q_ICGkO8ryvEMm3Nrde-c&scale=2
 * @see https://developers.google.com/maps/documentation/javascript/markers#introduction
 */
async function getStaticMap() {
  const centerQuery = 'Brooklyn+Bridge,New+York,NY';
  const staticMapURL = 'https://maps.googleapis.com/maps/api/staticmap?' + [
    `center=${centerQuery}`,
    `zoom=14`,
    `size=500x500`, // 2800x1900
    `maptype=roadmap`,
    `markers=color:blue%7Clabel:S%7C40.702147,-74.015794`,
    `key=${KEY}`
  ].join('&');
  console.log(staticMapURL);
  const staticMap = await fetch(staticMapURL);
  console.log(staticMap);
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
  var places = await maps.findPlace({
    input: `Best pizza near ${placesQuery}`,
    inputtype: 'textquery',
    language: 'en',
    locationbias: `point:${lat},${lng}`,
    fields: ['photos','formatted_address','name','rating','opening_hours','geometry'],
  }).asPromise();
  const place = places.json.candidates[0];
  return place;
}

// Gets Map data from GMP Places API.
module.exports.get = async (req, res) => {
  const placeId = req.query.query;
  if (!placeId) return res.send({error: 'No ?query='});
  const place = await getPlace(placeId);
  res.send(place);
};

// Returns a list of maps in the Firestore database
module.exports.list = async (req, res) => {
  const locations = await firestore.getLocations();
  res.send(locations);
};

// Adds a specific map to the Firestore database
module.exports.add = async (req, res) => {
  // Only handle valid requests
  const placeId = req.query.query;
  if (!placeId) return res.send({error: 'No ?query='});

  // Get the place
  const place = await getPlace(placeId);
  const placeData = {placeId, place};
  await firestore.storeLocation(placeId, placeData);
  res.send(placeData);
};
