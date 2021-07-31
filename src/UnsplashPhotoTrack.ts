import { Application } from "@feathersjs/feathers";
import { GeneralError } from "@feathersjs/errors";

import { UnsplashService } from "./common/UnsplashService";
import { ServiceOptions } from "./common/types";

interface Data {
  downloadLocation: string;
}

export class UnsplashPhotoTrack extends UnsplashService {
  constructor(options: ServiceOptions, app?: Application) {
    super(options, app);
  }

  async create({ downloadLocation }: Data): Promise<unknown> {
    return await this.model.photos
      .trackDownload({
        downloadLocation,
      })
      .then(({ type, response, errors, status }) => {
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
