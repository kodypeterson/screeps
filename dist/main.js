module.exports.loop = function () {
  global.resetRoom = function(roomID) {
    Object.keys(Game.rooms[roomID].memory).forEach(function(key) {
      delete Game.rooms[roomID].memory[key];
    });
    for (var i in Game.creeps) {
      var creep = Game.creeps[i];
      if (creep.room.name === roomID) {
        creep.suicide();
      }
    }
  };
  global.spawnCreep = function(roomID, role) {
    var Queue = require('helper_queue');
    var creepQueue = new Queue('creep', {
      priority: true,
      room: Game.rooms[roomID]
    });
    creepQueue.push('spawn', 0, {
      role: role,
      room: roomID
    });
  };
  global.refreshRoomJobs = function(roomID) {
    Game.rooms[roomID].memory.refreshStructures = true;
  };
  global.resetRoomJobs = function(roomID) {
    delete Game.rooms[roomID].memory.jobs;
    refreshRoomJobs(roomID);
  };

  require('manager_memory')();

  for (var room in Game.rooms) {
    require('manager_room')(Game.rooms[room]);
    require('manager_tower')(Game.rooms[room]);
    require('manager_creep')(Game.rooms[room]);
  }
};
