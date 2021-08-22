import { Application, Params } from "@feathersjs/feathers";
import { GeneralError, BadRequest } from "@feathersjs/errors";

import { UnsplashService } from "./common/UnsplashService";
import { ServiceOptions } from "./common/types";
import { safeParseInt } from "./common/safeParseInt";

export class UnsplashUsers extends UnsplashService {
  constructor(options: ServiceOptions, app?: Application) {
    super(options, app);
  }

  async find(params: Params): Promise<unknown> {
    const query = params.query || {};
    const {
      $limit,
      $skip,
      query: searchQuery,
      keyword: searchQueryAlias,
    } = query;
    const skip = safeParseInt($skip) || 0;
    const limit = safeParseInt($limit) || 10;
    const keyword = searchQueryAlias || searchQuery;

    if (!keyword) {
      throw new BadRequest(
        "'keyword' parameter is required. eg ?keyword=value"
      );
    }

    // Simulate per-page skip using feathers-style per-record skip.
    // This means skip accuracy is only every $limit number of records.
    const adjustedSkip = Math.floor(skip / limit) + 1;

    return await this.model.search
      .getUsers({
        perPage: limit,
        page: adjustedSkip,
        query: keyword,
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

  async get(id: string): Promise<unknown> {
    return this.model.users
      .get({ username: id })
      .then(async ({ type, errors, response, status }) => {
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
