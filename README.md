# tasks-pizza

A sample application using Cloud Tasks and Google Maps to find the best pizza restaurants around
the world.

The program works in the following way:

1. Creates a Cloud Tasks Queue
1. Creates ~10,000 Cloud Tasks with different names of cities
1. Each Cloud Task executes a Cloud Function. This Function does the following:
  1. Looks up the best pizza restaurant in that city accoring to the Google Maps Places API
  1. Stores the restaurant data in Firestore

TODO: Add a program diagram that explains how the application works (after architecture is finalized).

## Setup

This sample uses many APIs and a Firestore database
that must be enable prior to running the application.

### Enable all APIs

The following APIs are used in this app:

- `Cloud Tasks API`
- `Maps Places API`
- `Maps Static Map API`
- `Maps Geocoding API`
- `Firestore API`

[Enable APIs](https://console.cloud.google.com/flows/enableapi?apiid=cloudtasks.googleapis.com,firestore.googleapis.com,places-backend.googleapis.com,static-maps-backend.googleapis.com,geocoding-backend.googleapis.com
).

### Create a Firestore database

Create a `Firestore` database:

[Create a `Firestore` database](https://firebase.google.com/docs/firestore/quickstart#create) with these configurations:
- Mode: `Test mode`
- Collection: `tasks-pizza`.

### Create an API Key

Create an [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key).
Create an `.env` file with a Google Maps API key:

```sh
KEY=AIeSyDh7ggKmvLzFAeq_ICGkO8ryvEMm3Nrde-z
```

## Run the Functions Framework

The [Functions Framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) enables
you to run a Google Cloud Function locally on your computer. This is very useful for testing our code.

To test our server locally, follow these instructions using our `KEY` from the previous step:

```sh
npm i
KEY=??? npm run ff
```

Observe the Functions Framework starts a server and logs information:

```
npx: installed 52 in 8.771s
Serving function...
Function: function
URL: http://localhost:8080/
```

Go to URL specified to view all routes for the application.

## Deploy your Google Cloud Function

Deploy your function using this script that uses `gcloud functions deploy` with configurations
needed for this application:

```sh
npm run deploy
```
