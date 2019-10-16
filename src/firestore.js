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
 * Firestore Methods
 * - All location data is stored in Firestore
 * - Every location is 1 Firestore Document that contains Maps API results
 * @see https://firebase.google.com/docs/firestore/quickstart
 * @see https://cloud.google.com/firestore/quotas
 */
const COLLECTION = 'tasks-pizza';

// Setup Firestore with default credentials
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
const db = admin.firestore();

// Lists all stored locations
module.exports.getLocations = async () => {
  const docs = await db.collection(COLLECTION).listDocuments();
  return docs.map(d => d.id);
}

// Get a single location
module.exports.getLocation = async (location) => {
  const doc = await db.collection(COLLECTION).doc(location).get();
  const data = doc.data();
  return data || { error: 'No data for this location found.'};
}

/**
 * Store the location data
 * @param {string} location The name of the location
 * @param {object} locationData The data about the location
 */
module.exports.storeLocation = async (location, locationData) => {
  return await db.collection(COLLECTION).doc(location).set(locationData);
}
