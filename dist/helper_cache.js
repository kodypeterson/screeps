module.exports = {};

module.exports.get = function(room, cacheID) {
  if (!room.memory.cache) {
    room.memory.cache = {};
  }

  var obj = room.memory.cache[cacheID];
  if (obj) {
    if (obj.expires !== -1 && obj.expires <= Game.time) {
      delete room.memory.cache[cacheID];
      return undefined;
    }
    return obj.data;
  }

  return obj;
};

module.exports.set = function(room, cacheID, value, ttl) {
  if (!room.memory.cache) {
    room.memory.cache = {};
  }
  if (!ttl) {
    ttl = 30;
  }

  room.memory.cache[cacheID] = {
    data: value,
    expires: (Game.time + ttl)
  };
  if (ttl === -1) {
    room.memory.cache[cacheID].expires = ttl;
  }
};

module.exports.invalidate = function(room, cacheID) {
  if (!room.memory.cache) {
    room.memory.cache = {};
  }

  delete room.memory.cache[cacheID];
};
