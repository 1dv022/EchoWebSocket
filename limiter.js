'use strict';

var RateLimiter = require('limiter').RateLimiter;
var cache = require('memory-cache');

exports.isLimited = function(req) {
    var cachedLimiter;
    if (cache.get(req.ip)) {
        cachedLimiter = cache.get(req.ip);
        if (cachedLimiter.getTokensRemaining()>1){
            cachedLimiter.removeTokens(1, function(){});
            cache.put(req.ip, cachedLimiter, 10000);
            return true;
        }
        return false;
    }
    else {
      cachedLimiter = new RateLimiter(30, 'min');
      cache.put(req.ip, cachedLimiter, 10000);
      return true;
    }
};
