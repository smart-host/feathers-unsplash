import { Params, Application } from "@feathersjs/feathers";
import { GeneralError } from "@feathersjs/errors";

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
      query: searchQuery,
      keyword: searchQueryAlias,
      orientation,
      collectionIds,
      contentFilter,
      color,
      orderBy,
      lang,
    } = query;
    const skip = safeParseInt($skip) || 0;
    const limit = safeParseInt($limit) || 10;
    const keyword = searchQueryAlias || searchQuery;

    // Simulate per-page skip using feathers-style per-record skip.
    // This means skip accuracy is only every $limit number of records.
    const adjustedSkip = Math.floor(skip / limit) + 1;

    const request = keyword
      ? this.model.search.getPhotos({
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
      : this.model.photos.list({
          perPage: limit,
          page: adjustedSkip,
          orderBy,
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

  async fetchStats(id: string): Promise<unknown> {
    return this.model.photos
      .getStats({ photoId: id })
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
    const { keyword, featured, username, collectionIds, topicIds, stats } =
      query;

    const shouldJoinStats = stats?.toLowerCase() === "true";

    const request =
      id === "random"
        ? this.model.photos.getRandom({
            query: keyword,
            featured: featured?.toLowerCase() === "true",
            username,
            collectionIds,
            topicIds,
          })
        : this.model.photos.get({ photoId: id });

    return request.then(async ({ type, errors, response, status }) => {
      if (type === "error") {
        throw new GeneralError(this.errorLabel, {
          errors,
          status,
          type,
        });
      }

      if (!shouldJoinStats) {
        return response;
      }
      //eslint-disable-next-line
      const photoResponse = response as Record<string, any>;
      const stats = await this.fetchStats(photoResponse?.id);
      return { ...response, stats };
    });
  }
}
