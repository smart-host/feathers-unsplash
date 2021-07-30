import { createApi } from "unsplash-js";
import { Params, Application } from "@feathersjs/feathers";
import { GeneralError, NotImplemented } from "@feathersjs/errors";

interface Options {
  accessKey?: string;
  headers?: HeadersInit;
  paginate?: { default?: number; max?: number };
}

export class UnsplashTopics {
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
    const { topicIdsOrSlugs, orderBy } = query;

    const topics = topicIdsOrSlugs ? topicIdsOrSlugs.split(",") : undefined;

    // Simulate per-page skip using feathers-style per-record skip.
    // This means skip accuracy is only every $limit number of records.
    const adjustedSkip = Math.floor(skip / limit) + 1;

    return await this.model.topics
      .list({
        perPage: limit,
        page: adjustedSkip,
        topicIdsOrSlugs: topics,
        orderBy,
      })
      .then(({ type, response, errors, status }) => {
        if (type === "error") {
          throw new GeneralError("UnsplashTopics error", {
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

  async get(id: string): Promise<unknown> {
    return this.model.topics
      .get({ topicIdOrSlug: id })
      .then(async ({ type, errors, response, status }) => {
        if (type === "error") {
          throw new GeneralError("UnsplashTopics error", {
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
