import { Application, Params } from "@feathersjs/feathers";
import { GeneralError, BadRequest } from "@feathersjs/errors";

import { UnsplashService } from "./UnsplashService";
import { ServiceOptions } from "./types";

export class UnsplashUsers extends UnsplashService {
  constructor(options: ServiceOptions, app?: Application) {
    super(options, app);
  }

  async find(params: Params): Promise<unknown> {
    const { $limit, $skip } = params;
    const skip = $skip || 0;
    const limit = $limit || 10;
    const query = params.query || {};
    const { keyword } = query;

    if (!keyword) {
      throw new BadRequest(
        "Must provide keyword as a query parameter when requesting photos. eg ?keyword=value"
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
