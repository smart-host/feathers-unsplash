import { Params, Application } from "@feathersjs/feathers";
import { GeneralError, BadRequest } from "@feathersjs/errors";

import { UnsplashService } from "./common/UnsplashService";
import { ServiceOptions } from "./common/types";

export class UnsplashTopicPhotos extends UnsplashService {
  constructor(options: ServiceOptions, app?: Application) {
    super(options, app);
  }

  async find(params: Params): Promise<unknown> {
    const { $limit, $skip } = params;
    const skip = $skip || 0;
    const limit = $limit || 10;
    const query = params.query || {};
    const { topicIdOrSlug, orderBy, orientation } = query;

    if (!topicIdOrSlug) {
      throw new BadRequest(
        "Must provide topicIdOrSlug as a query parameter when requesting photos. eg ?topicIdOrSlug=value"
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
}
