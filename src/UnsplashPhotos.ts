import { createApi } from "unsplash-js";
import { Params } from "@feathersjs/feathers";
import { GeneralError, NotImplemented } from "@feathersjs/errors";

interface Options {
  accessKey?: string;
  headers?: HeadersInit;
}

export class UnsplashPhotos {
  model;
  options: Options;

  constructor(options: Options) {
    this.options = options || {};

    const { accessKey, headers } = this.options;
    if (!accessKey) {
      throw new Error(
        "You must provide an Unplash `accessKey` to any Unsplash service"
      );
    }
    this.model = createApi({ accessKey, headers });
  }

  async find(params: Params): Promise<unknown> {
    const { $limit, $skip } = params;
    const { ...query } = params.query;
    const {
      orientation,
      collectionIds,
      keyword,
      contentFilter,
      color,
      orderBy,
      lang,
    } = query;
    const skip = $skip || 0;
    const limit = $limit || 10;

    // Simulate per-page skip using feathers-style per-record skip.
    // This means skip accuracy is only every $limit number of records.
    const adjustedSkip = Math.floor(skip / limit) + 1;

    return await this.model.search
      .getPhotos({
        perPage: limit,
        page: adjustedSkip,
        query: keyword,
        orientation,
        collectionIds,
        contentFilter,
        color,
        orderBy,
        lang,
      })
      .then(({ type, response, errors, status }) => {
        if (type === "error") {
          throw new GeneralError("UnsplashPhotos error", {
            errors,
            status,
            type,
          });
        }
        return {
          data: response?.results || [],
          limit: response?.results?.length || 0,
          skip,
          total: response?.total || 0,
        };
      });
  }

  async get(id: string, params: Params): Promise<unknown> {
    if (id === "random") {
      params = params || {};
      const query = params.query || {};
      const { keyword, featured, username, collectionIds, topicIds } = query;

      return this.model.photos.getRandom({
        query: keyword,
        featured: !!featured,
        username,
        collectionIds,
        topicIds,
      });
    }
    return this.model.photos
      .get({ photoId: id })
      .then(({ type, errors, response, status }) => {
        if (type === "error") {
          throw new GeneralError("UnsplashPhotos error", {
            errors,
            status,
            type,
          });
        }
        return response;
      });
  }

  create(): void {
    throw new NotImplemented();
  }

  update(): void {
    throw new NotImplemented();
  }

  patch(): void {
    throw new NotImplemented();
  }

  remove(): void {
    throw new NotImplemented();
  }
}
