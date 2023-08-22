"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HTTP_HEADERS = exports.EDGIO_ENV_VARIABLES = exports.PORTS = void 0;

/*
 * Note: All of the constants in this file muust be kept in sync with @edgio/core. But we cannot simply import them
 * from @edgio/core because @edgio/cli should not depend on @edgio/core for two reasons:
 *
 * 1.) It would make the CLI much slower to install
 * 2.) The user needs to be able to run downloaded .zip files without having to install @edgio/core.
 *     In fact, they wouldn't even know which version of core to install, and shouldn't need to since those builds are self-contained.
 */
const port = Number(process.env.PORT) || 3000;
const localhost = '127.0.0.1'; // Note: this must be kept in sync with @edgio/core/utils/ports.ts

const PORTS = {
  port,
  jsPort: port + 1,
  assetPort: port + 2,
  localhost,
  imageOptimizerPort: port + 3,
  localhostWithPort: `${localhost}:${port}`
}; // Note: this must be kept in sync with @edgio/core/constants.ts

exports.PORTS = PORTS;
const EDGIO_ENV_VARIABLES = {
  /**
   * Edgio configuration environment variable key.
   */
  config: 'EDGIO_CONFIG',

  /**
   * Edgio internal configuration environment variable key.
   */
  internalConfig: 'EDGIO_INTERNAL_CONFIG',

  /**
   * Indicates whether code is running locally or in the cloud.
   * @private
   */
  deploymentType: 'EDGIO_DEPLOYMENT_TYPE',

  /**
   * Allows Edgio development team to easily override Edgio version
   * during development process.
   * @private
   */
  versionOverride: 'EDGIO_VERSION_OVERRIDE',

  /**
   * Indicates that we are running a production build.
   * @private
   */
  productionBuild: 'EDGIO_PRODUCTION_BUILD',

  /**
   * Indicates that we are running app locally.
   * @private
   */
  local: 'EDGIO_LOCAL',

  /**
   * Turns on the cache when set to 'true'.
   * @private
   */
  cache: 'EDGIO_CACHE'
};
/**
 * Common HTTP headers.
 */

exports.EDGIO_ENV_VARIABLES = EDGIO_ENV_VARIABLES;
const HTTP_HEADERS = {
  acceptEncoding: 'accept-encoding',
  authorization: 'authorization',
  cacheControl: 'cache-control',
  contentEncoding: 'content-encoding',
  contentLength: 'content-length',
  contentType: 'content-type',
  cookie: 'cookie',
  expires: 'expires',
  host: 'host',
  location: 'location',
  range: 'range',
  serverTiming: 'server-timing',
  setCookie: 'set-cookie',
  userAgent: 'user-agent',
  vary: 'vary',
  via: 'via',
  xEcDebug: 'x-ec-debug',
  xForwardedFor: 'x-forwarded-for',
  xRequestId: 'x-request-id',
  xSwCacheControl: 'x-sw-cache-control',
  xEdgeBrowser: 'x-edg-browser',
  xEdgeCacheControl: 'x-edg-cache-control',
  xEdgeCachingStatus: 'x-edg-caching-status',
  xEdgeClientIp: 'x-edg-client-ip',
  xEdgeComponents: 'x-edg-components',
  xEdgeDestination: 'x-edg-destination',
  xEdgeDevice: 'x-edg-device',
  xEdgeDeviceIsBot: 'x-edg-device-is-bot',
  xEdgeGeoCity: 'x-edg-geo-city',
  xEdgeGeoCountryCode: 'x-edg-geo-country-code',
  xEdgeGeoLatitude: 'x-edg-geo-latitude',
  xEdgeGeoLongitude: 'x-edg-geo-longitude',
  xEdgeGeoPostalCode: 'x-edg-geo-postal-code',
  xEdgeMatchedRoutes: 'x-edg-matched-routes',
  xEdgeProtocol: 'x-edg-protocol',
  xEdgeRoute: 'x-edg-route',
  xEdgeStatus: 'x-edg-status',
  xEdgeSurrogateKey: 'x-edg-surrogate-key',
  xEdgeT: 'x-edg-t',
  xEdgeUserT: 'x-edg-user-t',
  xEdgeVendor: 'x-edg-vendor',
  xEdgeVersion: 'x-edg-version'
};
exports.HTTP_HEADERS = HTTP_HEADERS;