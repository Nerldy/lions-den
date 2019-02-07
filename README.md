[![CircleCI](https://circleci.com/gh/Nerldy/lions-den.svg?style=svg)](https://circleci.com/gh/Nerldy/lions-den)
[![Coverage Status](https://coveralls.io/repos/github/Nerldy/lions-den/badge.svg?branch=master)](https://coveralls.io/github/Nerldy/lions-den?branch=master)

# LIONS DEN

Lions Den is all about a lion's community. Yo can create, update, delete, and read lions through a JSON object from the API.

## Getting Started

This API doesn't have a database which means the data isn't persistent. It saves the data on a list object. If you refresh the app, all data will be lost.

## Prerequisites

-   [NodeJS](https://nodejs.org/en/)

## Installing

Clone the repo

`git clone https://github.com/Nerldy/lions-den.git`

Then run `npm install` to install all the dependencies

## Run the App

`npm start`

It will run on `http://localhost:3000`

## Running the tests

`npm test`

To see coverage, run:

`npm test -- --coverage`

## Endpoints

| Endpoints          | Description                  |
| ------------------ | ---------------------------- |
| GET /v1            | Fetch all lions              |
| GET /v1/lions/:id  | Fetch a single lion with id  |
| PUT /v1/lions/:id  | Update a single lion with id |
| DEL /v1/lions/:id  | Delete a single lion with id |
| POST /v1/lions/:id | Create a lion                |
