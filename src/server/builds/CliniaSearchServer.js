'use strict';

// Some methods only accessible server side

module.exports = CliniaSearchServer;

var inherits = require('inherits');

var CliniaSearch = require('../../CliniaSearch');

function CliniaSearchServer(applicationID, apiKey, opts) {
  // Default protocol is https: on the server, to avoid leaking admin keys
  if (opts.protocol === undefined) {
    opts.protocol = 'https:';
  }

  CliniaSearch.apply(this, arguments);
}

inherits(CliniaSearchServer, CliniaSearch);

/*
 * Allow to use IP rate limit when you have a proxy between end-user and Clinia.
 * This option will set the X-Forwarded-For HTTP header with the client IP and the X-Forwarded-API-Key with the API Key having rate limits.
 * @param adminAPIKey the admin API Key you can find in your dashboard
 * @param endUserIP the end user IP (you can use both IPV4 or IPV6 syntax)
 * @param rateLimitAPIKey the API key on which you have a rate limit
 */
CliniaSearchServer.prototype.enableRateLimitForward = function(
  adminAPIKey,
  endUserIP,
  rateLimitAPIKey
) {
  this._forward = {
    adminAPIKey: adminAPIKey,
    endUserIP: endUserIP,
    rateLimitAPIKey: rateLimitAPIKey
  };
};

/*
 * Disable IP rate limit enabled with enableRateLimitForward() function
 */
CliniaSearchServer.prototype.disableRateLimitForward = function() {
  this._forward = null;
};

/*
 * Specify the securedAPIKey to use with associated information
 */
CliniaSearchServer.prototype.useSecuredAPIKey = function(
  securedAPIKey,
  securityTags,
  userToken
) {
  this._secure = {
    apiKey: securedAPIKey,
    securityTags: securityTags,
    userToken: userToken
  };
};

/*
 * If a secured API was used, disable it
 */
CliniaSearchServer.prototype.disableSecuredAPIKey = function() {
  this._secure = null;
};

CliniaSearchServer.prototype._computeRequestHeaders = function(additionalUA) {
  var headers = CliniaSearchServer.super_.prototype._computeRequestHeaders.call(
    this,
    additionalUA
  );

  if (this._forward) {
    headers['x-clinia-api-key'] = this._forward.adminAPIKey;
    headers['x-forwarded-for'] = this._forward.endUserIP;
    headers['x-forwarded-api-key'] = this._forward.rateLimitAPIKey;
  }

  if (this._secure) {
    headers['x-clinia-api-key'] = this._secure.apiKey;
    headers['x-clinia-tagfilters'] = this._secure.securityTags;
    headers['x-clinia-usertoken'] = this._secure.userToken;
  }

  return headers;
};
