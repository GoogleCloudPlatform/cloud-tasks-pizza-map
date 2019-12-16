# Cloud Tasks Pizza Map

<img width="880" alt="Google Maps of Earth with 16k pins" src="https://user-images.githubusercontent.com/744973/67051632-3bad8680-f101-11e9-8da0-6a4206f0a247.png">


A sample application using Cloud Tasks and Google Maps to find the best pizza restaurants around
the world.

The program works in the following way:

1. Creates a Cloud Tasks Queue
1. Creates ~10,000 Cloud Tasks with different names of cities
1. Each Cloud Task triggers a Cloud Function. This Function does the following:
    1. Looks up the best pizza restaurant in that city accoring to the Google Maps Places API
    1. Stores the restaurant data in Firestore

<img width="780" alt="An application architecture diagram of the Cloud Tasks with an HTTP target of a Cloud Function. The Cloud Function uses the Google Maps Nearby/Places APIs for map data and Firestore to store location data." src="https://user-images.githubusercontent.com/744973/67311141-a32e5200-f4c4-11e9-88d9-3bdb3cf1b665.png">

## Setup

This sample uses many APIs and a Firestore database
that must be enable prior to running the application.

### Enable all APIs

The following APIs are used in this app:

- `Cloud Tasks API`
- `Maps Places API`
- `Maps Geocoding API`
- `Firestore API`

[Enable these APIs](https://console.cloud.google.com/flows/enableapi?apiid=cloudtasks.googleapis.com,firestore.googleapis.com,places-backend.googleapis.com,static-maps-backend.googleapis.com,geocoding-backend.googleapis.com
).

### Create a Firestore database

[Create a `Firestore` database](https://firebase.google.com/docs/firestore/quickstart#create) with these configurations:
- Mode: `Test mode`
- Collection: `tasks-pizza`.

### Create an API Key

[Create a Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key).
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
KEY=??? npm start
```

Observe the Functions Framework starts a server and logs information:

```
npx: installed 52 in 8.771s
Serving function...
Function: function
URL: http://localhost:8080/
```

Go to URL specified to view all routes for the application.

## Deploy to Google Cloud

You have two options for deploying this application to Google Cloud:

- Cloud Functions
- Cloud Run

The `gcloud` commands for deploying to each target are in the `scripts.sh` file.

### Deploy to Google Cloud Function

Deploy your function on Google Cloud Functions on runtime Node 10:

```sh
npm run functions
```

### Deploy to Google Cloud Run

You can also deploy this application to Cloud Run by first building the container, then deploying:

```sh
npm run cloudrun
```

### GIF

Here is a GIF of the applicaiton working at different Google Map zoom levels
![A Google Map with thousands of pins at different zoom levels](https://user-images.githubusercontent.com/744973/69364872-2af0b300-0c61-11ea-951f-20272657a9c8.gif)
