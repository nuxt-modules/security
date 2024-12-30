import type { BuiltinDriverName, BuiltinDriverOptions } from 'unstorage'
// NOTE : unstorage is not an explicit dependency in package.json
// This causes @nuxt/module-builder to fail when preparing the module for publishing
// The solution is to add unstorage as an external dependency of unbuild
// This is done in the unbuild entry of package.json

export type RequestSizeLimiter = {
  maxRequestSizeInBytes?: number;
  maxUploadFileRequestInBytes?: number;
  throwError?: boolean;
};

export type RateLimiter = {
  tokensPerInterval?: number;
  interval?: string | number;
  driver?: {
    [driverName in BuiltinDriverName]: { 
      name: driverName; 
      options?:  BuiltinDriverOptions[driverName] }
  }[BuiltinDriverName];
  headers?: boolean;
  whiteList?: string[];
  throwError?: boolean;
};

export type XssValidator = {
  /** Array of methods for which the validator will be invoked. 
  @default ['GET', 'POST']
  */
  methods?: Array<HTTPMethod>;
  whiteList?: Record<string, any>;
  escapeHtml?: boolean;
  stripIgnoreTag?: boolean;
  stripIgnoreTagBody?: boolean;
  css?: Record<string, any> | boolean;
  throwError?: boolean;
};

export type BasicAuth = {
  exclude?: string[];
  include?: string[];
  name: string;
  pass: string;
  enabled?: boolean;
  message: string;
}

export type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT' | 'TRACE' | 'OPTIONS' | 'CONNECT' | 'HEAD';

// Cannot use the H3CorsOptions, because it allows unserializable types, such as functions or RegExp.
export type CorsOptions = {
  origin?: '*' | string | string[];
  useRegExp?: boolean;
  methods?: '*' | HTTPMethod[];
  allowHeaders?: '*' | string[];
  exposeHeaders?: '*' | string[];
  credentials?: boolean;
  maxAge?: string | false;
  preflight?: {
      statusCode?: number;
  };
}

export type AllowedHTTPMethods = {
  methods: HTTPMethod[] | '*';
  throwError?: boolean;
}
