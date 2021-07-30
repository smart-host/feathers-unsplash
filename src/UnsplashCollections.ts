import { createApi } from "unsplash-js";
import { Params, Application } from "@feathersjs/feathers";
import { GeneralError, NotImplemented } from "@feathersjs/errors";

interface Options {
  accessKey?: string;
  headers?: HeadersInit;
  paginate?: { default?: number; max?: number };
}

export class UnsplashCollections {
  model;
  options: Options;
  app: Application | undefined;

  constructor(options: Options, app?: Application) {
    this.options = options || {};
    this.app = app;

    const { accessKey, headers } = this.options;
    if (!accessKey) {
      throw new Error(
        "You must provide an Unsplash `accessKey` to any Unsplash service"
      );
    }
    this.model = createApi({ accessKey, headers });
  }

  async find(params: Params): Promise<unknown> {
    const { $limit, $skip } = params;
    const skip = $skip || 0;
    const limit = $limit || 10;

    // Simulate per-page skip using feathers-style per-record skip.
    // This means skip accuracy is only every $limit number of records.
    const adjustedSkip = Math.floor(skip / limit) + 1;

    return await this.model.collections
      .list({
        perPage: limit,
        page: adjustedSkip,
      })
      .then(({ type, response, errors, status }) => {
        if (type === "error") {
          throw new GeneralError("UnsplashCollections error", {
            errors,
            status,
            type,
          });
        }
        return {
          limit: response?.results?.length || 0,
          skip,
          total: response?.total || 0,
          data: response?.results || [],
        };
      });
  }

  fetchRelatedCollections(id: string): Promise<unknown> {
    return this.model.collections
      .getRelated({ collectionId: id })
      .then(({ type, response }) => {
        if (type === "error") {
          return [];
        }
        return response;
      });
  }

  async get(id: string, params: Params): Promise<unknown> {
    params = params || {};
    const query = params.query || {};
    const { related } = query;

    return this.model.collections
      .get({ collectionId: id })
      .then(async ({ type, errors, response, status }) => {
        if (type === "error") {
          throw new GeneralError("UnsplashCollections error", {
            errors,
            status,
            type,
          });
        }

        if (!related) {
          return response;
        }

        const relatedCollections = await this.fetchRelatedCollections(id);

        return { ...response, related: relatedCollections };
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
