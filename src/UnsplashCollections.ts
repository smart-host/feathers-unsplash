import { Params, Application } from "@feathersjs/feathers";
import { GeneralError } from "@feathersjs/errors";

import { UnsplashService } from "./common/UnsplashService";
import { ServiceOptions } from "./common/types";

export class UnsplashCollections extends UnsplashService {
  constructor(options: ServiceOptions, app?: Application) {
    super(options, app);
  }

  async find(params: Params): Promise<unknown> {
    const { $limit, $skip } = params;
    const skip = $skip || 0;
    const limit = $limit || 10;
    const query = params.query || {};
    const { query: keyword } = query;

    // Simulate per-page skip using feathers-style per-record skip.
    // This means skip accuracy is only every $limit number of records.
    const adjustedSkip = Math.floor(skip / limit) + 1;

    const request = keyword
      ? this.model.search.getCollections({
          perPage: limit,
          page: adjustedSkip,
          query: keyword,
        })
      : this.model.collections.list({
          perPage: limit,
          page: adjustedSkip,
        });

    return await request.then(({ type, response, errors, status }) => {
      if (type === "error") {
        throw new GeneralError(this.errorLabel, {
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
          throw new GeneralError(this.errorLabel, {
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
}
