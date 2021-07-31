export interface ServiceOptions {
  accessKey?: string;
  headers?: HeadersInit;
  paginate?: { default?: number; max?: number };
}
