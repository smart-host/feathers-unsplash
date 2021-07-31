import { createApi } from "unsplash-js";
import { Params, Application } from "@feathersjs/feathers";
import { NotImplemented } from "@feathersjs/errors";

import { ServiceOptions } from "./types";

const noop = (...args: unknown[]) => args;

export class UnsplashService {
  model;
  options: ServiceOptions;
  app: Application | undefined;
  errorLabel = "UnsplashService error";

  constructor(options: ServiceOptions, app?: Application) {
    this.options = options || {};
    this.app = app;

    const { accessKey, headers } = this.options;
    if (!accessKey) {
      throw new Error(
        "You must provide an Unsplash `accessKey` to any Unsplash service"
      );
    }
    this.model = createApi({ accessKey, headers });
  }

  find(params?: Params): Promise<unknown> {
    noop(params);
    throw new NotImplemented();
  }

  get(id: string, params?: Params): Promise<unknown> {
    noop(id, params);
    throw new NotImplemented();
  }

  create(data: unknown, params?: Params): Promise<unknown> {
    noop(data, params);
    throw new NotImplemented();
  }

  update(): Promise<void> {
    throw new NotImplemented();
  }

  patch(): Promise<void> {
    throw new NotImplemented();
  }

  remove(): Promise<void> {
    throw new NotImplemented();
  }
}
