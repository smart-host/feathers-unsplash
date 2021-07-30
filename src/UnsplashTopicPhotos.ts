import { createApi } from "unsplash-js";
import { Params, Application } from "@feathersjs/feathers";
import { GeneralError, NotImplemented, BadRequest } from "@feathersjs/errors";

interface Options {
  accessKey?: string;
  headers?: HeadersInit;
  paginate?: { default?: number; max?: number };
}

export class UnsplashTopicPhotos {
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
    const query = params.query || {};
    const { id: topicIdOrSlug, orderBy, orientation } = query;

    if (!topicIdOrSlug) {
      throw new BadRequest(
        "Must provide collection id as a query parameter when requesting photos. eg ?id=3737"
      );
    }

    // Simulate per-page skip using feathers-style per-record skip.
    // This means skip accuracy is only every $limit number of records.
    const adjustedSkip = Math.floor(skip / limit) + 1;

    return await this.model.topics
      .getPhotos({
        perPage: limit,
        page: adjustedSkip,
        topicIdOrSlug,
        orderBy,
        orientation,
      })
      .then(({ type, response, errors, status }) => {
        if (type === "error") {
          throw new GeneralError("UnsplashTopicPhotos error", {
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

  get(): void {
    throw new NotImplemented();
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
