module.exports = function(req, res) {
  var Promise = require('bluebird');
  var screeps = require('../helpers/screeps-api')();

  if (!req.query.room) {
    return res.status(500).send({
      error: 'Missing room param'
    })
  }

  var promises = [
    screeps.memory({path: 'rooms.' + req.query.room}),
    screeps.time()
  ];

  Promise.all(promises).spread(function(room, time) {
    var spawnQueueCount = 0;
    var code = 'green';
    var status = 'All is Normal!';

    var totalStorageCapacity = 0;
    var totalStoredEnergy = 0;
    var storageCount = 0;
    var storageTypes = [];
    if (!room.data.cache.structures.data.storage && !room.data.cache.structures.data.container) {
      storageTypes.push('extension');
      storageTypes.push('spawn');
    } else {
      storageTypes.push('storage');
      storageTypes.push('container');
    }
    storageTypes.forEach(function(type) {
      for (var id in room.data.cache.structures.data[type + '_details']) {
        var cont = room.data.cache.structures.data[type + '_details'][id];
        totalStorageCapacity += cont.capacity;
        totalStoredEnergy += cont.store.energy;
        storageCount++;
      }
    });

    if (totalStoredEnergy < totalStorageCapacity/(2 * storageCount)) {
      code = 'yellow';
      status = 'Energy Storage Low!';
    }

    room.data.queues.creep.forEach(function(queue) {
      spawnQueueCount += queue.length;
    });
    var roomData = {
      gameTime: time.time,
      lastUpdate: room.data.lastUpdate,
      nextUpdate: (room.data.lastUpdate + 30) - time.time,
      jobCount: Object.keys(room.data.jobs.list).length,
      emptyRoom: room.data.emptyRoom,
      emptyRoomSpawned: room.data.spawnedEmptyRoom,
      spawnQueueCount: spawnQueueCount,
      totalStoredEnergy: totalStoredEnergy,
      totalStorageCapacity: totalStorageCapacity,
      code: code,
      status: status
    };
    res.send(roomData);
  })
};
