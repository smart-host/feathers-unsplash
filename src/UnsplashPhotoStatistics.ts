import { Application } from "@feathersjs/feathers";
import { GeneralError } from "@feathersjs/errors";

import { UnsplashService } from "./common/UnsplashService";
import { ServiceOptions } from "./common/types";

export class UnsplashPhotoStatistics extends UnsplashService {
  constructor(options: ServiceOptions, app?: Application) {
    super(options, app);
  }

  async get(id: string): Promise<unknown> {
    return this.model.photos
      .getStats({ photoId: id })
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
