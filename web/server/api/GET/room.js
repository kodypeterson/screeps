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
      spawnQueueCount: spawnQueueCount
    };
    res.send(roomData);
  })
};
