#!/bin/bash

# Deploys the application to Google Cloud Functions
deploy_to_functions() {
  echo 'Deploying to Cloud Functions...';
  gcloud functions deploy tasks-pizza \
    --trigger-http \
    --runtime=nodejs10 \
    --env-vars-file=.env.yaml
  echo "Deployed $(gcloud functions describe tasks-pizza --format 'value(httpsTrigger.url)')"
}

# Deploys the application to Google Cloud Run
deploy_to_run() {
  echo 'Deploying to Cloud Run...';
  gcloud components install beta
  GCP_PROJECT=$(gcloud config list --format 'value(core.project)' 2>/dev/null)
  gcloud config set run/region us-central1
  gcloud builds submit --tag gcr.io/$GCP_PROJECT/tasks-pizza
  gcloud beta run deploy tasks-pizza \
    --image gcr.io/$GCP_PROJECT/tasks-pizza \
    --platform managed \
    --allow-unauthenticated
  echo "Deployed $(gcloud beta run routes describe tasks-pizza --platform managed --format 'value(status.address.url)')"
}