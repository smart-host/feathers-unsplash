import { createApi } from "unsplash-js";
import { Params } from "@feathersjs/feathers";
import { GeneralError, NotImplemented, BadRequest } from "@feathersjs/errors";

interface Options {
  accessKey?: string;
  headers?: HeadersInit;
}

export class UnsplashCollectionPhotos {
  model;
  options: Options;

  constructor(options: Options) {
    this.options = options || {};

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
    const { ...query } = params.query;

    const { id: collectionId, orderBy, orientation } = query;

    // Simulate per-page skip using feathers-style per-record skip.
    // This means skip accuracy is only every $limit number of records.
    const adjustedSkip = Math.floor(skip / limit) + 1;

    if (!collectionId) {
      throw new BadRequest(
        "Must provide collection id as a query parameter when requesting photos. eg ?id=3737"
      );
    }

    return await this.model.collections
      .getPhotos({
        perPage: limit,
        page: adjustedSkip,
        collectionId,
        orderBy,
        orientation,
      })
      .then(({ type, response, errors, status }) => {
        if (type === "error") {
          throw new GeneralError("UnsplashCollectionPhotos error", {
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

  get(): void {
    throw new NotImplemented();
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
