import { Params, Application } from "@feathersjs/feathers";
import { GeneralError, BadRequest } from "@feathersjs/errors";

import { UnsplashService } from "./common/UnsplashService";
import { ServiceOptions } from "./common/types";
import { safeParseInt } from "./common/safeParseInt";

export class UnsplashPhotos extends UnsplashService {
  constructor(options: ServiceOptions, app?: Application) {
    super(options, app);
  }

  async find(params: Params): Promise<unknown> {
    const { ...query } = params.query;
    const {
      $limit,
      $skip,
      query: keyword,
      orientation,
      collectionIds,
      contentFilter,
      color,
      orderBy,
      lang,
    } = query;
    const skip = safeParseInt($skip) || 0;
    const limit = safeParseInt($limit) || 10;

    if (!keyword) {
      throw new BadRequest("'query' parameter is required. eg ?query=value");
    }

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
          throw new GeneralError(this.errorLabel, {
            errors,
            status,
            type,
          });
        }
        return response;
      });
  }
}
