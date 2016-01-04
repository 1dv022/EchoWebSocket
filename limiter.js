'use strict';

var RateLimiter = require('limiter').RateLimiter;
var cache = require('memory-cache');

exports.isLimited = function(ip) {
    var cachedLimiter;
    if (cache.get(ip)) {
        cachedLimiter = cache.get(ip);
        if (cachedLimiter.getTokensRemaining()>1){
            cachedLimiter.removeTokens(1, function(){});
            cache.put(ip, cachedLimiter, 10000);
            return true;
        }
        return false;
    }
    else {
      cachedLimiter = new RateLimiter(3, 'min');
      cache.put(ip, cachedLimiter, 10000);
      return true;
    }
};
