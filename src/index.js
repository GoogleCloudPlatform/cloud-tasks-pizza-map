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
 * The main GCF function using the Functions Framework.
 * @see https://github.com/GoogleCloudPlatform/functions-framework-nodejs
 */
const path = require('path');
require('dotenv').config();

// Express Routing
const express = require('express');
const app = express();
const routes = {
  '/tasks/start': require('./tasks').start, // Creates ~13k Cloud Tasks
  '/tasks/listnames': require('./tasks').listnames, // Lists expected names of Tasks
  '/maps/add': require('./maps').add, // Adds 1 city record to the database
  '/maps/get': require('./maps').get, // Gets 1 city record from the database
  '/maps/listnames': require('./maps').listnames, // List the names of all city records
  '/maps/key': (req, res) => res.send({key: process.env.KEY}), // API KEY for frontend
  '/target': require('./maps').add, // Tasks target, query and add a city record
  '/web': (req, res) => res.sendFile(path.join(__dirname, 'index.html'))
};
Object.entries(routes).map(([route, func]) => app.use(route, func));
app.use('/', (req, res) => res.send(Object.keys(routes))); // default

// Export the Express app to the Functions Framework
exports.function = app;