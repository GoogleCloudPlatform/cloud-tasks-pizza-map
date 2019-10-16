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

const fetch = require('node-fetch');
const {v2beta3} = require('@google-cloud/tasks'); // Must be v2beta3 or else tasks creation fails
const client = new v2beta3.CloudTasksClient();

// Application configuration
const PROJECT = process.env.PROJECT || 'serverless-com-demo';
const QUEUE = process.env.QUEUE || 'my-queue';
const LOCATION = process.env.LOCATION || 'us-central1';

// Construct the fully qualified queue name.
const parent = client.queuePath(PROJECT, LOCATION, QUEUE);

/**
 * Gets a list of cities.
 * @returns {string[]} A list of city names.
 */
async function getLocationNames() {
  const URL_LOCATIONS = 'https://api.github.com/gists/7100f98e7d3dd48b3c4d7cb85cfd313f'; // 13k locations
  // const URL_LOCATIONS = 'https://api.github.com/gists/b503eecba3c49198cc0447550cbe3ccb'; // 19 locations
  const cities = await fetch(URL_LOCATIONS);
  const json = await cities.json();
  const content = json.files['cities.txt'].content;
  const contentItems = content.split('\n');
  return contentItems;
}

/**
 * Creates a Task Queue
 * @param {string} queueName The Cloud Tasks queue name.
 */
async function createQueue(queueName) {
  const request = {
    parent: client.locationPath(PROJECT, LOCATION),
    queue: {
      name: client.queuePath(PROJECT, LOCATION, queueName),
      rate_limits: {},
      retry_config: {},
    },
  };
  const res = await client.createQueue(request);
  return res;
}

/**
 * Returns `true` if a queue with `queueName` exists.
 * @param {string} queueName The queue name to check.
 * @returns `true` if the queue exists.
 */
async function queueExists(queueName) {
  const queue = await client.getQueue({
    name: client.queuePath(PROJECT, LOCATION, queueName)
  });
  return queue.length > 0;
}

/**
 * Creates a Cloud Task
 * @param {string} placeName The name of the city/place to target for our HTTP request.
 */
async function createTask(placeName) {
  const normalizedName = placeName.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-zA-Z]+/g, "-"); // Only keep [a-zA-Z]
  const name = client.taskPath(PROJECT, LOCATION, QUEUE, normalizedName);
  const task = {
    name, // Warning: Named Tasks cannot be re-created within a large timeframe (24h?)
    httpRequest: {
      httpMethod: 'GET',
      url: `https://${LOCATION}-${PROJECT}.cloudfunctions.net/tasks-pizza/target?id=${placeName}`,
    },
  };

  // Send create task request.
  const request = {parent, task};
  try {
    const [response] = await client.createTask(request);
    console.log(`Created task ${response.name}`);  
  } catch (e) {
    console.error(`ERROR: ${e.details} (${name})`);
  }
}

/**
 * Runs the program.
 * - Creates Cloud Tasks Queue if needed
 * - Creates N Cloud Tasks
 */
async function run() {
  console.log('Starting...');

  console.log('Checking if queue exists...');
  if (!(await queueExists(QUEUE))) {
    console.log(`Creating queue "${QUEUE}"...`);
    await createQueue(QUEUE);
  } else {
    console.log(`Queue "${QUEUE}" exists.`);
  }

  console.log('Creating Tasks...');
  const locations = await getLocationNames();
  for (const loc of locations) {
    await createTask(loc);
  }
  console.log('Done.');
}

// Export routes for Express app
module.exports.listnames = async (req, res) => {
  const locationList = await getLocationNames();
  res.send(locationList);
}
module.exports.start = async (req, res) => {
  await run();
  res.sendStatus(200);
}
