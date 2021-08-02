import { Params, Application } from "@feathersjs/feathers";
import { GeneralError } from "@feathersjs/errors";

import { UnsplashService } from "./common/UnsplashService";
import { ServiceOptions } from "./common/types";
import { safeParseInt } from "./common/safeParseInt";

export class UnsplashTopics extends UnsplashService {
  constructor(options: ServiceOptions, app?: Application) {
    super(options, app);
  }

  async find(params: Params): Promise<unknown> {
    const query = params.query || {};
    const { $limit, $skip, topicIdsOrSlugs, orderBy } = query;

    const skip = safeParseInt($skip) || 0;
    const limit = safeParseInt($limit) || 10;

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
    return this.model.topics
      .get({ topicIdOrSlug: id })
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
