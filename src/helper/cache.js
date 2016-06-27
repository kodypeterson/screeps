module.exports = {};

module.exports.get = function(cacheID) {
  if (!Memory.cache) {
    Memory.cache = {};
  }

  var obj = Memory.cache[cacheID];
  if (obj) {
    if (obj.expires <= Game.time) {
      delete Memory.cache[cacheID];
      return undefined;
    }
    return obj.data;
  }

  return obj;
};

module.exports.set = function(cacheID, value, ttl) {
  if (!Memory.cache) {
    Memory.cache = {};
  }
  if (!ttl) {
    ttl = 30;
  }

  Memory.cache[cacheID] = {
    data: value,
    expires: (Game.time + ttl)
  };
};
