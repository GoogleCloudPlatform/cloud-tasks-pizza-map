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
 * The main GCF program
 */
require('dotenv').config();

// Express Routing
const express = require('express');
const app = express();
const routes = {
  '/tasks/start': require('./tasks').start,
  '/tasks/listnames': require('./tasks').list,
  '/maps/add': require('./maps').add,
  '/maps/get': require('./maps').get,
  '/maps/list': require('./maps').list,
  '/target': require('./maps').get, // Tasks target
};
Object.entries(routes).map(([route, func]) => app.use(route, func));
app.use('/', (req, res) => res.send(Object.keys(routes))); // default

// Export the Express app to the Functions Framework
exports.function = app;