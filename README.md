# @smarthost/feathers-unsplash

> FeathersJS service adapter for querying the Unsplash API

[![npm version](https://badge.fury.io/js/%40smarthost%2Ffeathers-unsplash.svg)](https://badge.fury.io/js/%40smarthost%2Ffeathers-unsplash)
[![build](https://github.com/smart-host/feathers-unsplash/actions/workflows/lint-and-test.yml/badge.svg)](https://github.com/smart-host/feathers-unsplash/actions/workflows/lint-and-test.yml)

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

It is built on top of the official [unsplash-js](https://github.com/unsplash/unsplash-js) package.

This is a fork and update of [marshallswain/feathers-unsplash](https://github.com/marshallswain/feathers-unsplash)

## Supported Services

Below is a list of all exposed services and their implemented methods.
All can be used like the UnsplashPhotos example given below

- UnsplashPhotos (find, get)
- UnsplashPhotoTrack (create)
- UnsplashCollections (find, get)
- UnsplashCollectionPhotos (find)
- UnsplashTopics (find, get)
- UnsplashTopicPhotos (find)
- UnsplashUsers (find, get)
- UnsplashUserPhotos (find)
- UnsplashUserCollections (find)
- UnsplashUserLikes (find)

> More documentation coming soon

## Install

```shell
npm install @smarthost/feathers-unsplash node-fetch unsplash-js

yarn add @smarthost/feathers-unsplash node-fetch unsplash-js
```

Other packages needed may be: `tslib`, `@feathersjs/errors`

This adapter requires `fetch` support, which means you'll need to provide it on the global scope. This means that somewhere in your app you need to use this code:

```js
// preferably in the the index file
const fetch = require("node-fetch");
global.fetch = fetch;

// typescript
import fetch from "node-fetch";
global.fetch = fetch as any; // trick for type imcompatibility for now
```

## Setup API Access

First you'll need to setup Unsplash API access.

1. Create an app on the [Unsplash API](https://unsplash.com/developers)
2. Copy the `accessKey` into an environment variable.
3. Setup the FeathersJS config

```json
// default.json

"unsplash": {
    "accessKey": "MYAPPNAME_UNSPLASH_ACCESS_KEY"
}
```

## Setup a Service

The easiest way to setup a service is to use the [FeathersJS Cli](https://docs.feathersjs.com/guides/basics/services.html#generating-a-service) to generate a "Custom Service". You can then delete the `service-name.class.js` file that the generator makes and use code like in this example:

```js
// Initializes the `unsplash-photos` service on path `/unsplash-photos`
const { UnsplashPhotos } = require("@smarthost/feathers-unsplash");
const hooks = require("./unsplash-photos.hooks");

module.exports = function (app) {
  const options = {
    accessKey: app.get("unsplash").accessKey,
  };

  // Initialize the service with any options it requires
  app.use("/unsplash-photos", new UnsplashPhotos(options, app));

  // Get the initialized service so that we can register hooks
  const service = app.service("unsplash-photos");

  service.hooks(hooks);
};
```

## API

### find

The `find` method supports searching photos by the following query params:

- `query`: the search text
- `orientation`: can be either `portrait` or `landscape`. Any other values return an empty list.
- `collectionIds`: an array of collection ids.
- also other parameters supported by the unsplash wrapper. [search.getPhotos](https://github.com/unsplash/unsplash-js#searchgetphotosarguments-additionalfetchoptions)

It also supports familiar pagination attributes: `$limit` and `$skip`. Note that since the Unsplash API only supports page-level pagination (not record-level skipping like most FeathersJS adapters), you must provide `$skip` as a multiple of the `$limit`. Here is an example query:

```js
const response = await app.service('unsplash-photos').find({
  $limit: 10, // this is the default limit
  $skip: 10 // Skipping 10 returns the second page of data.
  query: {
    query: 'food',
    orientation: 'portrait',
  }
})
```

### get

The `get` method can be used in two ways:

- Pass an image `id` to retrieve data about the image.
- Pass `'random'` to retrieve a random image. See possible params for [photos.getRandom](https://github.com/unsplash/unsplash-js#photosgetrandomarguments-additionalfetchoptions)

```js
const imageData = await app.service("unsplash-photos").get(id);
const randomImageData = await app.service("unsplash-photos").get("random");
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
